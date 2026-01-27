// Food Service Quality Check - Ops Monthly Spot Check
// Based on Food Service Quality Bar for Site Owner / CC
// Pillar: Food Safety & Quality

// ============================================
// RAG RATING RULES
// ============================================
export const FOOD_SAFETY_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES (where applicable)',
      'No food quality defects identified',
      'Temperature compliance met (hot >=135F, cold <=41F)',
      'No sanitation or packaging issues',
      'At least 70% student meal consumption',
      'Student and staff surveys completed',
      'No vendor professionalism issues'
    ]
  },
  amber: {
    description: 'At Risk',
    criteria: [
      'No more than 3 open issues across all checks',
      'Each issue has a named owner assigned',
      'Each issue has a fix date within 45 days',
      'No INSTANT RED items failed',
      'Minor food quality issues documented with photos',
      'Vendor issues documented and communicated'
    ],
    maxOpenIssues: 3,
    maxDaysToFix: 45
  },
  red: {
    description: 'Not Meeting Standard',
    criteria: [
      'Any INSTANT RED item failed',
      'More than 3 open issues at once',
      'Any issue has been open longer than 45 days',
      'Temperature non-compliance on critical items',
      'Repeated vendor no-shows or late arrivals',
      'Food safety hazards identified'
    ]
  }
};

// ============================================
// INSTANT RED ITEMS
// These cannot be Amber - NO answer = automatic RED
// ============================================
export const INSTANT_RED_CHECKS = [
  'temperature_compliance',
  'sanitation_packaging'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  'meal_match',
  'special_diet_labels',
  'food_quality_defects',
  'temperature_compliance',
  'sanitation_packaging'
];

