// Cleanliness Quality Bar - Weekly & Monthly Audits
// Based on 14.12 Cleanliness Quality Bar (Sean Hubbard)
// Standard: APPA Level 2 - Ordinary Tidiness
//
// Architecture:
//   - Daily QC remains in zones.js (unchanged)
//   - This file defines Weekly Audit + Monthly Deep Dive
//   - Weekly = Tour Route (full check) + Assigned Rooms (from campus map)
//   - Monthly = Deep Dive inspection + 30-Day Review rollup
//   - Room assignments rotate weekly so all rooms get checked at least 1x/month
//     and the tour route gets checked 4x/month

// ============================================
// RAG RATING RULES (from Quality Bar 14.12)
// ============================================
export const CLEANLINESS_RAG_RULES = {
  green: {
    description: 'World Class',
    criteria: [
      'All checks answered YES in all inspected zones',
      '"Tour Ready" = Yes',
      'No open issues from previous checks',
      'No repeat defects (same zone within 30 days)'
    ]
  },
  amber: {
    description: 'Needs Attention',
    criteria: [
      'Up to 5 non-critical defects exist',
      'No defects are instant-red items (restrooms, safety, tour ready)',
      'No repeat failures (same zone within 30 days)',
      'Campus is still confirmed "Tour Ready"',
      'All defects documented with work orders'
    ],
    maxOpenIssues: 5,
    maxDaysToFix: 7, // 1 week to remediate per SLA discussion
    maxHoursInAmber: 168 // 7 days
  },
  red: {
    description: 'Not Meeting Standard',
    criteria: [
      'Any INSTANT RED item failed (restroom defect or safety/EHS hazard)',
      'More than 5 non-critical defects',
      'Repeat defect in same zone within 30 days',
      'Defects not remediated within 7 days',
      'Vendor missed same task two consecutive nights',
      'Any missed task not corrected within SLA'
    ]
  }
};

// ============================================
// SLA TIERS (from Quality Bar)
// ============================================
export const SLA_TIERS = {
  tier1: {
    name: 'Safety/EHS',
    response: 'Immediate',
    resolution: 'Same day',
    applies: 'Standing water, chemicals accessible, blocked exits, pest evidence, mold/mildew, bodily fluids'
  },
  tier2: {
    name: 'Restroom/Parent-Facing',
    response: '<4 hours',
    resolution: '<24 hours',
    applies: 'Any restroom defect, lobby/entrance issues, tour route defects'
  },
  tier3: {
    name: 'Routine',
    response: '<24 hours',
    resolution: '5 days',
    applies: 'Classroom defects, hallway issues, standard cleaning misses'
  },
  tier4: {
    name: 'Deep Clean',
    response: 'Scheduled',
    resolution: 'Per cycle (monthly/quarterly/session break)',
    applies: 'Carpet extraction, floor stripping, high dusting, grout cleaning'
  }
};

// ============================================
// INSTANT RED ITEMS (Amber-Ineligible)
// NO answer = automatic RED, cannot be Amber
// ============================================
export const CLEANLINESS_INSTANT_RED_CHECKS = [
  // Safety/EHS failures (zero tolerance)
  'entry_safe',
  'hall_safe',
  'commons_safe',
  'ehs_no_standing_water',
  'ehs_no_blocked_exits',
  'ehs_no_exposed_wiring',
  'ehs_no_loose_cords',
  'ehs_no_unsecured_chemicals',
  'ehs_no_pest_evidence',
  'ehs_no_mold_mildew',
  'ehs_no_active_moisture',
  // Restroom failures (ANY restroom defect = instant red)
  'restroom_toilets_clean',
  'restroom_sinks_clean',
  'restroom_mirrors_clean',
  'restroom_floor_clean',
  'restroom_soap_stocked',
  'restroom_towels_stocked',
  'restroom_tp_stocked',
  'restroom_trash_empty',
  'restroom_odor_free',
  'restroom_safe'
];

// ============================================
// PHOTO REQUIREMENTS
// Photos required for amber-ineligible or disputed items
// ============================================
export const CLEANLINESS_PHOTO_REQUIRED_CHECKS = [
  // All restroom checks
  'restroom_toilets_clean',
  'restroom_sinks_clean',
  'restroom_mirrors_clean',
  'restroom_floor_clean',
  'restroom_soap_stocked',
  'restroom_towels_stocked',
  'restroom_tp_stocked',
  'restroom_trash_empty',
  'restroom_odor_free',
  'restroom_safe',
  // Safety/EHS checks
  'ehs_no_standing_water',
  'ehs_no_blocked_exits',
  'ehs_no_exposed_wiring',
  'ehs_no_unsecured_chemicals',
  'ehs_no_pest_evidence',
  'ehs_no_mold_mildew',
  'ehs_no_active_moisture',
  // Deep clean verification (monthly)
  'deep_grout_condition',
  'deep_carpet_condition',
  'deep_ceiling_tiles'
];

