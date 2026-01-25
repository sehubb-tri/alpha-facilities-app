// Weekly Building & Grounds Walkthrough Zone Definitions
// Based on 14.13 Building and Grounds Quality Bar

// ============================================
// SLA TIERS
// ============================================
export const SLA_TIERS = {
  1: {
    name: 'Tier 1 - Critical',
    response: '<2h',
    resolution: '<12h',
    description: 'Trip hazards, fallen trees, safety hazards, major drainage failure'
  },
  2: {
    name: 'Tier 2 - High-Visibility',
    response: '<4h',
    resolution: '<24h',
    description: 'Entrance zone items, visible landscaping failures on tour route, parking issues affecting arrival'
  },
  3: {
    name: 'Tier 3 - Routine',
    response: '<24h',
    resolution: '<72h',
    description: 'Standard landscaping issues, minor hardscape issues, back-of-house exterior items'
  },
  4: {
    name: 'Tier 4 - Enhancement',
    response: 'Scheduled',
    resolution: 'Scheduled',
    description: 'Seasonal plantings, mulch refresh, proactive improvements'
  }
};

// ============================================
// AMBER ELIGIBILITY
// ============================================
export const AMBER_ELIGIBLE = {
  landscaping: [
    'Scattered weeds (not dominant)',
    'Seasonal color timing',
    'Mulch visibly thin but soil not exposed',
    'Minor debris accumulation'
  ],
  hardscapes: [
    'Single stain smaller than your hand',
    'Curb paint fading',
    'Single hairline crack (no shadow visible in crack)'
  ],
  buildingExterior: [
    'Lens dust',
    'Minor gutter debris (no overflow)',
    'Single wall stain smaller than a piece of paper'
  ],
  entrance: [
    'Mat visibly off-center but not blocking path',
    'Minor threshold dust'
  ],
  interior: [
    'Single scuff concentration in back-of-house only',
    'Single small paint bubble not yet peeling (smaller than a quarter)',
    'Single carpet edge showing early fraying (not in traffic path)',
    'Door requiring extra pressure to latch (still functional)',
    'Minor baseboard separation visible only from close inspection',
    'Single fixture with minor cosmetic scratch',
    'Single small glass chip (smaller than pencil eraser) with smooth edge'
  ]
};

export const AMBER_INELIGIBLE = [
  'ANY trip hazard, safety hazard, or Tier 1 SLA item',
  'Entry glass cleanliness (47-second test critical path)',
  'Toxic vegetation in any area accessible to students',
  'Dead/hanging limbs or hazardous tree lean',
  'Any crack, gap, or damage in arrival zone sightline',
  'Bare spots in turf visible from arrival path',
  'Water stains on interior walls or ceilings (active leak indicator)',
  'Any item that would fail Ritz-Carlton Test in isolation'
];

