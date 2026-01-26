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
        name: 'Turf (Grass Areas)',
        checks: [
          { id: 'turf_height', text: 'Grass is the same height everywhere (no tall patches or short patches)?', tier: 3 },
          { id: 'turf_color', text: 'Grass is green and healthy looking (no yellow or brown spots)?', tier: 3 },
          { id: 'turf_weeds', text: 'Grass is mostly grass, not weeds (some weeds OK, but grass should be the main plant)?', tier: 3, amberEligible: true },
          { id: 'turf_bare', text: 'Grass covers all areas (no bare dirt patches showing)?', tier: 2, amberIneligibleIf: 'visible from arrival path' },
          { id: 'turf_scalping', text: 'Grass is cut properly (not cut too short showing brown, not overgrown and shaggy)?', tier: 3 }
        ]
      },
      {
        name: 'Edging (Where Grass Meets Sidewalk)',
        checks: [
          { id: 'edging_lines', text: 'Edges look neat and straight (clean line between grass and sidewalk)?', tier: 3 },
          { id: 'edging_overhang', text: 'Grass stays in the grass area (not growing over onto sidewalk or curb)?', tier: 3 },
          { id: 'edging_weeds', text: 'Sidewalk cracks are clear (no weeds growing up through the cracks)?', tier: 3 }
        ]
      },
      {
        name: 'Plant Beds (Flower and Shrub Areas)',
        checks: [
          { id: 'beds_healthy', text: 'Plants look healthy (standing up straight, not drooping or wilting)?', tier: 3 },
          { id: 'beds_pests', text: 'Plants are pest-free (no holes in leaves, no bugs visible, no webs)?', tier: 3 },
          { id: 'beds_dead', text: 'All plants are alive (no brown, dead, or dying plants)?', tier: 3 },
          { id: 'beds_toxic', text: 'No dangerous plants present (no oleander, poison ivy, poison oak, or other toxic plants)?', tier: 1 },
          { id: 'beds_weeds', text: 'Beds are mostly plants, not weeds (some weeds OK, but planted flowers/shrubs should be the main plants)?', tier: 3, amberEligible: true },
          { id: 'beds_seasonal', text: 'Seasonal flowers are blooming and colorful (if the season calls for flowers, they should be alive and blooming)?', tier: 4, amberEligible: true }
        ]
      },
      {
        name: 'Mulch (Wood Chips in Plant Beds)',
        checks: [
          { id: 'mulch_coverage', text: 'Mulch covers all the soil (no bare dirt showing through the wood chips)?', tier: 3, amberEligible: true },
          { id: 'mulch_weeds', text: 'Mulch is weed-free (no weeds poking up through the wood chips)?', tier: 3 }
        ]
      },
      {
        name: 'Trees',
        checks: [
          { id: 'trees_clearance', text: 'Tree branches are high enough (an adult can walk under without ducking)?', tier: 3 },
          { id: 'trees_limbs', text: 'All branches are healthy and attached (no dead branches, no broken limbs hanging)?', tier: 1 },
          { id: 'trees_disease', text: 'Trees look healthy (no strange spots on leaves, no fungus on trunk, no oozing sap)?', tier: 3 },
          { id: 'trees_lean', text: 'Trees stand straight (no trees leaning dangerously that could fall)?', tier: 1 }
        ]
      },
      {
        name: 'Irrigation (Sprinkler System)',
        checks: [
          { id: 'irrigation_leaks', text: 'No water leaks visible (no puddles, no water spraying from broken pipes)?', tier: 2 },
          { id: 'irrigation_dry', text: 'All areas are getting water (no dry brown patches from sprinklers not reaching)?', tier: 2 },
          { id: 'irrigation_overspray', text: 'Water stays on plants (sprinklers not spraying onto sidewalks, walls, or parking lot)?', tier: 3 },
          { id: 'irrigation_heads', text: 'Sprinkler heads are intact (no broken, cracked, or missing sprinkler heads)?', tier: 3 }
        ]
      },
      {
        name: 'Debris (Trash and Litter)',
        checks: [
          { id: 'debris_trash', text: 'Grounds are litter-free (no trash, wrappers, bottles, or garbage on the ground)?', tier: 3, amberEligible: true },
          { id: 'debris_leaves', text: 'Grounds are clear of yard waste (no piles of leaves, sticks, or branches)?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Drainage (Water Flow)',
        checks: [
          { id: 'drainage_standing', text: 'No standing water (no puddles sitting in grass or low spots)?', tier: 2 },
          { id: 'drainage_erosion', text: 'No erosion damage (no washed-out areas, no gullies, no exposed roots from water runoff)?', tier: 2 }
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
        name: 'Parking Lot Surface',
        checks: [
          { id: 'parking_potholes', text: 'Parking lot is smooth (no potholes or dips you would walk around)?', tier: 1 },
          { id: 'parking_cracks_width', text: 'No wide cracks (no cracks big enough to fit a pencil inside)?', tier: 2 },
          { id: 'parking_cracks_length', text: 'No long cracks (no cracks longer than the length of your shoe)?', tier: 2 },
          { id: 'parking_oil', text: 'No large oil stains (no stains bigger than your hand)?', tier: 3, amberEligible: true },
          { id: 'parking_stain_pattern', text: 'Parking lot looks clean overall (no obvious pattern of stains when you drive in)?', tier: 2 }
        ]
      },
      {
        name: 'Parking Lot Striping (Painted Lines)',
        checks: [
          { id: 'striping_visible', text: 'Parking lines are easy to see (all painted lines are visible and not faded)?', tier: 3 },
          { id: 'striping_ada', text: 'Handicap markings are clear (blue paint and wheelchair symbol are easy to read)?', tier: 2 }
        ]
      },
      {
        name: 'Walkways and Sidewalks',
        checks: [
          { id: 'walkways_cracks', text: 'No wide cracks (no cracks big enough to fit a pencil inside)?', tier: 2 },
          { id: 'walkways_trip', text: 'No trip hazards (no raised edges, uneven sections, or gaps that could trip someone)?', tier: 1 },
          { id: 'walkways_stains', text: 'Walkways are clean (no stains, no chewing gum stuck to concrete)?', tier: 3 },
          { id: 'walkways_moss', text: 'Walkways are safe to walk on (no moss, algae, or slippery spots)?', tier: 1 }
        ]
      },
      {
        name: 'Curbing (Curbs and Borders)',
        checks: [
          { id: 'curbing_intact', text: 'Curbs are solid (no crumbling, chipping, or broken pieces)?', tier: 3 },
          { id: 'curbing_paint', text: 'Curb paint is visible (yellow, red, or white paint still shows where needed)?', tier: 4, amberEligible: true }
        ]
      },
      {
        name: 'Outdoor Furniture (Benches, Trash Cans)',
        checks: [
          { id: 'furnishings_benches', text: 'Benches are in good shape (no broken boards, no loose parts, safe to sit on)?', tier: 3 },
          { id: 'furnishings_graffiti', text: 'No graffiti anywhere (no spray paint, markers, or scratched messages)?', tier: 2 },
          { id: 'furnishings_rust', text: 'Metal items are rust-free (no rust holes, no flaking rust)?', tier: 3 },
          { id: 'furnishings_trash', text: 'Trash cans work properly (lids open and close, cans are not broken or overflowing)?', tier: 3 }
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
        name: 'Roof (What You Can See From Ground)',
        checks: [
          { id: 'roof_debris', text: 'Roof is clear (no leaves, branches, balls, or trash sitting on the roof)?', tier: 3 },
          { id: 'roof_damage', text: 'Roof looks intact (no missing shingles, no sagging areas, no visible damage)?', tier: 2 }
        ]
      },
      {
        name: 'Gutters and Downspouts',
        checks: [
          { id: 'gutters_clear', text: 'Gutters are clear (no leaves or debris sticking out of gutters)?', tier: 3, amberEligible: true },
          { id: 'gutters_overflow', text: 'Gutters drain properly (no water stains or streaks running down the walls)?', tier: 2 },
          { id: 'gutters_attached', text: 'Gutters are secure (no sagging sections, no gutters pulling away from building)?', tier: 2 }
        ]
      },
      {
        name: 'Exterior Walls',
        checks: [
          { id: 'walls_paint', text: 'Paint is in good condition (no peeling or flaking spots bigger than a quarter)?', tier: 3 },
          { id: 'walls_cracks', text: 'No deep cracks (no cracks with visible depth or shadow inside them)?', tier: 2 },
          { id: 'walls_staining', text: 'Walls are clean (no dark stains, no mold, no mildew visible from the parking lot)?', tier: 2 },
          { id: 'walls_dirt', text: 'Walls look presentable (no dirt buildup, no cobwebs, no debris on walls you can see walking in)?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Exterior Windows',
        checks: [
          { id: 'windows_intact', text: 'All windows are whole (no cracked, chipped, or broken glass)?', tier: 2 },
          { id: 'windows_clean', text: 'Windows are clean (no heavy dirt, dust, or grime buildup)?', tier: 3 },
          { id: 'windows_seal', text: 'Window seals are good (no foggy glass from broken seals, no gaps around frames)?', tier: 3 }
        ]
      },
      {
        name: 'Exterior Doors',
        checks: [
          { id: 'doors_clean', text: 'Doors are clean (no dirt, dust, or grime on door surfaces)?', tier: 3 },
          { id: 'doors_damage', text: 'Doors are undamaged (no dents, scratches, peeling paint, or broken parts)?', tier: 2 },
          { id: 'doors_weatherstrip', text: 'Weatherstripping is present (rubber seal around door edges is visible and intact)?', tier: 3 }
        ]
      },
      {
        name: 'Exterior Lighting',
        checks: [
          { id: 'lighting_operational', text: 'All lights work (no burnt out bulbs, no flickering lights)?', tier: 2 },
          { id: 'lighting_lenses', text: 'Light covers are clean (no heavy dirt, bugs, or debris inside light fixtures)?', tier: 4, amberEligible: true },
          { id: 'lighting_dark', text: 'Walkways are well-lit (no dark areas along the path from parking to entrance)?', tier: 1 }
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
        name: 'Building Signage',
        checks: [
          { id: 'signage_clean', text: 'Signs are clean (no dirt, dust, bird droppings, or grime)?', tier: 3 },
          { id: 'signage_aligned', text: 'Signs are straight (not crooked, tilted, or hanging unevenly)?', tier: 3 },
          { id: 'signage_illuminated', text: 'Lit signs are working (if the sign has lights, they are all on and bright)?', tier: 2 },
          { id: 'signage_visible', text: 'Signs can be seen clearly (nothing blocking the view from the parking lot)?', tier: 2 }
        ]
      },
      {
        name: 'Entry Door Glass',
        checks: [
          { id: 'entry_glass', text: 'Entry glass is spotless (no fingerprints, smudges, streaks, or nose prints)?', tier: 2, amberIneligible: true }
        ]
      },
      {
        name: 'Entry Mats',
        checks: [
          { id: 'mats_centered', text: 'Mats are centered in doorway (not pushed to one side or crooked)?', tier: 3, amberEligible: true },
          { id: 'mats_clean', text: 'Mats are clean (no heavy dirt, stains, or debris on mat surface)?', tier: 3 },
          { id: 'mats_trip', text: 'Mats are flat and safe (no curled edges, bumps, or corners sticking up)?', tier: 1 }
        ]
      },
      {
        name: 'Door Threshold (Floor at Doorway)',
        checks: [
          { id: 'threshold_clear', text: 'Threshold is clean (no leaves, dirt, sand, or debris at the door)?', tier: 3, amberEligible: true },
          { id: 'threshold_damage', text: 'Threshold is in good condition (no chips, cracks, or damage to floor at doorway)?', tier: 2 }
        ]
      },
      {
        name: 'First Impression Test',
        checks: [
          { id: 'ritz_test', text: 'Entrance looks professional (would a guest at a nice hotel find this entrance acceptable)?', tier: 2 }
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
    // Classroom-specific sections
    classroomSections: [
      {
        name: 'Interior Walls',
        checks: [
          { id: 'int_walls_paint', text: 'Paint is in good condition (no peeling, flaking, or chipping spots bigger than a quarter)?', tier: 3 },
          { id: 'int_walls_bubbling', text: 'Walls are flat (no bubbles, blisters, or bumps in the paint)?', tier: 3 },
          { id: 'int_walls_touchup', text: 'Touch-up paint matches (no obvious patches of different colored paint)?', tier: 3 },
          { id: 'int_walls_water', text: 'No water damage (no water stains, brown spots, or damp areas bigger than your hand)?', tier: 1, amberIneligible: true },
          { id: 'int_walls_holes', text: 'Walls are intact (no holes or gouges bigger than a quarter)?', tier: 3 },
          { id: 'int_walls_cracks', text: 'No deep cracks (no cracks with visible depth or shadow inside them)?', tier: 2 },
          { id: 'int_walls_seams', text: 'Drywall looks smooth (no visible tape lines, seams, or joints when standing arm\'s length away)?', tier: 3 },
          { id: 'int_walls_scuffs', text: 'Walls are mostly scuff-free (no more than 3 scuff marks on any wall)?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Floors',
        checks: [
          { id: 'int_floors_cracks', text: 'Hard floors are intact (no cracks bigger than a quarter)?', tier: 2 },
          { id: 'int_floors_chips', text: 'No chipped edges (no chips or lips that could catch your foot or trip someone)?', tier: 1 },
          { id: 'int_floors_tiles', text: 'Tiles are secure (no loose, wobbly, or cracked tiles)?', tier: 2 },
          { id: 'int_floors_grout', text: 'Grout is solid (no missing grout, no gaps wider than a pencil between tiles)?', tier: 3 },
          { id: 'int_floors_carpet_wear', text: 'Carpet looks good (no worn paths or bald spots you can see from 10 feet away)?', tier: 3 },
          { id: 'int_floors_carpet_fray', text: 'Carpet edges are intact (no fraying, unraveling, or loose threads at edges or seams)?', tier: 3, amberEligible: true },
          { id: 'int_floors_carpet_ripples', text: 'Carpet is flat (no bumps, ripples, or waves in the carpet)?', tier: 2 },
          { id: 'int_floors_transitions', text: 'Floor transitions are secure (metal strips between floor types are tight and don\'t move when stepped on)?', tier: 2 }
        ]
      },
      {
        name: 'Ceilings',
        checks: [
          { id: 'int_ceilings_flush', text: 'Ceiling tiles are in place (all tiles sitting flat in the grid, no gaps)?', tier: 3 },
          { id: 'int_ceilings_sag', text: 'Ceiling tiles are level (no tiles sagging or hanging below the others)?', tier: 2 },
          { id: 'int_ceilings_stains', text: 'No ceiling stains (no brown spots or water marks bigger than your hand)?', tier: 1, amberIneligible: true },
          { id: 'int_ceilings_cracks', text: 'No deep cracks (no cracks with visible depth or shadow inside them)?', tier: 2 },
          { id: 'int_ceilings_fixtures', text: 'Ceiling fixtures are secure (lights, vents, and speakers are sitting properly in ceiling)?', tier: 3 }
        ]
      },
      {
        name: 'Doors and Windows',
        checks: [
          { id: 'int_doors_latch', text: 'Doors close properly (door latches shut on the first try without extra pushing)?', tier: 2, amberEligible: true },
          { id: 'int_doors_wobble', text: 'Door handles are tight (no wobble or looseness when you turn the handle)?', tier: 3 },
          { id: 'int_doors_components', text: 'Door hardware is complete (all parts present - handle, latch plate, hinges)?', tier: 3 },
          { id: 'int_doors_hinges', text: 'Doors hang straight (door closes flush against the frame, no gaps or rubbing)?', tier: 3 },
          { id: 'int_doors_glass', text: 'Window glass is intact (no cracks, chips, or broken panes of any size)?', tier: 2, amberEligible: true },
          { id: 'int_doors_frames', text: 'Door and window frames are undamaged (no dents, chips, or missing pieces)?', tier: 3 }
        ]
      },
      {
        name: 'Baseboards and Trim',
        checks: [
          { id: 'int_baseboards_gaps', text: 'Baseboards are tight to wall (no gaps you can see when standing up)?', tier: 3, amberEligible: true },
          { id: 'int_baseboards_damage', text: 'Baseboards are in good shape (no damaged sections longer than your hand)?', tier: 3 },
          { id: 'int_baseboards_missing', text: 'All baseboards are present (no missing sections of baseboard)?', tier: 2 },
          { id: 'int_baseboards_paint', text: 'Baseboard paint is good (no peeling, flaking, or chipping bigger than a quarter)?', tier: 3 }
        ]
      },
      {
        name: 'Lighting and Electrical',
        checks: [
          { id: 'class_lights_working', text: 'All lights work (no burnt out bulbs or flickering lights)?', tier: 2 },
          { id: 'class_lights_covers', text: 'Light covers are in place and clean (no missing or damaged covers)?', tier: 3 },
          { id: 'class_outlets_covers', text: 'All outlet and switch covers are in place (no missing or broken covers)?', tier: 3 },
          { id: 'class_outlets_secure', text: 'Outlets are secure (no loose outlets that move when plugging in)?', tier: 2 }
        ]
      },
      {
        name: 'Furniture (Tables, Chairs, Desks)',
        checks: [
          { id: 'int_furniture_wobble', text: 'Furniture is stable (no wobbling when you sit down or lean on it)?', tier: 2 },
          { id: 'int_furniture_legs', text: 'All legs and supports are intact (no broken, bent, or missing legs)?', tier: 2 },
          { id: 'int_furniture_broken', text: 'Furniture is complete (no broken drawers, missing parts, or damaged pieces)?', tier: 2 },
          { id: 'int_furniture_edges', text: 'No sharp edges exposed (no broken corners, exposed metal, or splintered wood)?', tier: 1 },
          { id: 'int_furniture_upholstery', text: 'Fabric is intact (no tears, rips, or seams coming apart on upholstered items)?', tier: 3 }
        ]
      },
      {
        name: 'Whiteboard/Teaching Surfaces',
        checks: [
          { id: 'class_whiteboard_surface', text: 'Whiteboard surface is undamaged (no dents, scratches, cracks, or delamination)?', tier: 3 },
          { id: 'class_whiteboard_secure', text: 'Whiteboard is securely mounted (no wobble or movement)?', tier: 2 },
          { id: 'class_markers_tray', text: 'Marker tray is intact (no broken or missing tray)?', tier: 3 }
        ]
      }
    ],
    // Bathroom-specific sections
    bathroomSections: [
      {
        name: 'Walls and Partitions',
        checks: [
          { id: 'bath_walls_paint', text: 'Paint is in good condition (no peeling, flaking, or chipping)?', tier: 3 },
          { id: 'bath_walls_water', text: 'No water damage (no water stains, brown spots, or mold)?', tier: 1, amberIneligible: true },
          { id: 'bath_walls_holes', text: 'Walls are intact (no holes or damage bigger than a quarter)?', tier: 3 },
          { id: 'bath_partitions_stable', text: 'Stall partitions are stable (no wobbling or loose partitions)?', tier: 2 },
          { id: 'bath_partitions_hardware', text: 'Partition hardware is complete (all hinges, latches, and hooks present)?', tier: 3 },
          { id: 'bath_partitions_gaps', text: 'Partitions provide privacy (no large gaps between panels)?', tier: 3 }
        ]
      },
      {
        name: 'Floors',
        checks: [
          { id: 'bath_floors_cracks', text: 'Floor tiles are intact (no cracks or chips bigger than a quarter)?', tier: 2 },
          { id: 'bath_floors_grout', text: 'Grout is solid and sealed (no missing, crumbling, or discolored grout)?', tier: 3 },
          { id: 'bath_floors_trip', text: 'No trip hazards (no raised edges, loose tiles, or uneven surfaces)?', tier: 1 },
          { id: 'bath_floors_drain', text: 'Floor drains are clear (no standing water around drains)?', tier: 2 }
        ]
      },
      {
        name: 'Ceilings',
        checks: [
          { id: 'bath_ceilings_stains', text: 'No ceiling stains (no water marks or discoloration)?', tier: 1, amberIneligible: true },
          { id: 'bath_ceilings_tiles', text: 'Ceiling tiles are in place (no missing or sagging tiles)?', tier: 2 },
          { id: 'bath_ceilings_vent', text: 'Exhaust vent is present and appears functional?', tier: 2 }
        ]
      },
      {
        name: 'Toilets and Urinals',
        checks: [
          { id: 'bath_toilets_secure', text: 'Toilets are securely mounted (no rocking or movement)?', tier: 2 },
          { id: 'bath_toilets_flush', text: 'Toilets flush properly (water drains and refills correctly)?', tier: 2 },
          { id: 'bath_toilets_seats', text: 'Toilet seats are intact (no cracks, chips, or loose seats)?', tier: 3 },
          { id: 'bath_toilets_handles', text: 'Flush handles work (no broken or missing handles)?', tier: 2 },
          { id: 'bath_urinals_flush', text: 'Urinals flush properly (if applicable)?', tier: 2 },
          { id: 'bath_urinals_dividers', text: 'Urinal dividers are in place and secure (if applicable)?', tier: 3 }
        ]
      },
      {
        name: 'Sinks and Counters',
        checks: [
          { id: 'bath_sinks_secure', text: 'Sinks are securely mounted (no wobble or movement)?', tier: 2 },
          { id: 'bath_sinks_drain', text: 'Sinks drain properly (no slow drains or standing water)?', tier: 2 },
          { id: 'bath_sinks_faucets', text: 'Faucets work correctly (no leaks, proper hot/cold)?', tier: 2 },
          { id: 'bath_sinks_handles', text: 'Faucet handles are intact (no loose or missing handles)?', tier: 3 },
          { id: 'bath_counters_surface', text: 'Counter surfaces are intact (no chips, cracks, or delamination)?', tier: 3 },
          { id: 'bath_counters_caulk', text: 'Caulking around sinks is intact (no gaps or peeling)?', tier: 3 }
        ]
      },
      {
        name: 'Mirrors',
        checks: [
          { id: 'bath_mirrors_intact', text: 'Mirrors are intact (no cracks, chips, or damage)?', tier: 2 },
          { id: 'bath_mirrors_secure', text: 'Mirrors are securely mounted (no loose or angled mirrors)?', tier: 2 }
        ]
      },
      {
        name: 'Dispensers and Accessories',
        checks: [
          { id: 'bath_soap_dispenser', text: 'Soap dispensers are present and functional?', tier: 2 },
          { id: 'bath_paper_dispenser', text: 'Paper towel dispensers are present and functional?', tier: 2 },
          { id: 'bath_tp_holders', text: 'Toilet paper holders are present and secure?', tier: 3 },
          { id: 'bath_trash_cans', text: 'Trash receptacles are present and functional?', tier: 3 },
          { id: 'bath_sanitary', text: 'Sanitary product dispensers work (if applicable)?', tier: 3 }
        ]
      },
      {
        name: 'Doors',
        checks: [
          { id: 'bath_door_main', text: 'Main door closes and latches properly?', tier: 2 },
          { id: 'bath_door_stalls', text: 'Stall doors close and latch properly?', tier: 2 },
          { id: 'bath_door_hardware', text: 'Door hardware is complete (handles, locks work)?', tier: 3 },
          { id: 'bath_door_gaps', text: 'Door frames are intact (no large gaps or damage)?', tier: 3 }
        ]
      }
    ],
    // Default sections (fallback - used for backwards compatibility)
    sections: [
      {
        name: 'Interior Walls',
        checks: [
          { id: 'int_walls_paint', text: 'Paint is in good condition (no peeling, flaking, or chipping spots bigger than a quarter)?', tier: 3 },
          { id: 'int_walls_bubbling', text: 'Walls are flat (no bubbles, blisters, or bumps in the paint)?', tier: 3 },
          { id: 'int_walls_touchup', text: 'Touch-up paint matches (no obvious patches of different colored paint)?', tier: 3 },
          { id: 'int_walls_water', text: 'No water damage (no water stains, brown spots, or damp areas bigger than your hand)?', tier: 1, amberIneligible: true },
          { id: 'int_walls_holes', text: 'Walls are intact (no holes or gouges bigger than a quarter)?', tier: 3 },
          { id: 'int_walls_cracks', text: 'No deep cracks (no cracks with visible depth or shadow inside them)?', tier: 2 },
          { id: 'int_walls_seams', text: 'Drywall looks smooth (no visible tape lines, seams, or joints when standing arm\'s length away)?', tier: 3 },
          { id: 'int_walls_scuffs', text: 'Walls are mostly scuff-free (no more than 3 scuff marks on any wall)?', tier: 3, amberEligible: true }
        ]
      },
      {
        name: 'Floors',
        checks: [
          { id: 'int_floors_cracks', text: 'Hard floors are intact (no cracks bigger than a quarter)?', tier: 2 },
          { id: 'int_floors_chips', text: 'No chipped edges (no chips or lips that could catch your foot or trip someone)?', tier: 1 },
          { id: 'int_floors_tiles', text: 'Tiles are secure (no loose, wobbly, or cracked tiles)?', tier: 2 },
          { id: 'int_floors_grout', text: 'Grout is solid (no missing grout, no gaps wider than a pencil between tiles)?', tier: 3 },
          { id: 'int_floors_carpet_wear', text: 'Carpet looks good (no worn paths or bald spots you can see from 10 feet away)?', tier: 3 },
          { id: 'int_floors_carpet_fray', text: 'Carpet edges are intact (no fraying, unraveling, or loose threads at edges or seams)?', tier: 3, amberEligible: true },
          { id: 'int_floors_carpet_ripples', text: 'Carpet is flat (no bumps, ripples, or waves in the carpet)?', tier: 2 },
          { id: 'int_floors_transitions', text: 'Floor transitions are secure (metal strips between floor types are tight and don\'t move when stepped on)?', tier: 2 }
        ]
      },
      {
        name: 'Ceilings',
        checks: [
          { id: 'int_ceilings_flush', text: 'Ceiling tiles are in place (all tiles sitting flat in the grid, no gaps)?', tier: 3 },
          { id: 'int_ceilings_sag', text: 'Ceiling tiles are level (no tiles sagging or hanging below the others)?', tier: 2 },
          { id: 'int_ceilings_stains', text: 'No ceiling stains (no brown spots or water marks bigger than your hand)?', tier: 1, amberIneligible: true },
          { id: 'int_ceilings_cracks', text: 'No deep cracks (no cracks with visible depth or shadow inside them)?', tier: 2 },
          { id: 'int_ceilings_fixtures', text: 'Ceiling fixtures are secure (lights, vents, and speakers are sitting properly in ceiling)?', tier: 3 }
        ]
      },
      {
        name: 'Interior Doors and Windows',
        checks: [
          { id: 'int_doors_latch', text: 'Doors close properly (door latches shut on the first try without extra pushing)?', tier: 2, amberEligible: true },
          { id: 'int_doors_wobble', text: 'Door handles are tight (no wobble or looseness when you turn the handle)?', tier: 3 },
          { id: 'int_doors_components', text: 'Door hardware is complete (all parts present - handle, latch plate, hinges)?', tier: 3 },
          { id: 'int_doors_hinges', text: 'Doors hang straight (door closes flush against the frame, no gaps or rubbing)?', tier: 3 },
          { id: 'int_doors_glass', text: 'Window glass is intact (no cracks, chips, or broken panes of any size)?', tier: 2, amberEligible: true },
          { id: 'int_doors_frames', text: 'Door and window frames are undamaged (no dents, chips, or missing pieces)?', tier: 3 }
        ]
      },
      {
        name: 'Baseboards and Trim',
        checks: [
          { id: 'int_baseboards_gaps', text: 'Baseboards are tight to wall (no gaps you can see when standing up)?', tier: 3, amberEligible: true },
          { id: 'int_baseboards_damage', text: 'Baseboards are in good shape (no damaged sections longer than your hand)?', tier: 3 },
          { id: 'int_baseboards_missing', text: 'All baseboards are present (no missing sections of baseboard)?', tier: 2 },
          { id: 'int_baseboards_paint', text: 'Baseboard paint is good (no peeling, flaking, or chipping bigger than a quarter)?', tier: 3 }
        ]
      },
      {
        name: 'Fixtures (Sinks, Lights, Outlets)',
        checks: [
          { id: 'int_fixtures_secure', text: 'Fixtures are attached firmly (nothing loose or pulling away from wall or ceiling)?', tier: 2 },
          { id: 'int_fixtures_broken', text: 'All parts work (no broken handles, knobs, switches, or levers)?', tier: 2 },
          { id: 'int_fixtures_scratches', text: 'Fixtures look good (no big chips or scratches you can see from arm\'s length)?', tier: 3, amberEligible: true },
          { id: 'int_fixtures_covers', text: 'All covers are in place (no missing outlet covers, switch plates, or vent covers)?', tier: 3 }
        ]
      },
      {
        name: 'Furniture (Tables, Chairs, Desks)',
        checks: [
          { id: 'int_furniture_wobble', text: 'Furniture is stable (no wobbling when you sit down or lean on it)?', tier: 2 },
          { id: 'int_furniture_legs', text: 'All legs and supports are intact (no broken, bent, or missing legs)?', tier: 2 },
          { id: 'int_furniture_broken', text: 'Furniture is complete (no broken drawers, missing parts, or damaged pieces)?', tier: 2 },
          { id: 'int_furniture_edges', text: 'No sharp edges exposed (no broken corners, exposed metal, or splintered wood)?', tier: 1 },
          { id: 'int_furniture_upholstery', text: 'Fabric is intact (no tears, rips, or seams coming apart on upholstered items)?', tier: 3 }
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
        name: 'Prior Week Follow-Up',
        checks: [
          { id: 'gov_amber_resolved', text: 'Last week\'s Amber issues are fixed (all yellow-rated items from last week have been repaired)?', tier: 2 },
          { id: 'gov_tickets_closed', text: 'Last week\'s work orders are complete or on track (all tickets from last week are closed or have a plan)?', tier: 3 }
        ]
      },
      {
        name: 'Staff Reporting Queue',
        checks: [
          { id: 'gov_see_it_empty', text: 'Staff reports have been addressed (See It, Snap It queue is empty or caught up)?', tier: 3 }
        ]
      },
      {
        name: 'Alpha Standard',
        checks: [
          { id: 'alpha_standard_pass', text: 'Taking one final look at the entire campus - does this property meet the Alpha Standard?', tier: 2 },
          { id: 'alpha_standard_improvement', text: 'Even if everything passes, note one thing you would recommend we upgrade to raise the bar.', tier: 4, isTextInput: true, placeholder: 'What one improvement would you recommend?' }
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
