// Security Compliance Checklist - 2B/2C Sustain
// Based on Jake Petersen's Security Quality Bar

// ============================================
// RAG RATING RULES
// ============================================
export const SECURITY_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES',
      'Daily checks completed on 95%+ of occupied days this month',
      'No open issues from previous checks',
      'No active exceptions on file'
    ]
  },
  amber: {
    description: 'At Risk',
    criteria: [
      'No more than 3 open issues across all checks',
      'Each issue has a named owner assigned',
      'Each issue has a fix date within 45 days',
      'No INSTANT RED items failed',
      'Daily checks completed on 95%+ of occupied days this month'
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
      'Daily checks completed on less than 95% of occupied days',
      'Any issue has no owner or no fix date assigned'
    ]
  }
};

// ============================================
// INSTANT RED ITEMS
// These cannot be Amber - NO answer = automatic RED
// ============================================
export const INSTANT_RED_CHECKS = [
  'staffing_coverage',
  'staffing_gaps',
  'doors_secured',
  'doors_propped',
  'incident_forced_entry',
  'incident_breach',
  'guard_license_valid'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  'perimeter_fencing',
  'perimeter_gates',
  'perimeter_lights',
  'perimeter_damage',
  'doors_secured',
  'doors_propped',
  'access_badge_readers',
  'access_doors_unlock',
  'access_doors_autolock',
  'camera_live',
  'camera_clarity',
  'camera_unobstructed',
  'incident_forced_entry',
  'incident_breach'
];

// ============================================
// SECURITY ZONES
// ============================================
export const SECURITY_ZONES = {
  daily: {
    id: 'daily',
    name: 'Daily Checks',
    frequency: 'daily',
    order: 1,
    description: 'Complete every day the campus is open',
    timeNeeded: '15-20 minutes',
    completionThreshold: 0.95, // 95% of occupied days
    sections: [
      {
        name: 'Perimeter Walk',
        description: 'Walk the outside of the building and property line. Look for anything unusual.',
        checks: [
          {
            id: 'perimeter_fencing',
            text: 'Is all fencing intact?',
            helpText: 'No holes, gaps, or damage',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'perimeter_gates',
            text: 'Are all gates working properly?',
            helpText: 'Open, close, and lock correctly',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'perimeter_lights',
            text: 'Are all exterior lights working?',
            helpText: 'Check for burnt out bulbs or dark spots',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'perimeter_damage',
            text: 'Is the perimeter free of damage or tampering?',
            helpText: 'No graffiti, broken items, or signs of forced entry attempts',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'Staffing Coverage',
        description: 'Confirm security post was staffed during all open hours.',
        checks: [
          {
            id: 'staffing_coverage',
            text: 'Was the security post staffed during all open hours?',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'staffing_gaps',
            text: 'Were all coverage gaps under 15 minutes?',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          }
        ]
      },
      {
        name: 'Exterior Doors',
        description: 'Check all exterior doors are properly secured.',
        checks: [
          {
            id: 'doors_secured',
            text: 'Are all exterior doors properly secured?',
            helpText: 'Locked or properly controlled',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'doors_propped',
            text: 'Are all doors that should be closed actually closed?',
            helpText: 'Not propped open',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      },
      {
        name: 'Visitor Management',
        description: 'Verify the visitor management system is ready for the day.',
        checks: [
          {
            id: 'raptor_functioning',
            text: 'Is the Raptor Visitor Management System functioning?',
            helpText: 'System is powered on and responding',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  },

  weekly: {
    id: 'weekly',
    name: 'Weekly Checks',
    frequency: 'weekly',
    order: 2,
    description: 'Complete once per week',
    timeNeeded: '10-15 minutes',
    sections: [
      {
        name: 'Access Control Spot Check',
        description: 'Test a few badge readers and doors to make sure they are working.',
        checks: [
          {
            id: 'access_badge_readers',
            text: 'Do badge readers respond when a badge is tapped?',
            helpText: 'Light or beep indicates response',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'access_doors_unlock',
            text: 'Do doors unlock correctly when a valid badge is used?',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'access_doors_autolock',
            text: 'Do doors lock automatically after opening?',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'Camera Spot Check',
        description: 'Look at a few camera feeds to make sure they are working.',
        checks: [
          {
            id: 'camera_live',
            text: 'Are cameras showing a live picture?',
            helpText: 'Not frozen or offline',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'camera_clarity',
            text: 'Is the picture clear enough to identify faces at entrances?',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'camera_unobstructed',
            text: 'Are all cameras unobstructed and pointing correctly?',
            helpText: 'Not blocked, dirty, or misaligned',
            tier: 'amber',
            photoRequired: true
          }
        ]
      }
    ]
  },

  monthly: {
    id: 'monthly',
    name: 'Monthly Checks',
    frequency: 'monthly',
    order: 3,
    description: 'Complete once per month',
    timeNeeded: '20-30 minutes',
    sections: [
      {
        name: 'Incident Review',
        description: 'Review any security incidents from the past month.',
        checks: [
          {
            id: 'incident_forced_entry',
            text: 'Was the campus free of forced entries or break-ins this month?',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'incident_breach',
            text: 'Was the campus free of perimeter breaches this month?',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'incident_documented',
            text: 'Were all incidents documented and fixed within 7 days?',
            helpText: 'Select Yes if no incidents occurred',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Camera System Review',
        description: 'Check the camera system reports for uptime and storage.',
        checks: [
          {
            id: 'camera_uptime_critical',
            text: 'Did critical cameras (entrances, perimeter) stay online 99%+ of the time?',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'camera_uptime_other',
            text: 'Did other exterior cameras stay online 97%+ of the time?',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'camera_retention',
            text: 'Is video footage being saved for at least 30 days?',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'camera_retrieval',
            text: 'Can footage be retrieved within 24 hours if needed?',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Alarm System Test',
        description: 'Verify the alarm system is working correctly.',
        checks: [
          {
            id: 'alarm_tested',
            text: 'Was the alarm system tested this month?',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'alarm_response',
            text: 'Did the monitoring company respond correctly during the test?',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  },

  annual: {
    id: 'annual',
    name: 'Annual Checks',
    frequency: 'annual',
    order: 4,
    description: 'Complete once per year',
    timeNeeded: '30-60 minutes',
    sections: [
      {
        name: 'Guard Credentials',
        description: 'Verify that all security guards have current licenses and certifications.',
        checks: [
          {
            id: 'guard_license_valid',
            text: 'Do all guards have a valid, unexpired security license?',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'guard_certifications',
            text: 'Are all required certifications up to date?',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'guard_tracking',
            text: 'Is there a system in place to track renewal dates?',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  }
};

// Zone order for navigation
export const SECURITY_ZONE_ORDER = ['daily', 'weekly', 'monthly', 'annual'];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = SECURITY_ZONES[zoneId];
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

  // Check issue count and status
  const openIssues = issues.filter(i => i.status === 'open');

  if (openIssues.length > SECURITY_RAG_RULES.amber.maxOpenIssues) {
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
    return daysDiff > SECURITY_RAG_RULES.amber.maxDaysToFix;
  });
  if (overdue) {
    return 'RED';
  }

  // All failed checks are amber-eligible and within limits
  return 'AMBER';
};

// Helper to calculate overall security rating
export const calculateOverallRating = (zoneRatings, dailyCompletionRate) => {
  // Check daily completion threshold
  if (dailyCompletionRate < SECURITY_RAG_RULES.amber.completionThreshold) {
    return 'RED';
  }

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
