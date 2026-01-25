import { supabase } from './config';

// ============================================
// PHOTO UPLOAD
// ============================================

// Helper to convert base64 to blob properly
const base64ToBlob = (base64Data) => {
  // Handle data URL format
  let base64 = base64Data;
  let mimeType = 'image/jpeg';

  if (base64Data.includes(',')) {
    const parts = base64Data.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) {
      mimeType = mimeMatch[1];
    }
    base64 = parts[1];
  }

  // Decode base64 using fetch API (more reliable than atob for binary data)
  return fetch(`data:${mimeType};base64,${base64}`)
    .then(res => res.blob());
};

// Helper to compress image if it's too large
const compressIfNeeded = async (base64Data, maxSizeKB = 500) => {
  const sizeKB = (base64Data.length * 3) / 4 / 1024; // Approximate size

  if (sizeKB <= maxSizeKB) {
    return base64Data;
  }

  console.log(`[uploadPhoto] Image too large (${Math.round(sizeKB)}KB), compressing...`);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down proportionally
      const scaleFactor = Math.sqrt(maxSizeKB / sizeKB);
      width = Math.floor(width * scaleFactor);
      height = Math.floor(height * scaleFactor);

      // Minimum dimensions
      width = Math.max(width, 400);
      height = Math.max(height, 300);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      console.log(`[uploadPhoto] Compressed to ${Math.round((compressed.length * 3) / 4 / 1024)}KB`);
      resolve(compressed);
    };
    img.onerror = () => resolve(base64Data);
    img.src = base64Data;
  });
};

