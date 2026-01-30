// CC Daily Green Streak Walk - Question Definitions
// This is an oversight walk, not an execution checklist
// Time target: 15-20 minutes

export const GREEN_STREAK_METRICS = {
  HEALTH_SAFETY: {
    id: 'health_safety',
    name: 'Health & Safety',
    code: '14.03',
    principle: 'Always ready',
    color: '#ef4444',
    escalation: 'VP of Ops immediately'
  },
  SECURITY: {
    id: 'security',
    name: 'Security',
    code: '14.04',
    principle: 'Locked tight',
    color: '#eab308',
    escalation: 'VP of Ops + Security team'
  },
  INTERNET: {
    id: 'internet',
    name: 'Internet & Connectivity',
    code: '14.05',
    principle: 'Never down',
    color: '#0ea5e9',
    escalation: 'IT/MSP + VP of Ops'
  },
  INTERIOR: {
    id: 'interior',
    name: 'Interior Design',
    code: '14.08',
    principle: 'Looks right',
    color: '#8b5cf6',
    escalation: 'Worksmith + VP of Ops'
  },
  MECHANICAL: {
    id: 'mechanical',
    name: 'Mechanical',
    code: '14.11',
    principle: 'Always cool',
    color: '#71717a',
    escalation: 'Worksmith + VP of Ops'
  },
  CLEANLINESS: {
    id: 'cleanliness',
    name: 'Cleanliness',
    code: 'vendor_qc',
    principle: 'Tour ready',
    color: '#10b981',
    escalation: 'Day porter vendor + Worksmith',
    isVendorQC: true // Not a streak-breaker, but important
  }
};

