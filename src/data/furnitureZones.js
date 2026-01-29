// Furniture & Decor Quality Bar
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
  // Weekly - Safety hazards
  'weekly_safety_hazards',
  // Monthly - Ergonomic Standards
  'monthly_ergonomic_chairs_height',
  'monthly_ergonomic_desks_height',
  // Monthly - Safety
  'monthly_safety_sharp_edges',
  // Biophilic - Dead/dying plants
  'weekly_biophilic_plants_healthy',
  // Wayfinding/Branding breaks
  'weekly_handwritten_signs',
  // Furniture clutter/alignment
  'weekly_furniture_misaligned',
  // Visible garbage/bins
  'weekly_visible_garbage'
];

// ============================================
// PHOTO REQUIREMENTS
// ============================================
export const PHOTO_REQUIRED_CHECKS = [
  // Daily VIP Checks
  'daily_vip_glass_clean',
  'daily_vip_branding_lit',
  'daily_vip_bathrooms',
  // Daily Capacity
  'daily_capacity_overflow',
  // Weekly
  'weekly_condition_damage',
  'weekly_condition_stains',
  'weekly_safety_hazards',
  // Monthly
  'monthly_desks_condition',
  'monthly_chairs_condition',
  'monthly_safety_sharp_edges',
  'monthly_brand_signage',
  'monthly_brand_wall_damage',
  'monthly_lighting_burnt_out',
  'monthly_flooring_damage',
  // Quarterly
  'quarterly_special_spaces_condition'
];