export const uploadPhoto = async (base64Data, folder = 'reports', retries = 3) => {
  if (!base64Data) {
    console.error('[uploadPhoto] No image data provided');
    return null;
  }

  // Compress if too large before uploading
  const compressedData = await compressIfNeeded(base64Data);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[uploadPhoto] Attempt ${attempt}/${retries} for folder: ${folder}`);

      // Convert base64 to blob using fetch API (more reliable)
      const blob = await base64ToBlob(compressedData);
      console.log(`[uploadPhoto] Created blob, size: ${blob.size} bytes`);

      // Generate unique filename
      const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('photos')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error(`[uploadPhoto] Supabase error on attempt ${attempt}:`, error);
        if (attempt === retries) throw error;
        // Wait before retry
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(filename);

      console.log('[uploadPhoto] Success! URL:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error(`[uploadPhoto] Error on attempt ${attempt}:`, error);

      if (attempt === retries) {
        // IMPORTANT: Don't return base64 data - it's too large and will break localStorage
        // Instead, return a placeholder URL or null
        console.error('[uploadPhoto] All retries failed, returning null instead of base64');
        return null;
      }

      // Wait before retry
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }

  return null;
};

// ============================================
// AUDITS
// ============================================
export const saveAudit = async (auditData) => {
  try {
    console.log('[saveAudit] Starting save...');
    console.log('[saveAudit] conditionAlertDetails from auditData:', auditData.conditionAlertDetails);

    // Upload condition alert photos if any (supports multiple photos per alert)
    const conditionAlertDetails = [];
    for (const alert of (auditData.conditionAlertDetails || [])) {
      const alertPhotos = alert.photos || [];
      console.log('[saveAudit] Processing alert:', {
        zoneId: alert.zoneId,
        photoCount: alertPhotos.length
      });

      // Upload all photos for this alert
      const uploadedPhotos = [];
      for (const photo of alertPhotos) {
        if (photo && photo.startsWith('data:')) {
          console.log('[saveAudit] Uploading photo for zone:', alert.zoneId);
          const photoUrl = await uploadPhoto(photo, 'condition-alerts');
          console.log('[saveAudit] Upload result:', photoUrl?.substring(0, 80));
          uploadedPhotos.push(photoUrl);
        } else if (photo) {
          // Already a URL
          uploadedPhotos.push(photo);
        }
      }

      conditionAlertDetails.push({ ...alert, photos: uploadedPhotos });
    }

    console.log('[saveAudit] Final conditionAlertDetails:', conditionAlertDetails);

    const { data, error } = await supabase
      .from('audits')
      .insert([{
        date: auditData.date,
        time: auditData.time,
        campus: auditData.campus,
        auditor: auditData.auditor,
        auditor_email: auditData.auditorEmail,
        status: auditData.status,
        defects: auditData.defects,
        zones: auditData.zones,
        duration: auditData.duration,
        tour_ready: auditData.tourReady,
        condition_alerts_count: auditData.conditionAlerts,
        zone_results: auditData.zoneResults,
        condition_alert_details: conditionAlertDetails,
        campus_data: auditData.campusData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving audit:', error);
    throw error;
  }
};

export const getAudits = async (limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    // Map snake_case to camelCase for compatibility
    return (data || []).map(audit => ({
      id: audit.id,
      date: audit.date,
      time: audit.time,
      campus: audit.campus,
      auditor: audit.auditor,
      auditorEmail: audit.auditor_email,
      status: audit.status,
      defects: audit.defects,
      zones: audit.zones,
      duration: audit.duration,
      tourReady: audit.tour_ready,
      conditionAlerts: audit.condition_alerts_count,
      zoneResults: audit.zone_results,
      conditionAlertDetails: audit.condition_alert_details,
      campusData: audit.campus_data,
      createdAt: audit.created_at
    }));
  } catch (error) {
    console.error('Error getting audits:', error);
    return [];
  }
};

export const getAuditsByCampus = async (campusName, limitCount = 20) => {
  try {
    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('campus', campusName)
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting audits by campus:', error);
    return [];
  }
};

// ============================================
// REPORTS
// ============================================
export const saveReport = async (reportData) => {
  try {
    // Upload photo if present
    let photoUrl = reportData.photo;
    if (reportData.photo && reportData.photo.startsWith('data:')) {
      photoUrl = await uploadPhoto(reportData.photo, 'reports');
    }

    const { data, error } = await supabase
      .from('reports')
      .insert([{
        timestamp: reportData.timestamp,
        campus: reportData.campus,
        photo: photoUrl,
        category: reportData.category,
        location: reportData.location,
        note: reportData.note,
        urgent: reportData.urgent,
        team: reportData.team,
        status: reportData.status,
        campus_data: reportData.campusData
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

export const getReports = async (limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    // Map snake_case to camelCase for compatibility
    return (data || []).map(report => ({
      id: report.id,
      timestamp: report.timestamp,
      campus: report.campus,
      photo: report.photo,
      category: report.category,
      location: report.location,
      note: report.note,
      urgent: report.urgent,
      team: report.team,
      status: report.status,
      campusData: report.campus_data,
      createdAt: report.created_at
    }));
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};

export const updateReportStatus = async (reportId, status) => {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

export const getOpenReports = async () => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting open reports:', error);
    return [];
  }
};

// ============================================
// ZONE PHOTOS (See It, Report It from Checklist)
// ============================================
export const saveZonePhotos = async (photosData) => {
  try {
    const {
      photos,       // Array of base64 photo strings
      auditId,      // Optional - link to audit if available
      campus,       // Campus name
      zoneId,       // Zone ID
      zoneName,     // Zone name for display
      auditor,      // Auditor name
      campusData    // Full campus metadata
    } = photosData;

    const savedPhotos = [];

    // Upload each photo and save to database
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];

      // Upload photo to storage
      let photoUrl = photo;
      if (photo && photo.startsWith('data:')) {
        photoUrl = await uploadPhoto(photo, 'zone-photos');
      }

      // Insert record
      const { data, error } = await supabase
        .from('zone_photos')
        .insert([{
          audit_id: auditId || null,
          campus,
          zone_id: zoneId,
          zone_name: zoneName,
          auditor,
          photo_url: photoUrl,
          photo_order: i + 1,
          campus_data: campusData || {}
        }])
        .select()
        .single();

      if (error) throw error;
      savedPhotos.push(data);
    }

    return savedPhotos;
  } catch (error) {
    console.error('Error saving zone photos:', error);
    throw error;
  }
};

export const getZonePhotosByAudit = async (auditId) => {
  try {
    const { data, error } = await supabase
      .from('zone_photos')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting zone photos:', error);
    return [];
  }
};

export const getZonePhotosByCampus = async (campus, limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('zone_photos')
      .select('*')
      .eq('campus', campus)
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting zone photos by campus:', error);
    return [];
  }
};

export const getRecentZonePhotos = async (limitCount = 50) => {
  try {
    const { data, error } = await supabase
      .from('zone_photos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting recent zone photos:', error);
    return [];
  }
};

// ============================================
// B&G WALKTHROUGHS (Weekly Building & Grounds)
// ============================================
export const saveBGWalkthrough = async (walkthroughData) => {
  try {
    console.log('[saveBGWalkthrough] Starting save...');

    // Upload issue photos
    const processedIssues = [];
    for (const issue of (walkthroughData.issues || [])) {
      const uploadedPhotos = [];
      for (const photo of (issue.photos || [])) {
        if (photo && photo.startsWith('data:')) {
          const photoUrl = await uploadPhoto(photo, 'bg-issues');
          uploadedPhotos.push(photoUrl);
        } else if (photo) {
          uploadedPhotos.push(photo);
        }
      }
      processedIssues.push({ ...issue, photos: uploadedPhotos });
    }

    // Upload observation photos
    const processedObservations = [];
    for (const obs of (walkthroughData.observations || [])) {
      const uploadedPhotos = [];
      for (const photo of (obs.photos || [])) {
        if (photo && photo.startsWith('data:')) {
          const photoUrl = await uploadPhoto(photo, 'bg-observations');
          uploadedPhotos.push(photoUrl);
        } else if (photo) {
          uploadedPhotos.push(photo);
        }
      }
      processedObservations.push({ ...obs, photos: uploadedPhotos });
    }

    // Upload exit photos
    const processedExitPhotos = {};
    for (const [zoneId, photo] of Object.entries(walkthroughData.exitPhotos || {})) {
      if (photo && photo.startsWith('data:')) {
        processedExitPhotos[zoneId] = await uploadPhoto(photo, 'bg-exit');
      } else if (photo) {
        processedExitPhotos[zoneId] = photo;
      }
    }

    const { data, error } = await supabase
      .from('bg_walkthroughs')
      .insert([{
        date: walkthroughData.date,
        time: walkthroughData.time,
        campus: walkthroughData.campus,
        auditor: walkthroughData.auditor,
        auditor_email: walkthroughData.auditorEmail,
        duration: walkthroughData.duration,
        campus_rating: walkthroughData.campusRating,
        zone_ratings: walkthroughData.zoneRatings,
        zone_results: walkthroughData.zoneResults,
        room_results: walkthroughData.roomResults,
        selected_rooms: walkthroughData.selectedRooms,
        issues: processedIssues,
        observations: processedObservations,
        exit_photos: processedExitPhotos,
        total_issues: walkthroughData.totalIssues,
        total_observations: walkthroughData.totalObservations,
        green_zones: walkthroughData.greenZones,
        amber_zones: walkthroughData.amberZones,
        red_zones: walkthroughData.redZones,
        campus_data: walkthroughData.campusData,
        start_time: walkthroughData.startTime,
        end_time: walkthroughData.endTime,
        is_complete: true
      }])
      .select()
      .single();

    if (error) throw error;
    console.log('[saveBGWalkthrough] Saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error saving B&G walkthrough:', error);
    throw error;
  }
};

export const getBGWalkthroughs = async (campusName = null, limitCount = 50) => {
  try {
    let query = supabase
      .from('bg_walkthroughs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limitCount);

    if (campusName) {
      query = query.eq('campus', campusName);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Map snake_case to camelCase for compatibility
    return (data || []).map(w => ({
      id: w.id,
      date: w.date,
      time: w.time,
      campus: w.campus,
      auditor: w.auditor,
      auditorEmail: w.auditor_email,
      duration: w.duration,
      campusRating: w.campus_rating,
      zoneRatings: w.zone_ratings,
      zoneResults: w.zone_results,
      roomResults: w.room_results,
      selectedRooms: w.selected_rooms,
      issues: w.issues,
      observations: w.observations,
      exitPhotos: w.exit_photos,
      totalIssues: w.total_issues,
      totalObservations: w.total_observations,
      greenZones: w.green_zones,
      amberZones: w.amber_zones,
      redZones: w.red_zones,
      campusData: w.campus_data,
      startTime: w.start_time,
      endTime: w.end_time,
      isComplete: w.is_complete,
      createdAt: w.created_at
    }));
  } catch (error) {
    console.error('Error getting B&G walkthroughs:', error);
    return [];
  }
};

export const getBGWalkthroughById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('bg_walkthroughs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      date: data.date,
      time: data.time,
      campus: data.campus,
      auditor: data.auditor,
      auditorEmail: data.auditor_email,
      duration: data.duration,
      campusRating: data.campus_rating,
      zoneRatings: data.zone_ratings,
      zoneResults: data.zone_results,
      roomResults: data.room_results,
      selectedRooms: data.selected_rooms,
      issues: data.issues,
      observations: data.observations,
      exitPhotos: data.exit_photos,
      totalIssues: data.total_issues,
      totalObservations: data.total_observations,
      greenZones: data.green_zones,
      amberZones: data.amber_zones,
      redZones: data.red_zones,
      campusData: data.campus_data,
      startTime: data.start_time,
      endTime: data.end_time,
      isComplete: data.is_complete,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error getting B&G walkthrough by ID:', error);
    return null;
  }
};
