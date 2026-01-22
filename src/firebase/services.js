import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from './config';

// Collections
const AUDITS_COLLECTION = 'audits';
const REPORTS_COLLECTION = 'reports';

// Photos are stored directly as base64 in Firestore (no Storage needed)

// Audits
export const saveAudit = async (auditData) => {
  try {
    const docRef = await addDoc(collection(db, AUDITS_COLLECTION), {
      ...auditData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...auditData };
  } catch (error) {
    console.error('Error saving audit:', error);
    throw error;
  }
};

export const getAudits = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, AUDITS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting audits:', error);
    return [];
  }
};

export const getAuditsByCampus = async (campusName, limitCount = 20) => {
  try {
    const q = query(
      collection(db, AUDITS_COLLECTION),
      where('campus', '==', campusName),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting audits by campus:', error);
    return [];
  }
};

// Reports
export const saveReport = async (reportData) => {
  try {
    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...reportData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...reportData };
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

export const getReports = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting reports:', error);
    return [];
  }
};

export const updateReportStatus = async (reportId, status) => {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, { status, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

export const getOpenReports = async () => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where('status', '==', 'open'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting open reports:', error);
    return [];
  }
};
