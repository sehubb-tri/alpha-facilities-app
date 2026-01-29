// Mechanical Systems Quality Bar (14.11)
// Tier 3: Human-Verified Standard
// Simplified for manual inspection without BAS/IoT systems

// ============================================
// RAG RATING RULES
// ============================================
export const MECHANICAL_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES',
      'Zero comfort complaints in past 30 days',
      'All PM schedules current',
      'No safety hazards identified'
    ]
  },
  amber: {
    description: 'At Risk',
    criteria: [
      'Minor issues identified with remediation plan',
      'Single comfort complaint being addressed',
      'PM slightly overdue (<2 weeks)',
      'No INSTANT RED items failed'
    ],
    maxOpenIssues: 3,
    maxDaysToFix: 7
  },
  red: {
    description: 'Not Meeting Standard',
    criteria: [
      'Any INSTANT RED item failed',
      'Safety hazard identified',
      'Multiple comfort complaints',
      'System failure affecting occupied spaces',
      'PM significantly overdue (>2 weeks)'
    ]
  }
};

// ============================================
// INSTANT RED ITEMS
// These cannot be Amber - NO answer = automatic RED
// ============================================
export const INSTANT_RED_CHECKS = [
  // HVAC Safety
  'hvac_no_stuffiness',
  'hvac_no_mold',
  // Plumbing Safety
  'plumbing_no_leaks',
  'plumbing_no_discolored_water',
  'plumbing_no_sewage_odor',
  // Electrical Safety
  'electrical_no_hazards',
  'electrical_exit_signs_work',
  'electrical_emergency_lights_work',
  // Specialty Safety
  'specialty_cooler_temp_safe',
  'specialty_freezer_temp_safe',
  'specialty_elevator_safe'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  'hvac_no_mold',
  'plumbing_no_leaks',
  'electrical_no_hazards',
  'specialty_cooler_temp_safe',
  'specialty_freezer_temp_safe'
];