// ============================================
// FURNITURE ZONES (CHECK TYPES)
// ============================================
export const FURNITURE_ZONES = {
  daily: {
    id: 'daily',
    name: 'Daily Pulse Checks',
    frequency: 'daily',
    order: 1,
    description: 'Ensure the 3 C\'s are intact and check for immediate capacity friction',
    timeNeeded: '20-25 minutes',
    persona: 'Guide or Facilities Staff',
    sections: [
      {
        name: 'A. VIP Ready Pulse (Curb Appeal & Workspace Setup)',
        description: 'Walk through main entrance and common areas to verify VIP readiness.',
        checks: [
          {
            id: 'daily_vip_glass_clean',
            text: 'Is exterior glass and handles smudge-free? Is there no litter at the doorstep or in parking stalls?',
            helpText: 'Entrance Check',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'daily_vip_scent_active',
            text: 'Is the signature scent active and detectable at the main entrance?',
            helpText: 'The Scent',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_branding_lit',
            text: 'Is branding signage illuminated and visible from the street?',
            helpText: 'First Look',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'daily_vip_power_hubs',
            text: 'Are all coworking power hubs accessible?',
            helpText: 'Tech-Check',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_lighting_preset',
            text: 'Is smart lighting set to the morning light preset?',
            helpText: 'Tech-Check',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_furniture_tucked',
            text: 'Are chairs tucked in and lounge furniture straightened from the previous evening\'s use?',
            helpText: 'Furniture Alignment',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_no_clutter',
            text: 'Is there no abandoned "temp" signage, loose cables, or left-behind items in common areas?',
            helpText: 'Clutter Control',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_temperature',
            text: 'Is the temperature set to the brand standard (not too cold/hot)?',
            helpText: 'Climate',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_bathrooms',
            text: 'Are mirrors spotless, surfaces dry, and high-end consumables stocked in the bathrooms?',
            helpText: 'Bathrooms - VIP Standard',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'daily_vip_biophilic',
            text: 'Are there no visible fallen leaves or stagnant water in interior garden features?',
            helpText: 'Biophilic Check',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_vip_bins_empty',
            text: 'Are all garbage and sanitary bins empty and liners hidden?',
            helpText: 'Refuse',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Capacity Pulse (The "Friction" Check)',
        description: 'Performed during peak hours to identify capacity issues.',
        checks: [
          {
            id: 'daily_capacity_10_percent_open',
            text: 'Is there at least 10% open seating in every zone?',
            helpText: 'If 0%, the "Luxury" experience is failing.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_capacity_rooms_intended_use',
            text: 'Are students using rooms as intended? (e.g., Is a "Quiet Study" room being used for loud "Rec" because the Rec area is full?)',
            helpText: 'Check for cross-usage due to capacity issues',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_capacity_outlet_crowding',
            text: 'Are students huddled around specific outlets because others are broken or poorly placed?',
            helpText: 'Outlet distribution check',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'daily_capacity_overflow',
            text: 'Are students sitting on floors or "non-seat" surfaces (planters, stairs)?',
            helpText: 'The "Overflow" Check',
            tier: 'amber',
            photoRequired: true
          }
        ]
      }
    ]
  },

  weekly: {
    id: 'weekly',
    name: 'Weekly Pulse Checks',
    frequency: 'weekly',
    order: 2,
    description: 'Quick visual scan of furniture condition and strategic usage, plus a quality audit of the high-end experience',
    timeNeeded: '30-40 minutes',
    persona: 'Guide or Facilities Staff',
    sections: [
      {
        name: 'A. Furniture Condition, Usage, and Safety',
        description: 'Walk through main areas and assess furniture condition and safety.',
        checks: [
          {
            id: 'weekly_condition_damage',
            text: 'Is furniture in good overall condition (no visible damage or excessive wear)?',
            helpText: 'Examples: broken parts, cracks, peeling laminate, heavy fading, major scratches.',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'weekly_condition_stains',
            text: 'Is upholstered/soft seating free of visible stains or odors?',
            helpText: 'Includes sofas, cushions, fabric chairs, lounge seating.',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'weekly_condition_functional',
            text: 'Is furniture functional as intended?',
            helpText: 'Examples: drawers open/close, chairs roll/adjust, tables stable, shelves/cabinets open safely.',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_safety_hazards',
            text: 'Are there any furniture safety hazards?',
            helpText: 'Examples: wobbling chairs, unstable shelving, sharp edges, broken wheels, exposed nails/screws, tip risk.',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'weekly_furniture_appropriate_use',
            text: 'Is furniture appropriate and used as intended for the space?',
            helpText: 'Examples: desks used for work, seating supports the activity, no "workarounds" (students sitting on floors because chairs unusable).',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_furniture_arrangement',
            text: 'Is furniture arranged to support instruction and movement?',
            helpText: 'Examples: collaboration areas exist, quiet/focus areas exist, pathways are clear.',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Luxury-Tech Standards (Quality Audit)',
        description: 'Quality audit of the high-end experience elements.',
        checks: [
          {
            id: 'weekly_branding_signage_clean',
            text: 'Is exterior branding signage clean, lit (if applicable), and unobstructed?',
            helpText: 'Check all exterior brand elements',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_scent_functioning',
            text: 'Is the signature scent present and functioning at entry (not missing, not overpowering)?',
            helpText: 'Scent should be subtle but detectable',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_entry_lighting',
            text: 'Is entry lighting set to the approved brightness/scene ("Welcome" scene)?',
            helpText: 'Check lighting presets are correct',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_wayfinding_signs',
            text: 'Are wayfinding/directional signs clean and clearly readable?',
            helpText: 'All directional and informational signage',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_smart_lighting_scenes',
            text: 'Are smart lighting scenes functioning correctly (no failed zones, correct scene active)?',
            helpText: 'Test all lighting zones',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_forgotten_spots_clean',
            text: 'Are "forgotten spots" clean and intact (ceilings, corners, acoustic panels - no dust or damage)?',
            helpText: 'Check areas often overlooked in daily cleaning',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_furniture_reset',
            text: 'Is furniture reset to the approved layout (no drift, clear pathways)?',
            helpText: 'Compare to original layout design',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_biophilic_plants_healthy',
            text: 'Are plants healthy and presentable (no dead leaves, not dusty)?',
            helpText: 'Dead or dying plants are an INSTANT RED',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'weekly_bins_bathrooms_clean',
            text: 'Are bins emptied/discreet and bathrooms clean + fully stocked (soap/paper/scent items)?',
            helpText: 'Full bathroom and refuse check',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'C. Capacity Deep-Dive (The "Strategy" Check)',
        description: 'Please consult with your CC and Lead Guide on the below.',
        checks: [
          {
            id: 'weekly_capacity_furniture_count_matches',
            text: 'Does the furniture count in every room type (Learning, Rec, Social) match the original design blueprint?',
            helpText: 'Inventory vs. Intent',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_capacity_dead_zones_identified',
            text: 'Have "Dead Zones" (under-utilized rooms) vs. "Hot Zones" (over-crowded) been identified to inform furniture movement?',
            helpText: 'Zone Balance',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_capacity_rec_surface_space',
            text: 'Are "Rec" areas providing enough surface space for "Learning" if students are cross-using the space?',
            helpText: 'Furniture Versatility',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_capacity_high_traffic_integrity',
            text: 'Has high-traffic seating been checked for structural integrity (as over-capacity leads to faster degradation)?',
            helpText: 'Wear & Tear per Capita',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'weekly_capacity_new_level_activity',
            text: 'Do you have a new learning level starting soon? Or some form of new activity starting soon? (i.e., something that would drive the need for a new space)',
            helpText: 'Planning for capacity changes',
            tier: 'amber',
            photoRequired: false
          }
        ]
      }
    ]
  },

  monthly: {
    id: 'monthly',
    name: 'Monthly Condition Scan',
    frequency: 'monthly',
    order: 3,
    description: 'Detailed assessment of furniture condition and environment',
    timeNeeded: '45-60 minutes',
    persona: 'Facilities Staff',
    sections: [
      {
        name: 'A. Detailed Furniture Assessment',
        description: 'Thoroughly check each furniture category.',
        checks: [
          {
            id: 'monthly_desks_condition',
            text: 'Are all desks/tables in good condition?',
            helpText: 'Surfaces smooth, legs stable, no wobble',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'monthly_chairs_condition',
            text: 'Are all chairs in good condition?',
            helpText: 'Seats intact, backs secure, wheels working',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'monthly_storage_condition',
            text: 'Are all storage units in good condition?',
            helpText: 'Shelves secure, doors close properly, drawers slide',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_soft_seating_condition',
            text: 'Is soft seating in good condition?',
            helpText: 'Sofas, lounge chairs - cushions intact, no sagging',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Ergonomic Standards',
        description: 'Verify furniture meets ergonomic requirements.',
        checks: [
          {
            id: 'monthly_ergonomic_chairs_height',
            text: 'Do work chairs have appropriate height?',
            helpText: 'Required for proper posture',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'monthly_ergonomic_desks_height',
            text: 'Are desks at appropriate working height?',
            helpText: 'Standard 28-30 inches or adjustable',
            tier: 'red',
            instantRed: true,
            photoRequired: false
          },
          {
            id: 'monthly_ergonomic_monitor_space',
            text: 'Is there appropriate space for monitor placement?',
            helpText: 'Desk depth allows proper eye distance',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_ergonomic_keyboard_space',
            text: 'Is there adequate space for keyboard/mouse?',
            helpText: 'Comfortable arm position possible',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'C. Safety Detailed Check',
        description: 'Thorough safety inspection of all furniture.',
        checks: [
          {
            id: 'monthly_safety_sharp_edges',
            text: 'Is all furniture free of sharp edges or exposed hardware?',
            helpText: 'No protruding screws, sharp corners, rough edges',
            tier: 'red',
            instantRed: true,
            photoRequired: true
          },
          {
            id: 'monthly_safety_weight_limits',
            text: 'Is furniture being used within weight limits?',
            helpText: 'Shelving not overloaded, chairs appropriate for users',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_safety_tip_hazards',
            text: 'Are tall items secured against tipping?',
            helpText: 'Bookcases, tall shelving units anchored if needed',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'D. Decor & Brand Standards',
        description: 'Check environmental and brand elements.',
        checks: [
          {
            id: 'monthly_brand_signage',
            text: 'Is all signage in good condition?',
            helpText: 'Not faded, peeling, or damaged',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'monthly_brand_colors_consistent',
            text: 'Are brand colors consistent throughout?',
            helpText: 'Matches Alpha Schools brand guidelines',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_brand_wall_damage',
            text: 'Are walls free of damage and marks?',
            helpText: 'No holes, scuffs, or unauthorized postings',
            tier: 'amber',
            photoRequired: true
          }
        ]
      },
      {
        name: 'E. Lighting & Environment',
        description: 'Check environmental comfort factors.',
        checks: [
          {
            id: 'monthly_lighting_adequate',
            text: 'Is lighting adequate for all work areas?',
            helpText: 'No dark spots, appropriate brightness',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_lighting_burnt_out',
            text: 'Are all lights working (no burnt out bulbs)?',
            helpText: 'Check overhead and task lighting',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'monthly_flooring_condition',
            text: 'Is flooring in good condition?',
            helpText: 'No tears, stains, or trip hazards',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'monthly_flooring_damage',
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
    order: 4,
    description: 'Comprehensive review including satisfaction and special spaces',
    timeNeeded: '60-90 minutes',
    persona: 'Facilities Manager',
    sections: [
      {
        name: 'A. Satisfaction Review',
        description: 'Review feedback from guides and students.',
        checks: [
          {
            id: 'quarterly_satisfaction_guide_reviewed',
            text: 'Has guide satisfaction feedback been reviewed?',
            helpText: 'Check survey results or gather informal feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_satisfaction_guide_positive',
            text: 'Is guide satisfaction with furniture positive (4+ rating)?',
            helpText: 'Based on recent surveys or feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_satisfaction_student_reviewed',
            text: 'Has student satisfaction feedback been reviewed?',
            helpText: 'Check survey results or gather informal feedback',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_satisfaction_student_positive',
            text: 'Is student satisfaction with furniture positive (4+ rating)?',
            helpText: 'Based on recent surveys or feedback',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Special Spaces',
        description: 'Review specialized areas and their unique furniture needs.',
        checks: [
          {
            id: 'quarterly_special_spaces_identified',
            text: 'Are all special spaces identified and documented?',
            helpText: 'Labs, maker spaces, quiet rooms, collaboration zones',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_special_spaces_condition',
            text: 'Is specialized furniture in these spaces in good condition?',
            helpText: 'Lab tables, maker benches, lounge furniture',
            tier: 'amber',
            photoRequired: true
          },
          {
            id: 'quarterly_special_spaces_appropriate',
            text: 'Is furniture appropriate for each space type?',
            helpText: 'Matches the intended use of the space',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'C. Biophilic & Comfort Elements',
        description: 'Check elements that enhance wellbeing.',
        checks: [
          {
            id: 'quarterly_biophilic_natural_light',
            text: 'Is natural light being maximized?',
            helpText: 'Blinds open when appropriate, windows unobstructed',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_comfort_noise',
            text: 'Are noise levels appropriate for each space?',
            helpText: 'Quiet zones are quiet, collaboration spaces have acoustic management',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'D. Replacement Planning',
        description: 'Identify items that may need replacement.',
        checks: [
          {
            id: 'quarterly_replacement_identified',
            text: 'Have items needing replacement been identified?',
            helpText: 'Track items past useful life or beyond repair',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_replacement_documented',
            text: 'Are replacement needs documented and prioritized?',
            helpText: 'List with estimated costs and urgency',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'quarterly_replacement_budget',
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
    order: 5,
    description: 'Full inventory and strategic planning review',
    timeNeeded: '2-3 hours',
    persona: 'Facilities Manager + Leadership',
    sections: [
      {
        name: 'A. Inventory Verification',
        description: 'Verify furniture inventory is accurate and complete.',
        checks: [
          {
            id: 'annual_inventory_exists',
            text: 'Does a complete furniture inventory exist?',
            helpText: 'List of all furniture items by location',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_inventory_accurate',
            text: 'Has the inventory been verified against actual items?',
            helpText: 'Walk-through confirms inventory matches reality',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_inventory_ages_tracked',
            text: 'Are furniture ages/purchase dates tracked?',
            helpText: 'Know when items were acquired for replacement planning',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'B. Vendor & Warranty Review',
        description: 'Review vendor relationships and warranty coverage.',
        checks: [
          {
            id: 'annual_warranty_tracked',
            text: 'Are warranties tracked and documented?',
            helpText: 'Know what is still under warranty',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_vendor_performance',
            text: 'Has vendor performance been reviewed?',
            helpText: 'Quality, delivery, service satisfaction',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_vendor_contracts_current',
            text: 'Are vendor contracts current and competitive?',
            helpText: 'Reviewed within last 12 months',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'C. Strategic Planning',
        description: 'Long-term furniture and environment planning.',
        checks: [
          {
            id: 'annual_strategy_refresh_plan',
            text: 'Is there a furniture refresh/replacement plan?',
            helpText: 'Multi-year plan for systematic updates',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_strategy_budget_adequate',
            text: 'Is annual furniture budget adequate?',
            helpText: 'Covers maintenance, repairs, and planned replacements',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_strategy_standards_documented',
            text: 'Are furniture standards documented?',
            helpText: 'Approved brands, specs, and requirements for new purchases',
            tier: 'amber',
            photoRequired: false
          }
        ]
      },
      {
        name: 'D. Compliance & Accessibility',
        description: 'Ensure furniture meets compliance requirements.',
        checks: [
          {
            id: 'annual_compliance_ada',
            text: 'Does furniture meet ADA accessibility requirements?',
            helpText: 'Accessible seating, appropriate heights, clearances',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_compliance_fire_code',
            text: 'Does furniture arrangement meet fire code?',
            helpText: 'Clear pathways, proper egress, fire-rated materials',
            tier: 'amber',
            photoRequired: false
          },
          {
            id: 'annual_compliance_certifications',
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

// Zone order for navigation
export const FURNITURE_ZONE_ORDER = ['daily', 'weekly', 'monthly', 'quarterly', 'annual'];

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

// Metric 5: Capacity Equilibrium
// The Goal: Ensure a 1:1.1 seat-to-student ratio across all learning and rec modalities
// to prevent friction and preserve the "Resort" feel.
export const CAPACITY_METRIC = {
  name: 'Capacity Equilibrium',
  targetRatio: 1.1,
  description: 'Seat-to-student ratio across all learning and rec modalities'
};

// Quality Bar Red Flags Summary
// If you see these, the standard is NOT met - Fix immediately:
export const RED_FLAG_SUMMARY = [
  'Wobbly chairs, unstable shelving, trip hazards (Quick Safety Check)',
  'Loose joints, cracked frames, broken wheels (Quick Safety Check)',
  'Work chairs without adjustable height (Ergonomic Standards)',
  'Desks not at appropriate working height (Ergonomic Standards)',
  'Sharp edges or exposed hardware (Safety Detailed Check)',
  'Dead or dying plants (Biophilics)',
  'Handwritten "out of order" or "keep door closed" signs (Breaks Wayfinding/Branding)',
  'Misaligned furniture "clutter" (Breaks the Luxury Aesthetic)',
  'Visible garbage or overflowing bins (Breaks the Resort standard)'
];

// Total questions: 75
// INSTANT RED items = automatic RED rating if answered NO
