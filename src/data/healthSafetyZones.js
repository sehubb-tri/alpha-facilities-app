// Health & Safety Checklist - 14.03
// Based on Joshua Rockers' Health & Safety Quality Bar

// ============================================
// RAG RATING RULES
// ============================================
export const HEALTH_SAFETY_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES',
      'No open issues from previous checks',
      'All Life-Critical [LC] items passing',
      'Weekly checks completed consistently'
    ]
  },
  amber: {
    description: 'At Risk',
    criteria: [
      'No more than 2 open issues across all checks',
      'Each issue has a named owner assigned',
      'Each issue has a fix date within 30 days',
      'No Life-Critical [LC] items failed',
      'Compensating controls documented for any deviation'
    ],
    maxOpenIssues: 2,
    maxDaysToFix: 30
  },
  red: {
    description: 'Not Meeting Standard',
    criteria: [
      'Any Life-Critical [LC] item failed',
      'More than 2 open issues at once',
      'Any issue has been open longer than 30 days',
      'Any issue has no owner or no fix date assigned',
      'High-risk student without current IHCP/EAP or rescue meds'
    ]
  }
};

// ============================================
// INSTANT RED ITEMS (Life-Critical)
// These cannot be Amber - NO answer = automatic RED
// ============================================
export const INSTANT_RED_CHECKS = [
  // Medical Documentation
  'high_risk_ihcp_eap',
  // Equipment - AEDs
  'aed_present_ready',
  'aed_pads_batteries',
  // Equipment - Medications
  'rescue_meds_onsite',
  'meds_unexpired',
  // Spaces - Emergency Exits
  'exits_unobstructed',
  'exit_signage',
  'emergency_lighting',
  'evacuation_routes_clear',
  // Staff
  'cpr_certified_onsite',
  // Communication
  'radios_functional',
  'pa_system_functional',
  'emergency_contacts_accessible'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  'aed_present_ready',
  'aed_pads_batteries',
  'bleeding_control_kits',
  'first_aid_kits',
  'rescue_meds_onsite',
  'exits_unobstructed',
  'exit_signage',
  'emergency_lighting',
  'evacuation_routes_clear',
  'health_center_accessible',
  'isolation_space_available',
  'medication_storage',
  'fire_extinguishers',
  'evacuation_maps'
];

