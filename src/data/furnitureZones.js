// Furniture & Decor Quality Bar - 14.08 Sustain
// Based on Taraya Voelker & Austin Ray's Quality Bar
// Pillar: Furniture (Core) + Decor & Environment

// ============================================
// RAG RATING RULES
// ============================================
export const FURNITURE_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES',
      '95%+ furniture in good/excellent condition',
      '95%+ furniture in active use',
      '100% ergonomic requirements met',
      'Guide satisfaction 4.5+',
      'Student satisfaction 4.5+',
      'No safety issues identified'
    ]
  },
  amber: {
    description: 'At Risk',
    criteria: [
      'No more than 3 open issues across all checks',
      'Each issue has a named owner assigned',
      'Each issue has a fix date within 45 days',
      'No INSTANT RED items failed',
      '80-94% furniture in good condition',
      'Satisfaction scores 3.5-4.4'
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
      'Less than 80% furniture in good condition',
      'Any safety hazard identified',
      'Satisfaction scores below 3.5'
    ]
  }
};

// ============================================
// INSTANT RED ITEMS
// These cannot be Amber - NO answer = automatic RED
// ============================================
export const INSTANT_RED_CHECKS = [
  'safety_hazards',
  'safety_structural',
  'safety_sharp_edges',
  'ergonomic_chairs_adjustable',
  'ergonomic_desks_height'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  'condition_damage',
  'condition_wear',
  'condition_stains',
  'safety_hazards',
  'safety_structural',
  'safety_sharp_edges',
  'brand_signage_condition',
  'brand_wall_damage',
  'lighting_burnt_out',
  'flooring_damage',
  'special_spaces_condition'
];