// ============================================
// ZONE DEFINITIONS
// ============================================
export const BG_ZONES = {
  landscaping: {
    id: 'landscaping',
    name: 'Landscaping',
    order: 1,
    description: 'Turf, beds, trees, mulch, irrigation, drainage',
    sections: [
      {
        name: 'Turf',
        checks: [
          { id: 'turf_height', text: 'Height uniform across the area?', tier: 3 },
          { id: 'turf_color', text: 'Color consistent (no yellow/brown)?', tier: 3 },
          { id: 'turf_weeds', text: 'Weeds scattered, not dominant (grass is clearly the main coverage)?', tier: 3, amberEligible: true },
          { id: 'turf_bare', text: 'No bare spots?', tier: 2, amberIneligibleIf: 'visible from arrival path' },
          { id: 'turf_scalping', text: 'No scalping or overgrowth?', tier: 3 }
        ]
      },
      {
        name: 'Edging',
        checks: [
          { id: 'edging_lines', text: 'Clean lines visible from the parking lot?', tier: 3 },
          { id: 'edging_overhang', text: 'No grass overhang onto hardscape?', tier: 3 },
          { id: 'edging_weeds', text: 'No weeds in expansion joints?', tier: 3 }
        ]
      },
      {
        name: 'Beds',
        checks: [
          { id: 'beds_healthy', text: 'Plants appear healthy (no wilting)?', tier: 3 },
          { id: 'beds_pests', text: 'No visible pest damage?', tier: 3 },
          { id: 'beds_dead', text: 'No dead plants?', tier: 3 },
          { id: 'beds_toxic', text: 'No toxic plants (oleander, poison ivy, etc.) present?', tier: 1 },
          { id: 'beds_weeds', text: 'Weeds scattered, not dominant (plants are clearly the main coverage)?', tier: 3, amberEligible: true },
          { id: 'beds_seasonal', text: 'Seasonal color present and blooming (not dead, wilted, or bare)?', tier: 4, amberEligible: true }
        ]
      },
      {
        name: 'Mulch',
        checks: [
          { id: 'mulch_coverage', text: 'Mulch visibly full with even coverage (no bare soil showing through)?', tier: 3, amberEligible: true },
          { id: 'mulch_weeds', text: 'No weed breakthrough?', tier: 3 }
        ]
      },
      {
        name: 'Trees',
        checks: [
          { id: 'trees_clearance', text: 'Can an adult walk under without ducking?', tier: 3 },
          { id: 'trees_limbs', text: 'No dead or hanging limbs?', tier: 1 },
          { id: 'trees_disease', text: 'No visible disease signs?', tier: 3 },
          { id: 'trees_lean', text: 'No hazardous lean?', tier: 1 }
        ]
      },
      {
        name: 'Irrigation (Visible)',
        checks: [
          { id: 'irrigation_leaks', text: 'No visible leaks?', tier: 2 },
          { id: 'irrigation_dry', text: 'No dry/brown spots indicating failure?', tier: 2 },
          { id: 'irrigation_overspray', text: 'No overspray on hardscape/buildings?', tier: 3 },
          { id: 'irrigation_heads', text: 'No broken heads visible?', tier: 3 }
        ]
      },
      {
        name: 'Debris',
        checks: [
          { id: 'debris_trash', text: 'Grounds free of trash?', tier: 3, amberEligible: true },
          { id: 'debris_leaves', text: 'No accumulated leaves/branches?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Drainage',
        checks: [
          { id: 'drainage_standing', text: 'No standing water (or water present on prior audit still present)?', tier: 2 },
          { id: 'drainage_erosion', text: 'No erosion visible?', tier: 2 }
        ]
      }
    ]
  },

  hardscapes: {
    id: 'hardscapes',
    name: 'Hardscapes & Parking',
    order: 2,
    description: 'Parking surface, striping, walkways, curbing, site furnishings',
    sections: [
      {
        name: 'Parking Surface',
        checks: [
          { id: 'parking_potholes', text: 'No potholes you\'d walk around to avoid?', tier: 1 },
          { id: 'parking_cracks_width', text: 'No cracks wide enough to fit a pencil?', tier: 2 },
          { id: 'parking_cracks_length', text: 'No cracks longer than a shoe length?', tier: 2 },
          { id: 'parking_oil', text: 'No oil stains larger than your hand?', tier: 3, amberEligible: true },
          { id: 'parking_stain_pattern', text: 'No visible stain pattern when pulling into the lot?', tier: 2 }
        ]
      },
      {
        name: 'Striping',
        checks: [
          { id: 'striping_visible', text: 'All lines clearly visible?', tier: 3 },
          { id: 'striping_ada', text: 'ADA markings legible?', tier: 2 }
        ]
      },
      {
        name: 'Walkways',
        checks: [
          { id: 'walkways_cracks', text: 'No cracks wide enough to fit a pencil?', tier: 2 },
          { id: 'walkways_trip', text: 'No trip hazards (would you warn someone in heels)?', tier: 1 },
          { id: 'walkways_stains', text: 'No stains/gum?', tier: 3 },
          { id: 'walkways_moss', text: 'No moss or slip hazards?', tier: 1 }
        ]
      },
      {
        name: 'Curbing',
        checks: [
          { id: 'curbing_intact', text: 'Intact (no crumbling)?', tier: 3 },
          { id: 'curbing_paint', text: 'Paint visible where applicable?', tier: 4, amberEligible: true }
        ]
      },
      {
        name: 'Site Furnishings',
        checks: [
          { id: 'furnishings_benches', text: 'Benches undamaged?', tier: 3 },
          { id: 'furnishings_graffiti', text: 'No graffiti?', tier: 2 },
          { id: 'furnishings_rust', text: 'No rust damage?', tier: 3 },
          { id: 'furnishings_trash', text: 'Trash receptacles functional?', tier: 3 }
        ]
      }
    ]
  },

  buildingExterior: {
    id: 'buildingExterior',
    name: 'Building Exterior',
    order: 3,
    description: 'Roof, gutters, walls, windows, doors, lighting',
    sections: [
      {
        name: 'Roof (Visible)',
        checks: [
          { id: 'roof_debris', text: 'No debris accumulation?', tier: 3 },
          { id: 'roof_damage', text: 'No visible damage?', tier: 2 }
        ]
      },
      {
        name: 'Gutters',
        checks: [
          { id: 'gutters_clear', text: 'Clear of debris?', tier: 3, amberEligible: true },
          { id: 'gutters_overflow', text: 'No overflow stains on walls?', tier: 2 },
          { id: 'gutters_attached', text: 'Securely attached?', tier: 2 }
        ]
      },
      {
        name: 'Walls',
        checks: [
          { id: 'walls_paint', text: 'Paint intact (no peeling larger than a quarter)?', tier: 3 },
          { id: 'walls_cracks', text: 'No cracks with visible shadow/depth?', tier: 2 },
          { id: 'walls_staining', text: 'No staining or mold visible from the parking lot approach?', tier: 2 },
          { id: 'walls_dirt', text: 'No dirt, cobwebs, or debris visible from the arrival path?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Windows (Exterior View)',
        checks: [
          { id: 'windows_intact', text: 'All panes intact?', tier: 2 },
          { id: 'windows_clean', text: 'Clean?', tier: 3 },
          { id: 'windows_seal', text: 'No visible seal failure?', tier: 3 }
        ]
      },
      {
        name: 'Exterior Doors',
        checks: [
          { id: 'doors_clean', text: 'Clean?', tier: 3 },
          { id: 'doors_damage', text: 'No damage?', tier: 2 },
          { id: 'doors_weatherstrip', text: 'Weatherstripping visible/intact?', tier: 3 }
        ]
      },
      {
        name: 'Exterior Lighting',
        checks: [
          { id: 'lighting_operational', text: 'All fixtures operational?', tier: 2 },
          { id: 'lighting_lenses', text: 'Lenses clean?', tier: 4, amberEligible: true },
          { id: 'lighting_dark', text: 'No dark zones in arrival path?', tier: 1 }
        ]
      }
    ]
  },

  entrance: {
    id: 'entrance',
    name: 'Entrance & Arrival',
    order: 4,
    description: 'Signage, entry glass, mats, threshold, Ritz-Carlton test',
    sections: [
      {
        name: 'Signage',
        checks: [
          { id: 'signage_clean', text: 'Clean?', tier: 3 },
          { id: 'signage_aligned', text: 'Straight/aligned?', tier: 3 },
          { id: 'signage_illuminated', text: 'Illuminated (if applicable)?', tier: 2 },
          { id: 'signage_visible', text: 'Visible from approach?', tier: 2 }
        ]
      },
      {
        name: 'Entry Glass',
        checks: [
          { id: 'entry_glass', text: '100% clean (no smudges/streaks)?', tier: 2, amberIneligible: true }
        ]
      },
      {
        name: 'Mats',
        checks: [
          { id: 'mats_centered', text: 'Centered?', tier: 3, amberEligible: true },
          { id: 'mats_clean', text: 'Clean?', tier: 3 },
          { id: 'mats_trip', text: 'No trip edges?', tier: 1 }
        ]
      },
      {
        name: 'Threshold',
        checks: [
          { id: 'threshold_clear', text: 'Clear of debris?', tier: 3, amberEligible: true },
          { id: 'threshold_damage', text: 'No damage?', tier: 2 }
        ]
      },
      {
        name: 'Ritz-Carlton Test',
        checks: [
          { id: 'ritz_test', text: 'Would a luxury hotel guest accept this entrance?', tier: 2 }
        ]
      }
    ]
  },

  interior: {
    id: 'interior',
    name: 'Interior Building Condition',
    order: 5,
    description: 'Walls, floors, ceilings, doors/windows, baseboards, fixtures, furniture',
    isRoomBased: true,
    requiredRooms: {
      classroom: { min: 3, label: 'Classrooms' },
      bathroom: { min: 2, label: 'Bathrooms' }
    },
    sections: [
      {
        name: 'Walls',
        checks: [
          { id: 'int_walls_paint', text: 'Paint intact (no peeling larger than a quarter)?', tier: 3 },
          { id: 'int_walls_bubbling', text: 'No bubbling or blistering?', tier: 3 },
          { id: 'int_walls_touchup', text: 'No visible touch-up patches (color mismatch) on tour route?', tier: 3 },
          { id: 'int_walls_water', text: 'No water stains larger than your hand?', tier: 1, amberIneligible: true },
          { id: 'int_walls_holes', text: 'No holes or gouges larger than a quarter?', tier: 3 },
          { id: 'int_walls_cracks', text: 'No cracks with visible shadow/depth?', tier: 2 },
          { id: 'int_walls_seams', text: 'No drywall seams, joints, or tape lines visible from arm\'s length?', tier: 3 },
          { id: 'int_walls_scuffs', text: 'No more than 3 scuff marks per wall section?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Floors',
        checks: [
          { id: 'int_floors_cracks', text: 'Hard surfaces: No cracks larger than a quarter?', tier: 2 },
          { id: 'int_floors_chips', text: 'No chips creating a lip you\'d warn someone about?', tier: 1 },
          { id: 'int_floors_tiles', text: 'No tiles loose or cracked?', tier: 2 },
          { id: 'int_floors_grout', text: 'Grout intact (no gaps larger than pencil width)?', tier: 3 },
          { id: 'int_floors_carpet_wear', text: 'Carpet: No visible wear paths from 10 feet?', tier: 3 },
          { id: 'int_floors_carpet_fray', text: 'No fraying at edges or seams?', tier: 3, amberEligible: true },
          { id: 'int_floors_carpet_ripples', text: 'No ripples or bumps?', tier: 2 },
          { id: 'int_floors_transitions', text: 'All transition strips secure (don\'t move when stepped on)?', tier: 2 }
        ]
      },
      {
        name: 'Ceilings',
        checks: [
          { id: 'int_ceilings_flush', text: 'All tiles flush with grid (no gaps visible)?', tier: 3 },
          { id: 'int_ceilings_sag', text: 'No tiles sagging below grid line?', tier: 2 },
          { id: 'int_ceilings_stains', text: 'No stains larger than your hand?', tier: 1, amberIneligible: true },
          { id: 'int_ceilings_cracks', text: 'No cracks with visible shadow/depth?', tier: 2 },
          { id: 'int_ceilings_fixtures', text: 'All fixtures and vents properly seated?', tier: 3 }
        ]
      },
      {
        name: 'Interior Doors & Windows',
        checks: [
          { id: 'int_doors_latch', text: 'Latches properly on first attempt?', tier: 2, amberEligible: true },
          { id: 'int_doors_wobble', text: 'No wobble in handle or knob?', tier: 3 },
          { id: 'int_doors_components', text: 'All components present?', tier: 3 },
          { id: 'int_doors_hinges', text: 'Hinges aligned (door closes flush to frame)?', tier: 3 },
          { id: 'int_doors_glass', text: 'Glass intact (no cracks or chips of any size)?', tier: 2, amberEligible: true },
          { id: 'int_doors_frames', text: 'Frames intact with no visible damage?', tier: 3 }
        ]
      },
      {
        name: 'Baseboards & Trim',
        checks: [
          { id: 'int_baseboards_gaps', text: 'No gaps visible from standing height?', tier: 3, amberEligible: true },
          { id: 'int_baseboards_damage', text: 'No damage longer than a hand length?', tier: 3 },
          { id: 'int_baseboards_missing', text: 'No missing sections?', tier: 2 },
          { id: 'int_baseboards_paint', text: 'Paint intact (no peeling larger than a quarter)?', tier: 3 }
        ]
      },
      {
        name: 'Fixtures (Condition)',
        checks: [
          { id: 'int_fixtures_secure', text: 'All secure and flush to surface?', tier: 2 },
          { id: 'int_fixtures_broken', text: 'No broken handles, knobs, or components?', tier: 2 },
          { id: 'int_fixtures_scratches', text: 'No chips or scratches visible from arm\'s length?', tier: 3, amberEligible: true },
          { id: 'int_fixtures_covers', text: 'All covers and plates present?', tier: 3 }
        ]
      },
      {
        name: 'Furniture (Structural)',
        checks: [
          { id: 'int_furniture_wobble', text: 'No wobble when sat on or leaned against?', tier: 2 },
          { id: 'int_furniture_legs', text: 'All legs/supports intact?', tier: 2 },
          { id: 'int_furniture_broken', text: 'No broken parts?', tier: 2 },
          { id: 'int_furniture_edges', text: 'No sharp edges exposed?', tier: 1 },
          { id: 'int_furniture_upholstery', text: 'No upholstery tears or exposed seams?', tier: 3 }
        ]
      }
    ]
  },

  observations: {
    id: 'observations',
    name: 'Observations & Routing',
    order: 6,
    description: 'Issues observed that route to other pillars',
    isObservationZone: true,
    routingCategories: [
      {
        id: 'security',
        name: 'Security',
        pillar: 'Security Pillar',
        tier: 1,
        items: [
          'Perimeter doors not latching properly',
          'Gates not self-closing and latching',
          'Fencing gaps',
          'Cameras not powered or views obstructed',
          'Access readers not functional',
          'Doors propped open'
        ]
      },
      {
        id: 'outdoor_rec',
        name: 'Outdoor Recreation',
        pillar: 'Outdoor Recreation Pillar',
        tier: 2,
        items: [
          'Equipment with visible damage',
          'Sharp edges or hazards visible',
          'Surfacing voids or displacement',
          'Hard surface exposed in fall zones',
          'Fencing or gate issues',
          'Debris/foreign objects in play area'
        ]
      },
      {
        id: 'fire_life_safety',
        name: 'Fire & Life Safety',
        pillar: 'Fire/Life Safety Pillar',
        tier: 1,
        items: [
          'Extinguishers missing or tags not current',
          'Emergency lighting not functional',
          'Exit signage not illuminated',
          'Address numbers not visible from street',
          'Egress paths obstructed'
        ]
      },
      {
        id: 'mechanical',
        name: 'Mechanical',
        pillar: 'Mechanical Domain',
        tier: 2,
        items: [
          'Temperature complaints',
          'Plumbing issues',
          'Electrical issues',
          'Elevator not functioning'
        ]
      },
      {
        id: 'cleanliness',
        name: 'Cleanliness',
        pillar: 'Cleanliness Domain',
        tier: 3,
        items: [
          'Interior cleanliness issues'
        ]
      },
      {
        id: 'structural_capital',
        name: 'Structural/Capital',
        pillar: 'Leadership',
        tier: 3,
        items: [
          'Structural cracks',
          'Foundation concerns',
          'End-of-life asset conditions',
          'Issues requiring capital investment'
        ]
      }
    ]
  },

  governance: {
    id: 'governance',
    name: 'Governance',
    order: 7,
    description: 'Process compliance and prior week follow-up',
    isGovernanceZone: true,
    sections: [
      {
        name: 'Prior Week Resolution',
        checks: [
          { id: 'gov_amber_resolved', text: 'All Amber items from prior week resolved?', tier: 2 },
          { id: 'gov_tickets_closed', text: 'All tickets from prior week closed or on track?', tier: 3 }
        ]
      },
      {
        name: 'Reporting Queue',
        checks: [
          { id: 'gov_see_it_empty', text: 'See It, Snap It feed - staff reporting queue empty?', tier: 3 }
        ]
      },
      {
        name: 'Documentation',
        checks: [
          { id: 'gov_photos_complete', text: 'Photo evidence captured for all Amber/Red items this walkthrough?', tier: 2 }
        ]
      }
    ]
  }
};

// Zone order for walkthrough flow
export const BG_ZONE_ORDER = [
  'landscaping',
  'hardscapes',
  'buildingExterior',
  'entrance',
  'interior',
  'observations',
  'governance'
];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = BG_ZONES[zoneId];
  if (!zone || !zone.sections) return [];

  return zone.sections.flatMap(section =>
    section.checks.map(check => ({
      ...check,
      section: section.name
    }))
  );
};

// Helper to calculate zone rating
export const calculateZoneRating = (zoneId, results) => {
  const checks = getZoneChecks(zoneId);

  // Check for any NO answers
  const failedChecks = checks.filter(check => results[check.id] === false);

  if (failedChecks.length === 0) {
    return 'GREEN';
  }

  // Check for Amber-Ineligible items
  const hasAmberIneligible = failedChecks.some(check => check.amberIneligible);
  if (hasAmberIneligible) {
    return 'RED';
  }

  // Check for Tier 1 (safety) items
  const hasTier1 = failedChecks.some(check => check.tier === 1);
  if (hasTier1) {
    return 'RED';
  }

  // Check if all failed items are Amber-Eligible and count <= 2
  const allAmberEligible = failedChecks.every(check => check.amberEligible);
  if (allAmberEligible && failedChecks.length <= 2) {
    return 'AMBER';
  }

  // More than 2 deviations or non-Amber-Eligible items
  if (failedChecks.length > 2) {
    return 'RED';
  }

  // Some failed checks are not Amber-Eligible
  return 'RED';
};

// Helper to calculate campus rating
export const calculateCampusRating = (zoneRatings) => {
  const zones = Object.values(zoneRatings);
  const greenCount = zones.filter(r => r === 'GREEN').length;
  const greenPercentage = (greenCount / zones.length) * 100;
  const hasSafetyFlag = zones.includes('SAFETY_FLAG');

  if (greenPercentage >= 85 && !hasSafetyFlag) {
    return 'PASS';
  }
  return 'FAIL';
};

// Helper to get SLA tier for a failed check
export const getCheckTier = (checkId) => {
  for (const zone of Object.values(BG_ZONES)) {
    if (!zone.sections) continue;
    for (const section of zone.sections) {
      const check = section.checks.find(c => c.id === checkId);
      if (check) return check.tier;
    }
  }
  return 3; // Default to Tier 3 if not found
};