// ============================================
// AMBER-ELIGIBLE DEVIATIONS (Exhaustive Allow-List)
// Only these specific conditions can be Amber instead of Red
// ============================================
export const AMBER_ELIGIBLE_EXAMPLES = [
  'Single dust line on non-tour-route baseboard',
  'Minor scuff on back-office floor',
  'Single cobweb in non-parent-facing corner',
  'Single dispenser at low (not empty) level in non-restroom zone',
  'Single smudge on interior (non-tour-route) glass',
  'Furniture slightly misaligned in back-office area'
];

// ============================================
// WEEKLY AUDIT ZONES
// Tour Route (every week) + Assigned Rooms (rotating)
// ============================================
export const CLEANLINESS_ZONES = {
  weekly: {
    id: 'weekly',
    name: 'Weekly Audit',
    frequency: 'weekly',
    order: 1,
    description: 'Complete before staff and students arrive (typically 6:00-7:30 AM). Verifies overnight vendor work. Tour route + assigned rooms. Must be completed 4x/month.',
    timeNeeded: '20-30 minutes',
    sections: [
      // ----------------------------------------
      // ZONE 1: ENTRY & LOBBY
      // Walk in the front door. Check everything before moving on.
      // ----------------------------------------
      {
        name: 'Entry & Lobby',
        description: 'Start at the front door. 47-second arrival decision -- this is what parents see first.',
        checks: [
          {
            id: 'entry_glass_clean',
            text: 'Exterior door glass clean (no smudges, fingerprints, or streaks)?',
            helpText: '47-second arrival decision. Parent sees this first. Visible from normal standing position.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          },
          {
            id: 'entry_floor_clean',
            text: 'Entry & lobby floor free of debris, spills, and stains?',
            helpText: 'Any single piece of visible debris = defect. Check walk paths, corners, edges.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          },
          {
            id: 'entry_mat_clean',
            text: 'Entry mat clean and flat (no curled edges or trip hazards)?',
            helpText: 'Mat should be clean and laying flat with no tripping risk.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          },
          {
            id: 'tour_interior_glass_clean',
            text: 'Interior glass clean (no smudges or streaks)?',
            helpText: 'All glass visible from entrance-to-lobby sightline.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          },
          {
            id: 'entry_surfaces_clean',
            text: 'Reception surfaces clean and dust-free (counters, desks, shelves)?',
            helpText: 'No visible dust, sticky spots, residue, or fingerprints.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'entry_high_touch_clean',
            text: 'High-touch surfaces clean (door handles, counter edges)?',
            helpText: 'No visible grime, residue, or moisture on any touched surface.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'entry_trash_empty',
            text: 'Trash cans empty with liners in place?',
            helpText: 'Acceptable: 3 or fewer small items (tissue, wrapper). Not acceptable: food waste, multiple items.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'entry_odor_free',
            text: 'Free of bad odors?',
            helpText: 'No mold, garbage, or musty smell. Detectable = can smell without leaning in.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          },
          {
            id: 'entry_safe',
            text: 'Area is safe (no wet floors, loose items, or hazards)?',
            helpText: 'No standing water, no loose items in walkways.',
            tier: 'red',
            instantRed: true,
            photoRequired: false,
            slaTier: 1
          }
        ]
      },
      // ----------------------------------------
      // ZONE 2: HALLWAY / CORRIDOR
      // Walk the hallway. Check everything here.
      // ----------------------------------------
      {
        name: 'Hallway / Corridor',
        description: 'Walk the full hallway. Check floors, walls, edges, and all surfaces.',
        checks: [
          {
            id: 'hall_floor_clean',
            text: 'Floor free of debris, spills, and stains?',
            helpText: 'Walk the full corridor. Any visible debris while walking = defect.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_floor_finish',
            text: 'Floor finish uniform (no visible dull patches under normal lighting)?',
            helpText: 'Check under overhead lighting for inconsistent finish or wear patterns.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'hall_edges_dust_free',
            text: 'Edges, corners, and baseboards dust-free?',
            helpText: 'Any visible film, patch, or line perceivable without touching = defect.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_walls_clean',
            text: 'Walls free of scuff marks and damage?',
            helpText: 'No black marks, scrapes, or visible damage on corridor walls.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_glass_clean',
            text: 'Glass and doors clean (no smudges or fingerprints)?',
            helpText: 'Visible from normal standing position under typical lighting.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_high_touch_clean',
            text: 'High-touch surfaces clean (door handles, railings, light switches)?',
            helpText: 'No visible grime, residue, or moisture on any touched surface.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_trash_empty',
            text: 'Trash cans empty with liners in place?',
            helpText: 'No overflow. Fresh liner present.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'hall_safe',
            text: 'Area is safe (no wet floors, obstacles, or hazards)?',
            helpText: 'No standing water, loose cords, or trip hazards in walkway.',
            tier: 'red',
            instantRed: true,
            photoRequired: false,
            slaTier: 1
          }
        ]
      },
      // ----------------------------------------
      // ZONE 3: COMMONS AREA
      // Check the commons / shared space.
      // ----------------------------------------
      {
        name: 'Commons Area',
        description: 'Check all shared common spaces -- tables, furniture, floors, trash.',
        checks: [
          {
            id: 'commons_floor_clean',
            text: 'Floor free of debris, spills, and stains?',
            helpText: 'Any visible debris while walking through = defect.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_tables_clean',
            text: 'Tables and surfaces clean and dry (no sticky spots or residue)?',
            helpText: 'No visible dust, sticky spots, residue, or fingerprints.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_furniture_arranged',
            text: 'Furniture properly arranged per layout (chairs pushed in, not scattered)?',
            helpText: 'Should match intended arrangement.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_high_touch_clean',
            text: 'High-touch surfaces clean (door handles, table edges, chair backs)?',
            helpText: 'No visible grime, residue, or buildup.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_trash_empty',
            text: 'Trash cans empty with liners in place?',
            helpText: 'No overflow. Fresh liner present.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_odor_free',
            text: 'Free of bad odors (no food, mold, or garbage smell)?',
            helpText: 'Detectable = can smell without leaning in.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'commons_safe',
            text: 'Area is safe (no wet floors, broken furniture, or hazards)?',
            helpText: 'No safety concerns in commons area.',
            tier: 'red',
            instantRed: true,
            photoRequired: false,
            slaTier: 1
          }
        ]
      },
      // ----------------------------------------
      // ZONE 4: RESTROOMS
      // Check all restrooms on tour route. ALL defects = instant red.
      // ----------------------------------------
      {
        name: 'Restrooms',
        description: 'Check all restrooms along the tour route. ANY restroom defect = instant red.',
        checks: [
          {
            id: 'restroom_toilets_clean',
            text: 'Toilets and urinals clean (no soil, stains, or residue)?',
            helpText: 'All fixtures must be sanitary. Any visible soil = defect.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_sinks_clean',
            text: 'Sinks and counters dry and clean (no water spots or residue)?',
            helpText: 'Surfaces should be dry with no visible residue.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_mirrors_clean',
            text: 'Mirrors clean (no smudges or streaks)?',
            helpText: 'Visible from normal standing position under typical lighting.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_floor_clean',
            text: 'Floor clean (no debris, water, or stains)?',
            helpText: 'No standing water, no visible debris or staining.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_soap_stocked',
            text: 'Soap dispensers working and stocked?',
            helpText: 'Dispenser must dispense product. Empty or non-functional = defect.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_towels_stocked',
            text: 'Paper towels or hand dryers working and stocked?',
            helpText: 'Paper towels present and dispensing, or dryer functional.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_tp_stocked',
            text: 'Toilet paper fully stocked (fresh rolls in place)?',
            helpText: 'All stalls must have usable toilet paper.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_trash_empty',
            text: 'Trash cans empty with liners in place (no overflow)?',
            helpText: 'No items extending above rim or preventing lid from closing.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_odor_free',
            text: 'Free of bad odors (no urine, mold, sewage, or garbage smell)?',
            helpText: 'Detectable means auditor can smell it without stepping into room or leaning in. Odor masking with fragrance also = defect.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 2
          },
          {
            id: 'restroom_safe',
            text: 'Area is safe (no wet floors, broken fixtures, or hazards)?',
            helpText: 'No standing water, no broken fixtures, no trip hazards.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          }
        ]
      },
      // ----------------------------------------
      // ZONE 5: SUPPLY CLOSET
      // Check supply levels and organization.
      // ----------------------------------------
      {
        name: 'Supply Closet',
        description: 'Check supply levels (1-week minimum) and closet organization.',
        checks: [
          {
            id: 'supply_closet_tp',
            text: 'Toilet paper sufficient for 1 week?',
            helpText: 'CC determines what constitutes 1 week for their campus. When uncertain, overestimate.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3,
            isSupplyCheck: true
          },
          {
            id: 'supply_closet_towels',
            text: 'Paper towels sufficient for 1 week?',
            helpText: 'Running out is a failure, overstocking is not.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3,
            isSupplyCheck: true
          },
          {
            id: 'supply_closet_soap',
            text: 'Soap and sanitizer sufficient for 1 week?',
            helpText: 'Include both soap and hand sanitizer supplies.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3,
            isSupplyCheck: true
          },
          {
            id: 'supply_closet_liners',
            text: 'Trash liners sufficient for 1 week?',
            helpText: 'Enough liners for all cans across campus for the week.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3,
            isSupplyCheck: true
          },
          {
            id: 'supply_closet_cleaning',
            text: 'Cleaning supplies present and stocked?',
            helpText: 'Chemicals, mops, rags, and other cleaning materials available.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3,
            isSupplyCheck: true
          },
          {
            id: 'supply_closet_organized',
            text: 'Closet organized (items on shelves, walkway clear)?',
            helpText: 'Nothing blocking walkway, items stored safely on shelves.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'supply_stockout_check',
            text: 'All dispensers across campus stocked and functional?',
            helpText: 'TP present, soap dispenses, paper towels dispensing, sanitizer dispensing.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          }
        ]
      },
      // ----------------------------------------
      // ZONE 6: ENVIRONMENTAL HEALTH & SAFETY
      // Cross-cutting check based on everything you saw on the walk.
      // ----------------------------------------
      {
        name: 'Environmental Health & Safety',
        description: 'Based on your full walkthrough, check for hazards, pests, moisture, and odor across all zones.',
        checks: [
          {
            id: 'ehs_no_standing_water',
            text: 'No standing water in any zone you walked?',
            helpText: 'Any pooling, dripping, or standing water = immediate safety concern.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_blocked_exits',
            text: 'No blocked emergency exits?',
            helpText: 'All exit paths must be clear and accessible.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_exposed_wiring',
            text: 'No exposed wiring or electrical hazards?',
            helpText: 'No exposed wires, damaged outlets, or electrical risks.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_loose_cords',
            text: 'No loose cords in walk paths?',
            helpText: 'All cords and cables must be secured out of walkways.',
            tier: 'red',
            instantRed: true,
            photoRequired: false,
            slaTier: 1
          },
          {
            id: 'ehs_no_unsecured_chemicals',
            text: 'No chemicals accessible to students?',
            helpText: 'All cleaning chemicals stored securely and out of student reach.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_pest_evidence',
            text: 'No pest evidence (live pests, droppings, trails, gnawing)?',
            helpText: 'No visible live pests, droppings, insect trails/clusters, or gnawing/chewing evidence.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_mold_mildew',
            text: 'No visible mold or mildew?',
            helpText: 'No visible mold/mildew, brown staining, water staining, or condensation streaks.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_no_active_moisture',
            text: 'No active moisture events (dripping, pooling, condensation)?',
            helpText: 'No active leaks, dripping pipes, or moisture accumulation.',
            tier: 'red',
            instantRed: true,
            photoRequired: true,
            slaTier: 1
          },
          {
            id: 'ehs_odor_free',
            text: 'No detectable odors in any zone you walked?',
            helpText: 'No sour, mildew, waste, or lingering odors. Detectable = can smell without leaning in.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          }
        ]
      },
      // ----------------------------------------
      // ZONE 7: DAILY RESET VERIFICATION
      // Evidence that overnight vendor work was done.
      // ----------------------------------------
      {
        name: 'Daily Reset Verification',
        description: 'Confirm visible signs that overnight cleaning was completed.',
        checks: [
          {
            id: 'reset_visible',
            text: 'Visible signs of daily reset (fresh liners, wiped surfaces, cleared floors)?',
            helpText: 'Skipped or incomplete reset = not green. Look for evidence across all zones.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          }
        ]
      },
      // ----------------------------------------
      // FINAL: TOUR READY
      // ----------------------------------------
      {
        name: 'Tour Ready',
        description: 'Final validation. Based on your walkthrough, could a parent tour happen right now?',
        checks: [
          {
            id: 'tour_ready',
            text: 'Is this campus tour ready right now?',
            helpText: 'Is there ANY condition you would want to explain, apologize for, avoid showing, or wish you had 5 minutes to fix before a visitor arrived? YES to any of those = Tour Ready is NO.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 2
          }
        ]
      }
    ]
  },

  monthly: {
    id: 'monthly',
    name: 'Monthly Deep Dive',
    frequency: 'monthly',
    order: 2,
    description: 'Deep inspection + 30-day review. Verifies 4 weekly audits completed. CC + Site Owner, 30-45 minutes. Failed items get 7 days to remediate.',
    timeNeeded: '30-45 minutes',
    sections: [
      // ----------------------------------------
      // DEEP CLEAN INSPECTION
      // ----------------------------------------
      {
        name: 'Deep Clean - Vertical Surfaces',
        description: 'Look up, look down. Check areas that nightly cleaning may miss over time.',
        checks: [
          {
            id: 'deep_ceiling_tiles',
            text: 'Ceiling tiles clean and intact (no stains, sagging, or damage)?',
            helpText: 'Check for water stains, sagging, missing tiles, or visible dirt.',
            tier: 'amber',
            photoRequired: true,
            slaTier: 4
          },
          {
            id: 'deep_vents_clean',
            text: 'Vents and air returns free of dust and debris?',
            helpText: 'No visible dust buildup on vent covers or grilles.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_light_fixtures',
            text: 'Light fixtures and covers clean (no dead insects, dust, or discoloration)?',
            helpText: 'High dusting check. Look up at all fixture covers.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_walls_condition',
            text: 'Walls in good condition (no scuff marks, peeling paint, or damage)?',
            helpText: 'Check beyond tour route into classrooms, offices, and back areas.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_baseboards_clean',
            text: 'Baseboards deep cleaned (no grey buildup in corners)?',
            helpText: 'Run a finger along baseboard corners if needed. Should be free of buildup.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_cobwebs',
            text: 'All corners free of cobwebs (including non-parent-facing areas)?',
            helpText: 'Check high corners in classrooms, offices, and storage areas.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          }
        ]
      },
      // ----------------------------------------
      // DEEP CLEAN - Floors & Soft Surfaces
      // ----------------------------------------
      {
        name: 'Deep Clean - Floors & Soft Surfaces',
        description: 'Check floor condition, carpet extraction needs, and furniture surfaces.',
        checks: [
          {
            id: 'deep_floor_finish',
            text: 'Hard floor finish intact throughout (no excessive scuffing, peeling, or wear)?',
            helpText: 'Check for areas where floor finish has worn through or become dull.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_grout_condition',
            text: 'Grout in restrooms and tiled areas clean (no discoloration or buildup)?',
            helpText: 'Grout should be consistent color without dark lines or mold.',
            tier: 'amber',
            photoRequired: true,
            slaTier: 4
          },
          {
            id: 'deep_carpet_condition',
            text: 'Carpeted areas clean and free of stains (extraction not needed)?',
            helpText: 'Check for ground-in soil, stains, or areas needing hot water extraction.',
            tier: 'amber',
            photoRequired: true,
            slaTier: 4
          },
          {
            id: 'deep_under_furniture',
            text: 'Areas under and behind furniture clean (no dust bunnies or debris)?',
            helpText: 'Spot check under desks, behind shelving units, and under heavy furniture.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_upholstery',
            text: 'Soft seating and upholstered furniture clean (no stains or odors)?',
            helpText: 'Check common area couches, classroom soft seating, office chairs.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          }
        ]
      },
      // ----------------------------------------
      // DEEP CLEAN - Restroom Deep Check
      // ----------------------------------------
      {
        name: 'Deep Clean - Restroom Deep Check',
        description: 'Beyond daily/weekly restroom checks. Focus on items that degrade over time.',
        checks: [
          {
            id: 'deep_restroom_grout',
            text: 'Restroom tile grout clean (no discoloration, mold, or buildup)?',
            helpText: 'Machine scrub level check. Grout should be original color.',
            tier: 'amber',
            photoRequired: true,
            slaTier: 4
          },
          {
            id: 'deep_restroom_chrome',
            text: 'Chrome fixtures clean (no water spots, scale, or buildup)?',
            helpText: 'Check faucets, handles, flush valves for descaling needs.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_restroom_exhaust',
            text: 'Exhaust fans clean and functional?',
            helpText: 'No dust buildup on fan covers. Fan pulls air when running.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_restroom_partitions',
            text: 'Stall partitions clean (no writing, stickers, or residue)?',
            helpText: 'Check both sides of all partitions and doors.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          },
          {
            id: 'deep_trash_bins_clean',
            text: 'Trash and recycle bins clean inside and out?',
            helpText: 'Bins should show no residue, staining, or odor from the bins themselves.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 4
          }
        ]
      },
      // ----------------------------------------
      // VENDOR PERFORMANCE / SYSTEM RELIABILITY
      // ----------------------------------------
      {
        name: 'System Reliability - Vendor Performance',
        description: 'Review vendor execution over the past 30 days. Check for missed tasks and repeat defects.',
        checks: [
          {
            id: 'vendor_nightly_complete',
            text: 'Vendor completed all nightly cleaning tasks this month (no misses)?',
            helpText: 'Check vendor logs. Any missed night = fail.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'vendor_daily_reset',
            text: 'Visible daily reset confirmed every morning this month?',
            helpText: 'Evidence of nightly work present each morning - fresh liners, clean surfaces.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'vendor_weekly_tasks',
            text: 'Weekly tasks completed on schedule this month?',
            helpText: 'Vendor weekly scope items executed per contract.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'vendor_no_repeat_defects',
            text: 'No repeat defects in same zone within 30 days?',
            helpText: 'Same check failing in same zone within 30 days = repeat. Repeat = automatic red.',
            tier: 'red',
            instantRed: true,
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'vendor_sla_compliance',
            text: 'All defects resolved within SLA timelines?',
            helpText: 'Tier 1: same day. Tier 2: <24h. Tier 3: 5 days. Tier 4: per cycle.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'vendor_documentation',
            text: 'Vendor provides verifiable logs and documentation?',
            helpText: 'Vendor can produce evidence of completed work. Unverifiable logs = fail.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          }
        ]
      },
      // ----------------------------------------
      // 30-DAY REVIEW METRICS
      // ----------------------------------------
      {
        name: '30-Day Review',
        description: 'CC + Site Owner review. Analyze patterns from the last 4 weekly audits.',
        checks: [
          {
            id: 'review_green_percentage',
            text: 'Were 90%+ of weekly audits this month Green?',
            helpText: 'Vendor monthly scorecard target: 90%+ of audits = Green.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'review_no_patterns',
            text: 'No recurring defect patterns identified across weekly audits?',
            helpText: 'Same issue showing up in different weeks = pattern. Document and address.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'review_issues_resolved',
            text: 'All defects from previous month resolved or on track?',
            helpText: 'No carryover issues without documented plan and timeline.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'review_escalation_needed',
            text: 'No issues requiring escalation to VP-Ops Facilities?',
            helpText: 'Escalate if: same check fails 3+ times in 60 days, systemic pattern, beyond vendor scope, asset end-of-life, or contract issue.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          }
        ]
      },
      // ----------------------------------------
      // SILENT FAILURE CHECK
      // ----------------------------------------
      {
        name: 'Silent Failure Indicators',
        description: 'Check for evidence of vendor gaming rather than genuine compliance.',
        checks: [
          {
            id: 'silent_no_audit_only_cleaning',
            text: 'No evidence of "audit-only cleaning" (zones degrade between QC windows)?',
            helpText: 'Zones should be consistently clean, not just during audit times.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'silent_no_odor_masking',
            text: 'No odor masking (chemical fragrance covering organic odor)?',
            helpText: 'Fragrance should not be used to mask underlying odor problems.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          },
          {
            id: 'silent_no_selective_cleaning',
            text: 'No selective cleaning (high-touch clean but corners dusty)?',
            helpText: 'Smudge-free handles but dusty corners = selective cleaning pattern.',
            tier: 'amber',
            photoRequired: false,
            slaTier: 3
          }
        ]
      }
    ]
  }
};

// Zone order for navigation
export const CLEANLINESS_ZONE_ORDER = ['weekly', 'monthly'];

// ============================================
// ROOM TYPE TEMPLATES
// Used when auditing assigned rooms from campus map
// Room type determines which template is applied
// ============================================
export const ROOM_AUDIT_TEMPLATES = {
  learning: {
    name: 'Learning Space',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris while walking through = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_edges_dust_free',
        text: 'Edges, corners, and baseboards dust-free?',
        helpText: 'Any visible film or line without touching = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_desks_clean',
        text: 'Student desks and tables clean (no writing, stickers, or residue)?',
        helpText: 'All student work surfaces should be clean and clear.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_teacher_clean',
        text: 'Teacher desk and surfaces clean (no dust or clutter)?',
        helpText: 'Teacher work area should be dust-free.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_whiteboard_clean',
        text: 'Whiteboard area clean (tray wiped, ledge dust-free)?',
        helpText: 'Whiteboard tray and ledge should show no dust accumulation.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handle, light switches)?',
        helpText: 'No visible grime, residue, or buildup on touched surfaces.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_trash_empty',
        text: 'Trash cans empty with liners in place?',
        helpText: 'No overflow. Fresh liner present.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no tripping hazards, loose wires, or broken items)?',
        helpText: 'All cords secured, no loose items in walkways.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  restroom: {
    name: 'Restroom',
    checks: [
      {
        id: 'room_restroom_toilets',
        text: 'Toilets and urinals clean (no soil, stains, or residue)?',
        helpText: 'All fixtures must be sanitary.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_sinks',
        text: 'Sinks and counters dry and clean?',
        helpText: 'No water spots or residue.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_mirrors',
        text: 'Mirrors clean (no smudges or streaks)?',
        helpText: 'Visible from normal standing position.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_floor',
        text: 'Floor clean (no debris, water, or stains)?',
        helpText: 'No standing water or visible debris.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_soap',
        text: 'Soap dispensers working and stocked?',
        helpText: 'Dispenser must dispense product.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_towels',
        text: 'Paper towels or hand dryers working and stocked?',
        helpText: 'Paper towels present and dispensing, or dryer functional.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_tp',
        text: 'Toilet paper fully stocked?',
        helpText: 'All stalls must have usable TP.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_trash',
        text: 'Trash cans empty with liners in place?',
        helpText: 'No overflow.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_odor',
        text: 'Free of bad odors?',
        helpText: 'Detectable from doorway = defect. Odor masking also = defect.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 2
      },
      {
        id: 'room_restroom_safe',
        text: 'Area is safe (no wet floors, broken fixtures, or hazards)?',
        helpText: 'No standing water, broken fixtures, or trip hazards.',
        tier: 'red',
        instantRed: true,
        photoRequired: true,
        slaTier: 1
      }
    ]
  },

  common: {
    name: 'Common Area',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_tables_clean',
        text: 'Tables and surfaces clean and dry (no sticky spots or residue)?',
        helpText: 'All shared surfaces should be clean.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_furniture_arranged',
        text: 'Furniture properly arranged (chairs pushed in, not scattered)?',
        helpText: 'Should match intended layout.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handles, table edges, chair backs)?',
        helpText: 'No visible grime or residue.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_trash_empty',
        text: 'Trash cans empty with liners in place?',
        helpText: 'No overflow. Fresh liner present.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_odor_free',
        text: 'Free of bad odors?',
        helpText: 'No food, mold, or garbage smell.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no wet floors, broken furniture, or hazards)?',
        helpText: 'No safety concerns.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  office: {
    name: 'Office / Workroom',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_desks_dust_free',
        text: 'Desk and work surfaces dust-free?',
        helpText: 'No visible dust film or buildup.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handles, light switches, shared equipment)?',
        helpText: 'No visible grime or residue.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_trash_empty',
        text: 'Trash cans empty with liners in place?',
        helpText: 'No overflow.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no tripping hazards, loose wires, or blocked exits)?',
        helpText: 'All cords secured, exits clear.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  kitchen: {
    name: 'Kitchen / Cafeteria',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_tables_clean',
        text: 'Tables and seating clean and dry (no sticky spots or food residue)?',
        helpText: 'All eating surfaces must be clean.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_service_area_clean',
        text: 'Service and counter area clean (no crumbs, spills, or buildup)?',
        helpText: 'Food prep and service areas should be clean.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handles, tray rails, chair backs)?',
        helpText: 'No visible grime or residue.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_trash_empty',
        text: 'Trash cans empty with liners in place?',
        helpText: 'No overflow.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_odor_free',
        text: 'Free of bad odors (no spoiled food, garbage, or drain smell)?',
        helpText: 'No detectable food or waste odors.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no wet floors, broken chairs, or hazards)?',
        helpText: 'No safety concerns.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  vestibule: {
    name: 'Vestibule / Lobby',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 2
      },
      {
        id: 'room_glass_clean',
        text: 'All glass clean (no smudges, fingerprints, or streaks)?',
        helpText: 'Visible from normal standing position under typical lighting.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 2
      },
      {
        id: 'room_surfaces_clean',
        text: 'Surfaces clean and dust-free?',
        helpText: 'Counters, shelves, and ledges.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 2
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handles, counter edges)?',
        helpText: 'No visible grime or residue.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 2
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no wet floors, loose items, or hazards)?',
        helpText: 'No safety concerns.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  hallway: {
    name: 'Hallway / Corridor',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_edges_dust_free',
        text: 'Edges, corners, and baseboards dust-free?',
        helpText: 'No visible dust buildup.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_walls_clean',
        text: 'Walls free of scuff marks?',
        helpText: 'No black marks or scrapes.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_glass_clean',
        text: 'Glass and doors clean (no smudges or fingerprints)?',
        helpText: 'Visible from normal standing position.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_high_touch',
        text: 'High-touch surfaces clean (door handles, railings, light switches)?',
        helpText: 'No visible grime or residue.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no wet floors, obstacles, or hazards)?',
        helpText: 'No safety concerns.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  storage: {
    name: 'Storage',
    checks: [
      {
        id: 'room_organized',
        text: 'Storage area organized (items on shelves, walkway clear)?',
        helpText: 'Nothing blocking walkway, items stored safely.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris?',
        helpText: 'Walkable areas should be clean.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no hazards, chemicals secured, exits clear)?',
        helpText: 'All items stored safely. No chemicals accessible.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  },

  other: {
    name: 'Other Space',
    checks: [
      {
        id: 'room_floor_clean',
        text: 'Floor free of debris, spills, and stains?',
        helpText: 'Any visible debris = defect.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_surfaces_clean',
        text: 'Surfaces clean and dust-free?',
        helpText: 'All accessible surfaces.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_trash_empty',
        text: 'Trash cans empty with liners in place (if applicable)?',
        helpText: 'No overflow.',
        tier: 'amber',
        photoRequired: false,
        slaTier: 3
      },
      {
        id: 'room_safe',
        text: 'Area is safe (no hazards)?',
        helpText: 'No safety concerns.',
        tier: 'red',
        instantRed: true,
        photoRequired: false,
        slaTier: 1
      }
    ]
  }
};

// ============================================
// ROOM ROTATION HELPERS
// Distributes campus rooms across 4 weeks
// so every room gets checked at least 1x/month
// ============================================

/**
 * Get the week number within the current month (1-4)
 * Week 1 = days 1-7, Week 2 = days 8-14, etc.
 * @param {Date} date - defaults to today
 * @returns {number} 1-4
 */
export const getWeekOfMonth = (date = new Date()) => {
  const day = date.getDate();
  return Math.min(Math.ceil(day / 7), 4);
};

/**
 * Distribute rooms across 4 weeks for monthly rotation.
 * Tour route rooms (vestibule, hallway marked as tour) are excluded
 * from rotation since they are checked every week as part of the
 * static tour route section.
 *
 * @param {Array} rooms - Array of room objects from campusRooms.js
 * @param {number} totalWeeks - Number of weeks to distribute across (default 4)
 * @returns {Object} { 1: [...rooms], 2: [...rooms], 3: [...rooms], 4: [...rooms] }
 */
export const distributeRoomsAcrossWeeks = (rooms, totalWeeks = 4) => {
  // Initialize week buckets
  const weeks = {};
  for (let i = 1; i <= totalWeeks; i++) {
    weeks[i] = [];
  }

  if (!rooms || rooms.length === 0) return weeks;

  // Filter out tour route rooms (they get checked every week already)
  // Tour route = vestibule + main hallway - these are covered by static weekly sections
  const rotatableRooms = rooms.filter(room => {
    const isTourRoute = room.isTourRoute === true;
    return !isTourRoute;
  });

  // Distribute evenly across weeks using round-robin
  rotatableRooms.forEach((room, index) => {
    const weekNum = (index % totalWeeks) + 1;
    weeks[weekNum].push(room);
  });

  return weeks;
};

/**
 * Get the rooms assigned for a specific week
 * @param {Array} rooms - Full room list from campus map
 * @param {number} weekNum - Week number (1-4), defaults to current week
 * @returns {Array} Rooms to audit this week
 */
export const getRoomsForWeek = (rooms, weekNum) => {
  const week = weekNum || getWeekOfMonth();
  const distribution = distributeRoomsAcrossWeeks(rooms);
  return distribution[week] || [];
};

/**
 * Get the appropriate check template for a room type
 * @param {string} roomType - Room type from campusRooms.js
 * @returns {Object} Template with checks array
 */
export const getTemplateForRoomType = (roomType) => {
  return ROOM_AUDIT_TEMPLATES[roomType] || ROOM_AUDIT_TEMPLATES.other;
};

/**
 * Generate check IDs scoped to a specific room to avoid ID collisions
 * when multiple rooms of the same type are audited in the same session
 * @param {Object} room - Room object from campus map
 * @param {Object} template - Template from ROOM_AUDIT_TEMPLATES
 * @returns {Array} Checks with room-scoped IDs
 */
export const generateRoomChecks = (room, template) => {
  const roomSlug = room.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
  return template.checks.map(check => ({
    ...check,
    id: `${roomSlug}_${check.id}`,
    roomName: room.name,
    roomType: room.type
  }));
};

// ============================================
// HELPER FUNCTIONS (mirror securityZones.js)
// ============================================

/**
 * Get all checks for a zone (weekly or monthly)
 * @param {string} zoneId - 'weekly' or 'monthly'
 * @returns {Array} All checks with section info
 */
export const getCleanlinessZoneChecks = (zoneId) => {
  const zone = CLEANLINESS_ZONES[zoneId];
  if (!zone || !zone.sections) return [];

  return zone.sections.flatMap(section =>
    section.checks.map(check => ({
      ...check,
      section: section.name
    }))
  );
};

/**
 * Check if a check is instant red (amber-ineligible)
 * @param {string} checkId
 * @returns {boolean}
 */
export const isCleanlinessInstantRed = (checkId) => {
  // Check against the static list
  if (CLEANLINESS_INSTANT_RED_CHECKS.includes(checkId)) return true;

  // Also check room-scoped IDs (e.g., "neon_room_room_restroom_toilets")
  // by checking if the base ID is in the restroom or safety template
  const baseId = checkId.replace(/^[a-z0-9_]+?_(room_)/, 'room_');
  const restroomChecks = ROOM_AUDIT_TEMPLATES.restroom.checks;
  const isRestroomCheck = restroomChecks.some(c => c.id === baseId && c.instantRed);
  if (isRestroomCheck) return true;

  // Check all templates for instantRed flags
  for (const template of Object.values(ROOM_AUDIT_TEMPLATES)) {
    const match = template.checks.find(c => c.id === baseId);
    if (match && match.instantRed) return true;
  }

  return false;
};

/**
 * Check if photo is required for a check
 * @param {string} checkId
 * @returns {boolean}
 */
export const isCleanlinessPhotoRequired = (checkId) => {
  if (CLEANLINESS_PHOTO_REQUIRED_CHECKS.includes(checkId)) return true;

  // Check room-scoped IDs
  const baseId = checkId.replace(/^[a-z0-9_]+?_(room_)/, 'room_');
  for (const template of Object.values(ROOM_AUDIT_TEMPLATES)) {
    const match = template.checks.find(c => c.id === baseId);
    if (match && match.photoRequired) return true;
  }

  return false;
};

/**
 * Calculate zone rating for cleanliness
 * Much stricter than security: Amber = exactly 1 non-critical defect
 * @param {string} zoneId
 * @param {Object} results - { checkId: true/false }
 * @param {Array} issues - Open issues array
 * @returns {string} 'GREEN', 'AMBER', or 'RED'
 */
export const calculateCleanlinessZoneRating = (zoneId, results, issues = []) => {
  const checks = getCleanlinessZoneChecks(zoneId);

  // Get failed checks (NO answers)
  const failedChecks = checks.filter(check => results[check.id] === false);

  if (failedChecks.length === 0) {
    return 'GREEN';
  }

  // Any instant red = RED
  const hasInstantRed = failedChecks.some(check =>
    check.instantRed || isCleanlinessInstantRed(check.id)
  );
  if (hasInstantRed) {
    return 'RED';
  }

  // More than 5 non-critical defects = RED
  if (failedChecks.length > CLEANLINESS_RAG_RULES.amber.maxOpenIssues) {
    return 'RED';
  }

  // 1-5 non-critical defects = AMBER (needs attention, 7 days to remediate)
  return 'AMBER';
};

/**
 * Calculate overall cleanliness rating
 * @param {Object} zoneRatings - { weekly: 'GREEN', monthly: 'GREEN' }
 * @param {boolean} tourReady - Tour Ready answer
 * @returns {string} 'GREEN', 'AMBER', or 'RED'
 */
export const calculateOverallCleanlinessRating = (zoneRatings, tourReady) => {
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

/**
 * Get the SLA tier for a check
 * @param {string} checkId
 * @returns {Object|null} SLA tier info
 */
export const getCheckSlaTier = (checkId) => {
  // Search all zones and templates for the check
  for (const zone of Object.values(CLEANLINESS_ZONES)) {
    for (const section of zone.sections) {
      const check = section.checks.find(c => c.id === checkId);
      if (check && check.slaTier) {
        return SLA_TIERS[`tier${check.slaTier}`];
      }
    }
  }

  // Check room templates
  for (const template of Object.values(ROOM_AUDIT_TEMPLATES)) {
    const check = template.checks.find(c => c.id === checkId);
    if (check && check.slaTier) {
      return SLA_TIERS[`tier${check.slaTier}`];
    }
  }

  return null;
};