// ============================================
// FURNITURE ZONES (CHECK TYPES)
// ============================================
export const FURNITURE_ZONES = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Pulse Check',
    frequency: 'weekly',
    order: 1,
    description: 'Quick visual scan of furniture condition and usage',
    timeNeeded: '15-20 minutes',
    persona: 'Guide or Facilities Staff',
    sections: [
      {
        name: 'Furniture Condition Scan',
        description: 'Walk through main areas and visually assess furniture condition.',
        checks: [
          {
            id: 'condition_damage',
            text: 'Is all furniture free of visible damage?',
            helpText: 'No broken legs, torn upholstery, cracked surfaces',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'condition_wear',
            text: 'Is furniture free of excessive wear?',
            helpText: 'No peeling, fading, or significant scratches',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'condition_stains',
            text: 'Is upholstered furniture free of stains?',
            helpText: 'Chairs, sofas, cushions are clean',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'condition_functional',
            text: 'Is all furniture fully functional?',
            helpText: 'Drawers open, chairs roll, tables stable',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Usage Check',
        description: 'Observe if furniture is being used appropriately.',
        checks: [
          {
            id: 'usage_being_used',
            text: 'Is furniture being actively used by students/staff?',
            helpText: 'Not sitting empty or avoided',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'usage_appropriate',
            text: 'Is furniture being used for its intended purpose?',
            helpText: 'Desks for work, chairs for sitting, etc.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'usage_arrangement',
            text: 'Is furniture arranged to support collaboration and focus?',
            helpText: 'Proper spacing, not blocking pathways',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Quick Safety Check',
        description: 'Identify any immediate safety concerns.',
        checks: [
          {
            id: 'safety_hazards',
            text: 'Is the space free of furniture-related safety hazards?',
            helpText: 'No wobbly chairs, unstable shelving, trip hazards',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'safety_structural',
            text: 'Is all furniture structurally sound?',
            helpText: 'No loose joints, cracked frames, broken wheels',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          }
        ]
      }
    ]
  },

  monthly: {
    id: 'monthly',
    name: 'Monthly Condition Scan',
    frequency: 'monthly',
    order: 2,
    description: 'Detailed assessment of furniture condition and environment',
    timeNeeded: '45-60 minutes',
    persona: 'Facilities Staff',
    sections: [
      {
        name: 'Detailed Furniture Assessment',
        description: 'Thoroughly check each furniture category.',
        checks: [
          {
            id: 'desks_condition',
            text: 'Are all desks/tables in good condition?',
            helpText: 'Surfaces smooth, legs stable, no wobble',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'chairs_condition',
            text: 'Are all chairs in good condition?',
            helpText: 'Seats intact, backs secure, wheels working',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'storage_condition',
            text: 'Are all storage units in good condition?',
            helpText: 'Shelves secure, doors close properly, drawers slide',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'soft_seating_condition',
            text: 'Is soft seating in good condition?',
            helpText: 'Sofas, lounge chairs - cushions intact, no sagging',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Ergonomic Standards',
        description: 'Verify furniture meets ergonomic requirements.',
        checks: [
          {
            id: 'ergonomic_chairs_adjustable',
            text: 'Do work chairs have adjustable height?',
            helpText: 'Required for proper posture',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'ergonomic_desks_height',
            text: 'Are desks at appropriate working height?',
            helpText: 'Standard 28-30 inches or adjustable',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'ergonomic_monitor_placement',
            text: 'Is there appropriate space for monitor placement?',
            helpText: 'Desk depth allows proper eye distance',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'ergonomic_keyboard_space',
            text: 'Is there adequate space for keyboard/mouse?',
            helpText: 'Comfortable arm position possible',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Safety Detailed Check',
        description: 'Thorough safety inspection of all furniture.',
        checks: [
          {
            id: 'safety_sharp_edges',
            text: 'Is all furniture free of sharp edges or exposed hardware?',
            helpText: 'No protruding screws, sharp corners, rough edges',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'safety_weight_limits',
            text: 'Is furniture being used within weight limits?',
            helpText: 'Shelving not overloaded, chairs appropriate for users',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'safety_tip_hazards',
            text: 'Are tall items secured against tipping?',
            helpText: 'Bookcases, tall shelving units anchored if needed',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Decor & Brand Standards',
        description: 'Check environmental and brand elements.',
        checks: [
          {
            id: 'brand_signage_condition',
            text: 'Is all signage in good condition?',
            helpText: 'Not faded, peeling, or damaged',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'brand_colors_consistent',
            text: 'Are brand colors consistent throughout?',
            helpText: 'Matches Alpha Schools brand guidelines',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'brand_wall_damage',
            text: 'Are walls free of damage and marks?',
            helpText: 'No holes, scuffs, or unauthorized postings',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'Lighting & Environment',
        description: 'Check environmental comfort factors.',
        checks: [
          {
            id: 'lighting_adequate',
            text: 'Is lighting adequate for all work areas?',
            helpText: 'No dark spots, appropriate brightness',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'lighting_burnt_out',
            text: 'Are all lights working (no burnt out bulbs)?',
            helpText: 'Check overhead and task lighting',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'flooring_condition',
            text: 'Is flooring in good condition?',
            helpText: 'No tears, stains, or trip hazards',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'flooring_damage',
            text: 'Is flooring free of damage needing repair?',
            helpText: 'No loose tiles, carpet edges, or cracks',
            tier: 'amber',
            photoRequired: true
          }
        ]
      }
    ]
  },

  quarterly: {
    id: 'quarterly',
    name: 'Quarterly Deep Review',
    frequency: 'quarterly',
    order: 3,
    description: 'Comprehensive review including satisfaction and special spaces',
    timeNeeded: '60-90 minutes',
    persona: 'Facilities Manager',
    sections: [
      {
        name: 'Satisfaction Review',
        description: 'Review feedback from guides and students.',
        checks: [
          {
            id: 'satisfaction_guide_reviewed',
            text: 'Has guide satisfaction feedback been reviewed?',
            helpText: 'Check survey results or gather informal feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'satisfaction_guide_positive',
            text: 'Is guide satisfaction with furniture positive (3.5+ rating)?',
            helpText: 'Based on recent surveys or feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'satisfaction_student_reviewed',
            text: 'Has student satisfaction feedback been reviewed?',
            helpText: 'Check survey results or gather informal feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'satisfaction_student_positive',
            text: 'Is student satisfaction with furniture positive (3.5+ rating)?',
            helpText: 'Based on recent surveys or feedback',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Special Spaces',
        description: 'Review specialized areas and their unique furniture needs.',
        checks: [
          {
            id: 'special_spaces_identified',
            text: 'Are all special spaces identified and documented?',
            helpText: 'Labs, maker spaces, quiet rooms, collaboration zones',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'special_spaces_condition',
            text: 'Is specialized furniture in these spaces in good condition?',
            helpText: 'Lab tables, maker benches, lounge furniture',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'special_spaces_appropriate',
            text: 'Is furniture appropriate for each space type?',
            helpText: 'Matches the intended use of the space',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Biophilic & Comfort Elements',
        description: 'Check elements that enhance wellbeing.',
        checks: [
          {
            id: 'biophilic_plants',
            text: 'Are indoor plants healthy and well-maintained?',
            helpText: 'If applicable - no dead plants, proper care',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'biophilic_natural_light',
            text: 'Is natural light being maximized?',
            helpText: 'Blinds open when appropriate, windows unobstructed',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'comfort_temperature',
            text: 'Are temperature controls working properly?',
            helpText: 'Comfortable working environment',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'comfort_noise',
            text: 'Are noise levels appropriate for each space?',
            helpText: 'Quiet zones are quiet, collaboration spaces have acoustic management',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Replacement Planning',
        description: 'Identify items that may need replacement.',
        checks: [
          {
            id: 'replacement_identified',
            text: 'Have items needing replacement been identified?',
            helpText: 'Track items past useful life or beyond repair',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'replacement_documented',
            text: 'Are replacement needs documented and prioritized?',
            helpText: 'List with estimated costs and urgency',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'replacement_budget',
            text: 'Is there a plan/budget for necessary replacements?',
            helpText: 'Included in facilities planning',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  },

  annual: {
    id: 'annual',
    name: 'Annual Comprehensive Review',
    frequency: 'annual',
    order: 4,
    description: 'Full inventory and strategic planning review',
    timeNeeded: '2-3 hours',
    persona: 'Facilities Manager + Leadership',
    sections: [
      {
        name: 'Inventory Verification',
        description: 'Verify furniture inventory is accurate and complete.',
        checks: [
          {
            id: 'inventory_exists',
            text: 'Does a complete furniture inventory exist?',
            helpText: 'List of all furniture items by location',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'inventory_accurate',
            text: 'Has the inventory been verified against actual items?',
            helpText: 'Walk-through confirms inventory matches reality',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'inventory_ages_tracked',
            text: 'Are furniture ages/purchase dates tracked?',
            helpText: 'Know when items were acquired for replacement planning',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Vendor & Warranty Review',
        description: 'Review vendor relationships and warranty coverage.',
        checks: [
          {
            id: 'warranty_tracked',
            text: 'Are warranties tracked and documented?',
            helpText: 'Know what is still under warranty',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'vendor_performance',
            text: 'Has vendor performance been reviewed?',
            helpText: 'Quality, delivery, service satisfaction',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'vendor_contracts_current',
            text: 'Are vendor contracts current and competitive?',
            helpText: 'Reviewed within last 12 months',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Strategic Planning',
        description: 'Long-term furniture and environment planning.',
        checks: [
          {
            id: 'strategy_refresh_plan',
            text: 'Is there a furniture refresh/replacement plan?',
            helpText: 'Multi-year plan for systematic updates',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'strategy_budget_allocated',
            text: 'Is annual furniture budget adequate?',
            helpText: 'Covers maintenance, repairs, and planned replacements',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'strategy_standards_documented',
            text: 'Are furniture standards documented?',
            helpText: 'Approved brands, specs, and requirements for new purchases',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'Compliance & Accessibility',
        description: 'Ensure furniture meets compliance requirements.',
        checks: [
          {
            id: 'compliance_ada',
            text: 'Does furniture meet ADA accessibility requirements?',
            helpText: 'Accessible seating, appropriate heights, clearances',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'compliance_fire_code',
            text: 'Does furniture arrangement meet fire code?',
            helpText: 'Clear pathways, proper egress, fire-rated materials',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'compliance_certifications',
            text: 'Is furniture from certified/approved manufacturers?',
            helpText: 'BIFMA, GREENGUARD, or equivalent certifications',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  }
};

// Zone order for navigation (not used for flow, just for display)
export const FURNITURE_ZONE_ORDER = ['weekly', 'monthly', 'quarterly', 'annual'];

// Helper to get all checks for a zone
export const getZoneChecks = (zoneId) => {
  const zone = FURNITURE_ZONES[zoneId];
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

  if (openIssues.length > FURNITURE_RAG_RULES.amber.maxOpenIssues) {
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
    return daysDiff > FURNITURE_RAG_RULES.amber.maxDaysToFix;
  });
  if (overdue) {
    return 'RED';
  }

  // All failed checks are amber-eligible and within limits
  return 'AMBER';
};