export const GREEN_STREAK_STOPS = [
  {
    id: 'exterior',
    name: 'Exterior / Arrival',
    order: 1,
    timeEstimate: '2 min',
    description: 'Quick scan as you approach and enter the building',
    passCriteria: 'No obvious issues. You\'d feel comfortable with a parent arriving right now.',
    checks: [
      {
        id: 'ext_1',
        question: 'Is the perimeter secure (gates closed, fences intact)?',
        metric: 'SECURITY',
        lookingFor: 'Gates closed, fences intact, no gaps'
      },
      {
        id: 'ext_2',
        question: 'Is the entry path clear and hazard-free?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Drop-off area clear, no hazards on walkway'
      },
      {
        id: 'ext_3',
        question: 'Are exterior lights working?',
        metric: 'MECHANICAL',
        lookingFor: 'Lights working (if applicable at walk time)',
        optional: true,
        optionalNote: 'Check if morning is dark'
      }
    ]
  },
  {
    id: 'entry',
    name: 'Entry / Reception',
    order: 2,
    timeEstimate: '3 min',
    description: 'First impression zone. This is what families see.',
    passCriteria: 'A family walking in right now would see a professional, welcoming space.',
    checks: [
      {
        id: 'entry_1',
        question: 'Is access control working (badge/keypad/buzzer)?',
        metric: 'SECURITY',
        lookingFor: 'Badge reader / keypad / buzzer functional'
      },
      {
        id: 'entry_2',
        question: 'Is the visitor sign-in system ready?',
        metric: 'SECURITY',
        lookingFor: 'Log book or digital check-in operational'
      },
      {
        id: 'entry_3',
        question: 'Are emergency exits clear and unobstructed?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Exit paths unobstructed, signage visible'
      },
      {
        id: 'entry_4',
        question: 'Are emergency procedures posted and visible?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Procedures visible, current'
      },
      {
        id: 'entry_5',
        question: 'Is furniture in position per layout?',
        metric: 'INTERIOR',
        lookingFor: 'Aligned per layout, nothing out of place'
      },
      {
        id: 'entry_6',
        question: 'Is signage clean and intact?',
        metric: 'INTERIOR',
        lookingFor: 'Clean, straight, no damage'
      },
      {
        id: 'entry_7',
        question: 'Is this area tour-ready right now?',
        metric: 'CLEANLINESS',
        lookingFor: 'Floor clean? Surfaces dusted? No clutter?',
        isVendorQC: true
      }
    ]
  },
  {
    id: 'commons',
    name: 'Commons / Hallways',
    order: 3,
    timeEstimate: '3 min',
    description: 'High-traffic shared spaces.',
    passCriteria: 'You could give a tour through here right now.',
    checks: [
      {
        id: 'commons_1',
        question: 'Are walkways clear and hazard-free?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'No trip hazards, no obstructions'
      },
      {
        id: 'commons_2',
        question: 'Are fire extinguishers accessible with current inspection?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Visible, not blocked, inspection tag current'
      },
      {
        id: 'commons_3',
        question: 'Is first aid kit stocked and accessible?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Visible, not blocked, stocked'
      },
      {
        id: 'commons_4',
        question: 'Is AED accessible and showing charged?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'Visible, not blocked, indicator shows charged',
        optional: true,
        optionalNote: 'If campus has AED'
      },
      {
        id: 'commons_5',
        question: 'Are cameras visibly operational?',
        metric: 'SECURITY',
        lookingFor: 'Visual check - lights on, positioned correctly'
      },
      {
        id: 'commons_6',
        question: 'Is the temperature comfortable?',
        metric: 'MECHANICAL',
        lookingFor: 'Feels right when you walk in'
      },
      {
        id: 'commons_7',
        question: 'Is HVAC running normally (no strange noise/smell)?',
        metric: 'MECHANICAL',
        lookingFor: 'No strange noises, no odors, no hot/cold spots'
      },
      {
        id: 'commons_8',
        question: 'Is furniture in position with no damage?',
        metric: 'INTERIOR',
        lookingFor: 'Aligned, nothing broken or out of place'
      },
      {
        id: 'commons_9',
        question: 'Is this area tour-ready right now?',
        metric: 'CLEANLINESS',
        lookingFor: 'Floors clean? Trash emptied? No spills?',
        isVendorQC: true
      }
    ]
  },
  {
    id: 'learning',
    name: 'Learning Space Sample',
    order: 4,
    timeEstimate: '5 min',
    description: 'Check 2 rooms. Rotate which ones daily.',
    passCriteria: 'Students could walk in and start learning right now.',
    requiresRoomSelection: true,
    roomCount: 2,
    rotationNote: 'Don\'t check the same rooms every day. Rotate so you see all spaces over the course of a week.',
    checks: [
      {
        id: 'learning_1',
        question: 'Is WiFi working in this room?',
        metric: 'INTERNET',
        lookingFor: 'Device connects, reasonable speed'
      },
      {
        id: 'learning_2',
        question: 'Are student devices charged and accessible?',
        metric: 'INTERNET',
        lookingFor: 'Charged, accessible, powered on'
      },
      {
        id: 'learning_3',
        question: 'Is the display/AV system working?',
        metric: 'INTERNET',
        lookingFor: 'Screen on, no error messages'
      },
      {
        id: 'learning_4',
        question: 'Is the temperature comfortable?',
        metric: 'MECHANICAL',
        lookingFor: 'Feels right'
      },
      {
        id: 'learning_5',
        question: 'Is furniture in position with no damage?',
        metric: 'INTERIOR',
        lookingFor: 'Desks/chairs arranged correctly'
      },
      {
        id: 'learning_6',
        question: 'Is this room tour-ready right now?',
        metric: 'CLEANLINESS',
        lookingFor: 'Floor clean? Surfaces wiped? Trash empty?',
        isVendorQC: true
      }
    ]
  },
  {
    id: 'restroom',
    name: 'Restroom Sample',
    order: 5,
    timeEstimate: '4 min',
    description: 'Check 2 restrooms. Rotate daily.',
    passCriteria: 'You\'d use this restroom yourself without hesitation.',
    requiresRoomSelection: true,
    roomCount: 2,
    rotationNote: 'Hit different restrooms each day. Vendors can\'t game what they don\'t know you\'ll check.',
    checks: [
      {
        id: 'restroom_1',
        question: 'Do the locks work?',
        metric: 'SECURITY',
        lookingFor: 'Door locks engage properly'
      },
      {
        id: 'restroom_2',
        question: 'Is the floor dry (no slip hazard)?',
        metric: 'HEALTH_SAFETY',
        lookingFor: 'No puddles, no slip hazard'
      },
      {
        id: 'restroom_3',
        question: 'Is plumbing working (no leaks, fixtures operational)?',
        metric: 'MECHANICAL',
        lookingFor: 'Toilets flush, sinks drain, no leaks'
      },
      {
        id: 'restroom_4',
        question: 'Is this restroom tour-ready right now?',
        metric: 'CLEANLINESS',
        lookingFor: 'Clean, stocked, no odor',
        isVendorQC: true
      }
    ]
  },
  {
    id: 'systems',
    name: 'Systems Check',
    order: 6,
    timeEstimate: '2 min',
    description: 'Can be done from any computer/phone.',
    passCriteria: 'Systems show green. No carryover issues unaddressed.',
    checks: [
      {
        id: 'systems_1',
        question: 'Is primary internet connection up?',
        metric: 'INTERNET',
        lookingFor: 'Dashboard green or speed test confirms'
      },
      {
        id: 'systems_2',
        question: 'Is CCTV system showing all cameras online?',
        metric: 'SECURITY',
        lookingFor: 'Dashboard shows cameras active'
      },
      {
        id: 'systems_3',
        question: 'Have all previous issues been resolved?',
        metric: 'HEALTH_SAFETY', // Defaults to H&S but could apply to any
        lookingFor: 'No open flags or carryover issues from yesterday'
      }
    ]
  }
];