// ============================================
// FOOD SAFETY ZONES (CHECK TYPES)
// ============================================
export const FOOD_SAFETY_ZONES = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Food Service Quality Check',
    frequency: 'monthly',
    order: 1,
    description: 'Complete monthly or when requested by management for a spot check',
    timeNeeded: '20-30 minutes',
    persona: 'Site Owner / Campus Coordinator',
    sections: [
      {
        name: 'Service Timeliness',
        description: 'Check that food service started on time and as scheduled.',
        checks: [
          {
            id: 'vendor_on_time',
            text: 'Did the vendor arrive and start lunch service on time?',
            helpText: 'If no, include how late the service started in comments',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Meal Accuracy',
        description: 'Verify the meal served matches what was planned/posted.',
        checks: [
          {
            id: 'meal_match',
            text: 'Did the meal match the one that was planned/posted?',
            helpText: 'If no, describe inconsistencies and include photos of each entree, side, and menu if applicable',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'special_diet_labels',
            text: 'Were special diet meals clearly labeled and correctly served?',
            helpText: 'If no, describe inconsistencies and include photo of special diet meals and labels',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'Food Quality Assessment',
        description: 'Check for food quality defects related to freshness, preparation, flavor, or presentation.',
        checks: [
          {
            id: 'food_quality_defects',
            text: 'Was the food free of quality defects?',
            helpText: 'Check for: Proteins dry/overcooked (lacks moisture, hardened edges), Vegetables mushy/overcooked (loss of structural integrity), Visible browning/oxidation on fruits/vegetables, Inconsistent appearance across 3+ servings, Off-odors (sour, chemical, burnt smells)',
            tier: 'amber',
            photoRequired: true,
            defectChecklist: [
              'Proteins dry/overcooked - Lacks visible moisture, edges hardened, or visible dryness when cut',
              'Vegetables mushy/overcooked - Loss of structural integrity when picked up with utensils',
              'Visible browning/oxidation - Fruit/vegetables show discoloration from extended holding',
              'Inconsistent appearance - Meals vary significantly in portion size, plating, or ingredient distribution across 3+ servings',
              'Off-odors detected - Sour, chemical, or burnt smells present'
            ]
          }
        ]
      },
      {
        name: 'Temperature Compliance',
        description: 'Verify food temperature meets safety standards.',
        checks: [
          {
            id: 'temperature_compliance',
            text: 'Hot food temperature during service >=135F? Cold food temperature during service <=41F?',
            helpText: 'If no, list what foods did not meet temperature compliance, include temperature reading, and photos of temperature readings',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: 'Sanitation & Packaging',
        description: 'Check for sanitation and packaging compliance.',
        checks: [
          {
            id: 'sanitation_packaging',
            text: 'Was the service free of sanitation & packaging defects?',
            helpText: 'Check for: glove use, clean/secure/undamaged packaging, covered foods, food stored off floor at all times, space left clean and usable after service',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: 'Vendor Professionalism',
        description: 'Assess vendor professionalism and service quality.',
        checks: [
          {
            id: 'vendor_professionalism',
            text: 'Was the service free of vendor professionalism issues?',
            helpText: 'If no, provide description of issues observed',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Participation & Consumption',
        description: 'Track student participation and meal consumption.',
        checks: [
          {
            id: 'student_participation_count',
            text: 'Has student participation count been recorded?',
            helpText: 'Ask server to count number of students who participated in school lunch',
            tier: 'amber',
            photoRequired: false,
            inputType: 'number',
            inputLabel: 'Number of students'
          },
          {
            id: 'student_consumption_rate',
            text: 'Did at least 70% of students consume >75% of the meal?',
            helpText: 'Rough observation of meal consumption during service',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Survey Completion',
        description: 'Verify surveys have been completed for feedback collection.',
        checks: [
          {
            id: 'student_survey_complete',
            text: 'Have students completed the survey (at least 10)?',
            helpText: 'Each school will have its own student survey link',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'staff_survey_complete',
            text: 'Have staff completed the survey (at least 3)?',
            helpText: 'Each school will have its own staff survey link',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Additional Observations',
        description: 'Any other observations or explanations.',
        checks: [
          {
            id: 'additional_observations',
            text: 'Are there any additional observations to note?',
            helpText: 'Include any additional observations or explanations for any of the above checks',
            tier: 'amber',
            photoRequired: false,
            inputType: 'text',
            optional: true
          }
        ]
      }
    ]
  },

  spot_check: {
    id: 'spot_check',
    name: 'Management Spot Check',
    frequency: 'as_needed',
    order: 2,
    description: 'Triggered spot check requested by management when quality declines',
    timeNeeded: '15-20 minutes',
    persona: 'Site Owner / Campus Coordinator / Management',
    sections: [
      {
        name: 'Service Timeliness',
        description: 'Check that food service started on time and as scheduled.',
        checks: [
          {
            id: 'spot_vendor_on_time',
            text: 'Did the vendor arrive and start lunch service on time?',
            helpText: 'If no, include how late the service started in comments',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Meal Accuracy',
        description: 'Verify the meal served matches what was planned/posted.',
        checks: [
          {
            id: 'spot_meal_match',
            text: 'Did the meal match the one that was planned/posted?',
            helpText: 'If no, describe inconsistencies and include photos of each entree, side, and menu if applicable',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'spot_special_diet_labels',
            text: 'Were special diet meals clearly labeled and correctly served?',
            helpText: 'If no, describe inconsistencies and include photo of special diet meals and labels',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'Food Quality Assessment',
        description: 'Check for food quality defects related to freshness, preparation, flavor, or presentation.',
        checks: [
          {
            id: 'spot_food_quality_defects',
            text: 'Was the food free of quality defects?',
            helpText: 'Check for: Proteins dry/overcooked, Vegetables mushy/overcooked, Visible browning/oxidation, Inconsistent appearance, Off-odors',
            tier: 'amber',
            photoRequired: true,
            defectChecklist: [
              'Proteins dry/overcooked - Lacks visible moisture, edges hardened, or visible dryness when cut',
              'Vegetables mushy/overcooked - Loss of structural integrity when picked up with utensils',
              'Visible browning/oxidation - Fruit/vegetables show discoloration from extended holding',
              'Inconsistent appearance - Meals vary significantly in portion size, plating, or ingredient distribution across 3+ servings',
              'Off-odors detected - Sour, chemical, or burnt smells present'
            ]
          }
        ]
      },
      {
        name: 'Temperature Compliance',
        description: 'Verify food temperature meets safety standards.',
        checks: [
          {
            id: 'spot_temperature_compliance',
            text: 'Hot food temperature during service >=135F? Cold food temperature during service <=41F?',
            helpText: 'If no, list what foods did not meet temperature compliance, include temperature reading, and photos of temperature readings',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: 'Sanitation & Packaging',
        description: 'Check for sanitation and packaging compliance.',
        checks: [
          {
            id: 'spot_sanitation_packaging',
            text: 'Was the service free of sanitation & packaging defects?',
            helpText: 'Check for: glove use, clean/secure/undamaged packaging, covered foods, food stored off floor, space left clean after service',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: 'Vendor Professionalism',
        description: 'Assess vendor professionalism and service quality.',
        checks: [
          {
            id: 'spot_vendor_professionalism',
            text: 'Was the service free of vendor professionalism issues?',
            helpText: 'If no, provide description of issues observed',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Additional Observations',
        description: 'Any other observations specific to the spot check trigger.',
        checks: [
          {
            id: 'spot_additional_observations',
            text: 'Are there any additional observations related to the spot check trigger?',
            helpText: 'Include observations or explanations for the issue that triggered this spot check',
            tier: 'amber',
            photoRequired: false,
            inputType: 'text',
            optional: true
          }
        ]
      }
    ]
  }
};

// Zone order for navigation (not used for flow, just for display)
export const FOOD_SAFETY_ZONE_ORDER = ['monthly', 'spot_check'];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = FOOD_SAFETY_ZONES[zoneId];
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
  // Check both the base ID and spot_check prefixed version
  const baseId = checkId.replace('spot_', '');
  return INSTANT_RED_CHECKS.includes(checkId) || INSTANT_RED_CHECKS.includes(baseId);
};

// Helper to check if photo is required for a check
export const isPhotoRequired = (checkId) => {
  const baseId = checkId.replace('spot_', '');
  return PHOTO_REQUIRED_CHECKS.includes(checkId) || PHOTO_REQUIRED_CHECKS.includes(baseId);
};

// Helper to calculate zone rating
export const calculateZoneRating = (zoneId, results, issues) => {
  const checks = getZoneChecks(zoneId);

  // Get failed checks (NO answers), excluding optional checks
  const failedChecks = checks.filter(check =>
    !check.optional && results[check.id] === false
  );

  if (failedChecks.length === 0) {
    return 'GREEN';
  }

  // Check for any instant red items
  const hasInstantRed = failedChecks.some(check => check.instantRed);
  if (hasInstantRed) {
    return 'RED';
  }

  // Check issue count and status
  const openIssues = issues.filter(i => i.status === 'open');

  if (openIssues.length > FOOD_SAFETY_RAG_RULES.amber.maxOpenIssues) {
    return 'RED';
  }

  // Check if any issue is missing owner or fix date
  const missingInfo = openIssues.some(i => !i.owner || !i.fixDate);
  if (missingInfo) {
    return 'RED';
  }

  // Check if any issue is overdue (>45 days)
  const now = new Date();
  const overdue = openIssues.some(i => {
    const created = new Date(i.createdAt);
    const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    return daysDiff > FOOD_SAFETY_RAG_RULES.amber.maxDaysToFix;
  });
  if (overdue) {
    return 'RED';
  }

  // All failed checks are amber-eligible and within limits
  return 'AMBER';
};