// ============================================
// MECHANICAL ZONES (SECTIONS)
// ============================================
export const MECHANICAL_ZONES = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Mechanical Systems Check',
    frequency: 'weekly',
    order: 1,
    description: 'Human-verified inspection of all mechanical systems',
    timeNeeded: '30-45 minutes',
    persona: 'Campus Manager or Facilities Staff',
    sections: [
      {
        name: 'A. HVAC - Thermal Comfort & Air Quality',
        description: 'Check that rooms are comfortable and air is fresh.',
        checks: [
          {
            id: 'hvac_temp_comfortable',
            text: 'Are all occupied rooms at a comfortable temperature (not too hot, not too cold)?',
            helpText: 'Walk through classrooms and common areas. Target: 70-74°F in classrooms, 68-76°F in common areas.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_no_hot_cold_spots',
            text: 'Are there NO hot or cold spots reported by staff or students?',
            helpText: 'Check with staff if anyone has complained about specific areas being uncomfortable.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_no_stuffiness',
            text: 'Is the air fresh and NOT stuffy in all occupied spaces?',
            helpText: 'Stuffy air = poor ventilation = cognitive impact. If air feels heavy or stale, this is RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'hvac_no_odors',
            text: 'Are all spaces free of unusual odors?',
            helpText: 'No musty, chemical, or stale smells. Odors may indicate mold, poor ventilation, or other issues.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_no_mold',
            text: 'Is there NO visible mold, condensation on vents, or moisture on windows/walls?',
            helpText: 'Check vents, window frames, and walls. Any mold is an INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'hvac_vents_working',
            text: 'Is air flowing from vents? (Use tissue paper test)',
            helpText: 'Hold tissue near vent - it should move. No airflow = system issue.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_no_unusual_noise',
            text: 'Are HVAC units running quietly (no rattling, buzzing, or squealing)?',
            helpText: 'Unusual noises may indicate mechanical problems that need attention.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_thermostats_working',
            text: 'Are thermostats displaying correctly and responding to adjustments?',
            helpText: 'Check that displays are on and setpoints can be changed.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_filters_clean',
            text: 'Have air filters been checked/replaced within the last 90 days?',
            helpText: 'Check filter log or visually inspect if accessible. Dirty filters reduce air quality.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'hvac_mechanical_room_clean',
            text: 'Are mechanical rooms clean, accessible, and free of stored items?',
            helpText: 'No clutter, clear pathways, no water on floor.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Plumbing - Water Safety & Leak Defense',
        description: 'Verify water quality and check for leaks.',
        checks: [
          {
            id: 'plumbing_hot_water_fast',
            text: 'Does hot water arrive at taps within 10 seconds?',
            helpText: 'Test at the farthest sink from the water heater. Slow = recirculation pump issue.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_water_temp_safe',
            text: 'Is hot water warm but not scalding at sinks?',
            helpText: 'Should feel comfortably warm, not dangerously hot.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_fountains_cold',
            text: 'Is water from drinking fountains cold and refreshing (not warm or tepid)?',
            helpText: 'Water should be noticeably cool, under 60°F ideally.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_no_discolored_water',
            text: 'Is all water clear (not discolored, rusty, or cloudy)?',
            helpText: 'Run water briefly at multiple fixtures. Any discoloration is INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'plumbing_no_bad_taste',
            text: 'Is water from fountains free of metallic taste or unusual flavor?',
            helpText: 'Bad taste may indicate pipe issues or filter problems.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_no_sewage_odor',
            text: 'Are all areas free of sewage or drain odors?',
            helpText: 'Sewage smell = dry P-trap or plumbing issue. INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'plumbing_no_leaks',
            text: 'Are there NO active leaks anywhere (under sinks, toilets, ceilings)?',
            helpText: 'Check under sinks, around toilets, ceiling tiles. Any active leak is INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'plumbing_no_running_toilets',
            text: 'Are all toilets flushing properly and NOT running continuously?',
            helpText: 'Listen for running water. Continuous running = wasted water and potential issue.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_drains_clear',
            text: 'Are all drains flowing freely (no slow drains or backups)?',
            helpText: 'Water should drain quickly without pooling.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'plumbing_monday_flush_done',
            text: 'Was the Monday Morning Flush completed before students arrived?',
            helpText: 'Run all fixtures for 1-2 minutes every Monday to clear stagnant water.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'C. Electrical & Lighting - Visual Quality & Safety',
        description: 'Check that lighting is adequate and electrical systems are safe.',
        checks: [
          {
            id: 'electrical_all_lights_work',
            text: 'Are ALL lights working (no dead bulbs or dark areas)?',
            helpText: 'Walk through all spaces. Every light should be on and functional.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_no_flickering',
            text: 'Are lights free of visible flickering?',
            helpText: 'Flickering can cause eye strain and headaches. Replace affected bulbs/fixtures.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_no_buzzing',
            text: 'Are lights and fixtures free of buzzing or humming sounds?',
            helpText: 'Buzzing may indicate ballast issues or loose connections.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_adequate_brightness',
            text: 'Is lighting bright enough for all activities (no dark corners)?',
            helpText: 'Classrooms should have even, adequate light for reading and work.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_color_consistent',
            text: 'Are light colors consistent (no mismatched warm/cool bulbs)?',
            helpText: 'All bulbs in a room should be the same color temperature.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_exit_signs_work',
            text: 'Are ALL exit signs illuminated and visible?',
            helpText: 'Every exit sign must be lit. Dark exit signs are an INSTANT RED safety issue.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'electrical_emergency_lights_work',
            text: 'Do emergency lights turn on when tested (push test button)?',
            helpText: 'Test monthly. Press and hold test button - lights should illuminate.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'electrical_no_hazards',
            text: 'Are there NO electrical hazards (exposed wires, broken outlets, daisy-chained power strips)?',
            helpText: 'Check outlets, switches, and power cords. Any exposed wiring is INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'electrical_panels_accessible',
            text: 'Are electrical panels accessible with 3ft clearance and properly labeled?',
            helpText: 'Nothing stored in front of panels. Labels should be legible.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'electrical_no_hot_panels',
            text: 'Are electrical panels cool to the touch (not warm or hot)?',
            helpText: 'Carefully check panel door temperature. Hot panels need immediate attention.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'D. Specialty Systems - Cold Chain & Elevators',
        description: 'Verify kitchen refrigeration and elevator safety.',
        checks: [
          {
            id: 'specialty_cooler_temp_safe',
            text: 'Are refrigerators/coolers at safe temperature (35-38°F)?',
            helpText: 'Check thermometer in each unit. Above 41°F for >2 hours = food safety risk = INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'specialty_freezer_temp_safe',
            text: 'Are freezers at safe temperature (0°F or below)?',
            helpText: 'Check thermometer. Signs of thaw/refreeze (ice crystals on food) = INSTANT RED.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'specialty_cooler_door_seals',
            text: 'Do refrigerator/freezer door seals close tightly? (Dollar bill test)',
            helpText: 'Close door on dollar bill - it should hold firm. Loose seal = energy waste and temp issues.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_cooler_coils_clean',
            text: 'Are refrigerator/freezer coils free of ice buildup and dust?',
            helpText: 'Check visible coils for frost buildup or heavy dust accumulation.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_temp_logs_current',
            text: 'Are temperature logs being recorded twice daily (AM/PM)?',
            helpText: 'Check log sheet. Missing entries indicate process failure.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_elevator_smooth',
            text: 'Does the elevator operate smoothly (no jerking, grinding, or unusual sounds)?',
            helpText: 'Take a test ride. Should accelerate and stop smoothly.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_elevator_levels',
            text: 'Does the elevator stop level with the floor (within 1/4 inch)?',
            helpText: 'Check gap between elevator floor and building floor. Large gaps are trip hazards.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_elevator_safe',
            text: 'Do elevator doors open/close properly and emergency phone/alarm work?',
            helpText: 'Test emergency phone - should connect to monitoring. INSTANT RED if not working.',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'specialty_elevator_certificate',
            text: 'Is the elevator inspection certificate current and posted?',
            helpText: 'Check certificate in elevator cab. Expired certificate = compliance issue.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'specialty_elevator_clean',
            text: 'Is the elevator cab clean, well-lit, and buttons working?',
            helpText: 'All buttons should illuminate and function. Interior should be clean.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'E. Preventive Maintenance Status',
        description: 'Confirm PM schedules are current for all systems.',
        checks: [
          {
            id: 'pm_hvac_scheduled',
            text: 'Is preventive maintenance scheduled and current for HVAC systems?',
            helpText: 'Check PM records - filters, belts, coils should be serviced on schedule.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'pm_plumbing_scheduled',
            text: 'Is preventive maintenance scheduled and current for plumbing systems?',
            helpText: 'Water heater flush, backflow testing, etc. should be documented.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'pm_electrical_scheduled',
            text: 'Is preventive maintenance scheduled and current for electrical systems?',
            helpText: 'Panel inspections, emergency light battery tests, etc.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'pm_refrigeration_scheduled',
            text: 'Is preventive maintenance scheduled and current for refrigeration equipment?',
            helpText: 'Compressor service, coil cleaning, gasket replacement.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'pm_elevator_scheduled',
            text: 'Is preventive maintenance scheduled and current for elevators?',
            helpText: 'Elevator service contract should include regular maintenance visits.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  }
};

// Zone order for navigation
export const MECHANICAL_ZONE_ORDER = ['weekly'];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = MECHANICAL_ZONES[zoneId];
  if (!zone || !zone.sections) return [];

  return zone.sections.flatMap(section =>
    section.checks.map(check => ({
      ...check,
      section: section.name
    }))
  );
};

// Helper to check if a check is instant red
export const isInstantRed = (checkId) => {
  return INSTANT_RED_CHECKS.includes(checkId);
};

// Helper to check if photo is required for a check
export const isPhotoRequired = (checkId) => {
  return PHOTO_REQUIRED_CHECKS.includes(checkId);
};

// Helper to calculate zone rating
export const calculateZoneRating = (zoneId, results, issues) => {
  const checks = getZoneChecks(zoneId);

  // Get failed checks (NO answers)
  const failedChecks = checks.filter(check => results[check.id] === false);

  if (failedChecks.length === 0) {
    return 'GREEN';
  }

  // Check for any instant red items
  const hasInstantRed = failedChecks.some(check => check.instantRed);
  if (hasInstantRed) {
    return 'RED';
  }

  // Check issue count
  const openIssues = issues.filter(i => i.status === 'open');

  if (openIssues.length > MECHANICAL_RAG_RULES.amber.maxOpenIssues) {
    return 'RED';
  }

  // All failed checks are amber-eligible and within limits
  return 'AMBER';
};

// Summary of sections for display
export const MECHANICAL_SECTIONS_SUMMARY = [
  { id: 'hvac', name: 'HVAC', icon: '🌡️', description: 'Thermal Comfort & Air Quality' },
  { id: 'plumbing', name: 'Plumbing', icon: '🚿', description: 'Water Safety & Leak Defense' },
  { id: 'electrical', name: 'Electrical', icon: '💡', description: 'Lighting Quality & Safety' },
  { id: 'specialty', name: 'Specialty', icon: '❄️', description: 'Cold Chain & Elevators' },
  { id: 'pm', name: 'PM Status', icon: '🔧', description: 'Preventive Maintenance' }
];

// Total questions: 45
// INSTANT RED items = automatic RED rating if answered NO