// Helper to get all checks flat
export const getAllChecks = () => {
  return GREEN_STREAK_STOPS.flatMap(stop =>
    stop.checks.map(check => ({
      ...check,
      stopId: stop.id,
      stopName: stop.name
    }))
  );
};

// Helper to get checks by metric
export const getChecksByMetric = (metricId) => {
  return getAllChecks().filter(check => check.metric === metricId);
};

// Calculate metric status based on check results
// Returns 'GREEN' if all checks pass, 'ISSUE' if any fail
export const calculateMetricStatus = (metricId, checkResults) => {
  const checks = getChecksByMetric(metricId);

  for (const check of checks) {
    const result = checkResults[check.id];

    // Skip optional checks that weren't answered
    if (check.optional && result === undefined) continue;

    // "No" answer = issue found
    if (result === false) return 'ISSUE';
  }

  return 'GREEN';
};

// Calculate overall Green Streak status
export const calculateOverallStatus = (checkResults) => {
  const statuses = {};

  Object.keys(GREEN_STREAK_METRICS).forEach(metricKey => {
    const metric = GREEN_STREAK_METRICS[metricKey];
    statuses[metric.id] = calculateMetricStatus(metricKey, checkResults);
  });

  // Overall is GREEN only if all non-vendor-QC metrics are GREEN
  const streakMetrics = Object.keys(GREEN_STREAK_METRICS)
    .filter(key => !GREEN_STREAK_METRICS[key].isVendorQC);

  const overallGreen = streakMetrics.every(key =>
    statuses[GREEN_STREAK_METRICS[key].id] === 'GREEN'
  );

  return {
    metricStatuses: statuses,
    overall: overallGreen ? 'GREEN' : 'ISSUE',
    streakIntact: overallGreen
  };
};

// Get total check count
export const getTotalCheckCount = () => {
  return getAllChecks().filter(c => !c.optional).length;
};

// Get completion percentage
export const getCompletionPercentage = (checkResults) => {
  const allChecks = getAllChecks().filter(c => !c.optional);
  const answered = allChecks.filter(c => checkResults[c.id] !== undefined).length;
  return Math.round((answered / allChecks.length) * 100);
};