// ============================================
// HEALTH & SAFETY ZONES
// ============================================
export const HEALTH_SAFETY_ZONES = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Health & Safety Check',
    frequency: 'weekly',
    order: 1,
    description: 'Complete once per week to verify all health and safety systems are operational',
    timeNeeded: '20-30 minutes',
    sections: [
      {
        name: '1. Medical Documentation & Records',
        description: 'Verify student health records and care plans are current and accessible.',
        checks: [
          {
            id: 'high_risk_list_current',
            text: 'Is the high-risk student list current and accessible?',
            helpText: 'List should be updated within last 30 days',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'high_risk_ihcp_eap',
            text: 'Do all high-risk students have current IHCPs/EAPs on file?',
            helpText: 'Individual Healthcare Plans or Emergency Action Plans for each high-risk student',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'allergy_database_distributed',
            text: 'Has the allergy database been distributed to all required locations (kitchen, health center, classrooms)?',
            helpText: 'Current allergy info must be available to all staff who need it',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'emergency_contacts_verified',
            text: 'Are emergency contacts verified and accessible for all students?',
            helpText: 'Contact info should be tested and current',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: '2. Equipment & Supplies - AEDs [LC]',
        description: 'Verify all AEDs and life-saving devices are ready for use.',
        checks: [
          {
            id: 'aed_present_ready',
            text: 'Are all AEDs present and showing a ready indicator?',
            helpText: 'Green light or ready status on each device',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'aed_pads_batteries',
            text: 'Are all AED pads and batteries unexpired?',
            helpText: 'Check expiration dates on pads and batteries',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'aed_inspection_logged',
            text: 'Has the monthly AED inspection been logged?',
            helpText: 'Inspection log should be current within 31 days',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'bleeding_control_kits',
            text: 'Are bleeding control kits co-located with AEDs and fully stocked?',
            helpText: 'Tourniquets, gauze, and other bleeding control supplies',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: '2. Equipment & Supplies - Emergency Kits & Medications [LC]',
        description: 'Verify all emergency kits and medications are present and ready.',
        checks: [
          {
            id: 'first_aid_kits',
            text: 'Are first aid kits present and stocked in all required locations?',
            helpText: 'Gloves, bandages, gauze, CPR barrier, etc.',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'go_bags_deployed',
            text: 'Are emergency go-bags deployed in all required zones?',
            helpText: 'Portable emergency supplies for evacuation',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'rescue_meds_onsite',
            text: 'Are rescue medications on-site for all high-risk students (EpiPens, inhalers, glucagon, etc.)?',
            helpText: 'Each high-risk student must have their required meds on campus',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'meds_unexpired',
            text: 'Are all medications within their expiration dates?',
            helpText: 'Check all stored medications for expiration',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'med_refrigeration',
            text: 'Is medication refrigeration functional and at proper temperature?',
            helpText: 'Temperature should be monitored and within range',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: '3. Spaces & Infrastructure - Emergency Exits [LC]',
        description: 'Verify all emergency exits and evacuation routes are clear and functional.',
        checks: [
          {
            id: 'exits_unobstructed',
            text: 'Are all emergency exits unobstructed and functional?',
            helpText: 'Doors open easily, not blocked by furniture or equipment',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'exit_signage',
            text: 'Is all exit signage illuminated and visible?',
            helpText: 'EXIT signs lit and clearly visible from hallways',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'emergency_lighting',
            text: 'Does emergency lighting activate when tested?',
            helpText: 'Test battery backup lights in hallways and stairwells',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'evacuation_routes_clear',
            text: 'Are all evacuation routes clear of obstructions?',
            helpText: 'Hallways and stairwells free of stored items',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: '3. Spaces & Infrastructure - Health & Isolation Spaces',
        description: 'Verify health center and isolation spaces are ready for use.',
        checks: [
          {
            id: 'health_center_accessible',
            text: 'Is the health center accessible and not being used for another purpose?',
            helpText: 'Space available for student care, not repurposed',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'isolation_space_available',
            text: 'Is the isolation space available and stocked with PPE and basic supplies?',
            helpText: 'Masks, gloves, first-aid supplies, communication method',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'medication_storage',
            text: 'Is medication storage locked and climate-controlled?',
            helpText: 'Secure cabinet with proper temperature',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: '3. Spaces & Infrastructure - Safety Equipment',
        description: 'Verify fire safety and wayfinding equipment is in place.',
        checks: [
          {
            id: 'fire_extinguishers',
            text: 'Are fire extinguishers present with current inspection tags?',
            helpText: 'Check tags for recent inspection dates',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'evacuation_maps',
            text: 'Are evacuation maps posted in all rooms?',
            helpText: 'Maps showing exits and assembly points',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: '4. Staff Training & Competency',
        description: 'Verify staff are trained and know emergency procedures.',
        checks: [
          {
            id: 'cpr_certified_onsite',
            text: 'Is a CPR/AED-certified adult on-site during all operating hours?',
            helpText: 'At least one certified person present at all times',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'staff_aware_high_risk',
            text: 'Are staff aware of high-risk students in their care and their specific plans?',
            helpText: 'Teachers know which students have IHCPs/EAPs and what to do',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'emergency_roles_current',
            text: 'Are emergency role assignments current and acknowledged by assigned staff?',
            helpText: 'Fire wardens, first responders, etc. know their roles',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'staff_equipment_access',
            text: 'Can staff locate and access emergency equipment within 30 seconds?',
            helpText: 'Staff know where AEDs, first aid, and meds are located',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: '5. Communication & Response Systems - Equipment [LC]',
        description: 'Verify all communication systems are operational.',
        checks: [
          {
            id: 'radios_functional',
            text: 'Are two-way radios functional and fully charged?',
            helpText: 'Test radios, ensure batteries are charged',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'pa_system_functional',
            text: 'Is the PA system functional for all occupied areas?',
            helpText: 'Announcements can be heard throughout campus',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'emergency_contacts_accessible',
            text: 'Is the emergency contact list current and accessible (911, leadership, front office)?',
            helpText: 'Posted at security desk and key locations',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          }
        ]
      },
      {
        name: '5. Communication & Response Systems - Plans & Procedures',
        description: 'Verify emergency plans are accessible and routes are clear.',
        checks: [
          {
            id: 'crisis_plan_accessible',
            text: 'Is the crisis response plan accessible on-site?',
            helpText: 'Physical or digital copy readily available',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'fire_plan_accessible',
            text: 'Is the fire response plan with routes and assembly areas accessible?',
            helpText: 'Staff know where to find fire procedures',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'lockdown_procedures_accessible',
            text: 'Are lockdown/intruder procedures accessible?',
            helpText: 'Active threat response procedures available',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'ems_route_clear',
            text: 'Is the EMS access route clear with entry point identified?',
            helpText: 'Ambulance can reach campus quickly, entry point marked',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  }
};

// Zone order for navigation
export const HEALTH_SAFETY_ZONE_ORDER = ['weekly'];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = HEALTH_SAFETY_ZONES[zoneId];
  if (!zone || !zone.sections) return [];

  return zone.sections.flatMap(section =>
    section.checks.map(check => ({
      ...check,
      section: section.name
    }))
  );
};

// Helper to check if a check is instant red (Life-Critical)
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

  // Check for any instant red items (Life-Critical failures)
  const hasInstantRed = failedChecks.some(check => check.instantRed);
  if (hasInstantRed) {
    return 'RED';
  }

  // Check issue count and status
  const openIssues = issues.filter(i => i.status === 'open');

  if (openIssues.length > HEALTH_SAFETY_RAG_RULES.amber.maxOpenIssues) {
    return 'RED';
  }

  // Check if any issue is missing owner or fix date
  const missingInfo = openIssues.some(i => !i.owner || !i.fixDate);
  if (missingInfo) {
    return 'RED';
  }

  // Check if any issue is overdue (>30 days per H&S quality bar)
  const now = new Date();
  const overdue = openIssues.some(i => {
    const created = new Date(i.createdAt);
    const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return daysDiff > HEALTH_SAFETY_RAG_RULES.amber.maxDaysToFix;
  });
  if (overdue) {
    return 'RED';
  }

  // All failed checks are amber-eligible and within limits
  return 'AMBER';
};

// Helper to calculate overall health & safety rating
export const calculateOverallRating = (zoneRatings) => {
  const ratings = Object.values(zoneRatings);

  // Any RED = overall RED
  if (ratings.includes('RED')) {
    return 'RED';
  }

  // Any AMBER = overall AMBER
  if (ratings.includes('AMBER')) {
    return 'AMBER';
  }

  return 'GREEN';
};
