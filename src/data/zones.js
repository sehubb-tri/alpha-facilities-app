// Restroom checklist template - used to generate dynamic restroom zones
export const RESTROOM_TEMPLATE = {
  type: "restroom",
  amberEligible: false,
  description: "Any defect = RED",
  cleanliness: [
    "Toilets and urinals are clean (no soil, stains, or residue)?",
    "Sinks and counters are dry and clean (no water spots or residue)?",
    "Mirrors are clean (no smudges or streaks)?",
    "Floor is clean (no debris, water, or stains)?",
    "Soap dispensers are working and stocked (enough for one full day)?",
    "Paper towels or hand dryers are working and stocked (enough for one full day)?",
    "Toilet paper is fully stocked (fresh rolls in place)?",
    "Trash cans are empty with liners in place (no overflow)?",
    "Free of bad odors (no urine, mold, sewage, or garbage smell)?",
    "Area is safe (no wet floors, broken fixtures, or hazards)?"
  ]
};

// Helper to generate restroom zone for a given number or named restroom
export const createRestroomZone = (num, customName) => ({
  ...RESTROOM_TEMPLATE,
  name: customName || `Restroom ${num}`,
});

// Classroom checklist template - used to generate dynamic classroom zones
export const CLASSROOM_TEMPLATE = {
  type: "classroom",
  amberEligible: true,
  cleanliness: [
    "Floor is clean (no debris, spills, or stains)?",
    "Edges, corners, and baseboards are dust-free (no buildup)?",
    "Student desks and tables are clean (no writing, stickers, or residue)?",
    "Teacher desk and surfaces are clean (no dust or clutter)?",
    "Whiteboard area is clean (tray wiped, ledge dust-free)?",
    "High-touch surfaces are clean (door handle, light switches)?",
    "Trash cans are empty with liners in place (no overflow)?",
    "Area is safe (no tripping hazards, loose wires, or broken items)?"
  ]
};

// Helper to generate classroom zone for a given number or named room
export const createClassroomZone = (num, customName) => ({
  ...CLASSROOM_TEMPLATE,
  name: customName || `Classroom ${num}`,
});

export const ZONES = {
  entry: {
    name: "Entry & Lobby",
    type: "mandatory",
    amberEligible: true,
    description: "Parent-facing zone",
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Entry mat is clean and flat (no curled edges or trip hazards)?",
      "Exterior door glass is clean (no smudges or fingerprints)?",
      "Interior glass is clean (no smudges or streaks)?",
      "Reception surfaces are dust-free (counters, desks, shelves)?",
      "High-touch surfaces are clean (door handles, counter edges)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Free of bad odors (no mold, garbage, or musty smell)?",
      "Area is safe (no wet floors, loose items, or hazards)?"
    ]
  },
  hallway: {
    name: "Hallway / Corridor",
    type: "mandatory",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Edges, corners, and baseboards are dust-free (no buildup)?",
      "Walls are free of scuff marks (no black marks or scrapes)?",
      "Glass and doors are clean (no smudges or fingerprints)?",
      "High-touch surfaces are clean (door handles, railings, light switches)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Area is safe (no wet floors, obstacles, or hazards)?"
    ]
  },
  commons: {
    name: "Commons Area",
    type: "mandatory",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Tables and surfaces are clean and dry (no sticky spots or residue)?",
      "Furniture is properly arranged (chairs pushed in, not scattered)?",
      "High-touch surfaces are clean (door handles, table edges, chair backs)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Free of bad odors (no food, mold, or garbage smell)?",
      "Area is safe (no wet floors, broken furniture, or hazards)?"
    ]
  },
  supply_closet: {
    name: "Supply Closet",
    type: "mandatory",
    amberEligible: true,
    description: "1-week minimum threshold",
    isSupplyCheck: true,
    cleanliness: [
      "Toilet paper supply is sufficient (enough for one week)?",
      "Paper towel supply is sufficient (enough for one week)?",
      "Soap and sanitizer supply is sufficient (enough for one week)?",
      "Trash liner supply is sufficient (enough for one week)?",
      "Cleaning supplies are present and stocked (chemicals, mops, rags)?",
      "Closet is organized (items on shelves, nothing blocking walkway)?"
    ],
    supplyItems: [0, 1, 2, 3]
  },
  classroom: {
    name: "Classroom",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Edges, corners, and baseboards are dust-free (no buildup)?",
      "Student desks and tables are clean (no writing, stickers, or residue)?",
      "Teacher desk and surfaces are clean (no dust or clutter)?",
      "Whiteboard area is clean (tray wiped, ledge dust-free)?",
      "High-touch surfaces are clean (door handle, light switches)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Area is safe (no tripping hazards, loose wires, or broken items)?"
    ]
  },
  office: {
    name: "Office / Workroom",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Desk and work surfaces are dust-free (no buildup or clutter)?",
      "High-touch surfaces are clean (door handles, light switches, shared equipment)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Area is safe (no tripping hazards, loose wires, or blocked exits)?"
    ]
  },
  gym: {
    name: "Gym / Multi-Purpose",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Floor finish is intact (no excessive scuffing, peeling, or damage)?",
      "Bleachers and seating are clean (no dust, debris, or sticky spots)?",
      "Equipment storage area is organized (items put away, nothing on floor)?",
      "High-touch surfaces are clean (door handles, equipment, railings)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Free of bad odors (no sweat, mold, or musty smell)?",
      "Area is safe (no loose equipment, wet floors, or hazards)?"
    ]
  },
  cafeteria: {
    name: "Cafeteria",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor is clean (no debris, spills, or stains)?",
      "Tables and seating are clean and dry (no sticky spots or food residue)?",
      "Service and counter area is clean (no crumbs, spills, or buildup)?",
      "High-touch surfaces are clean (door handles, tray rails, chair backs)?",
      "Trash cans are empty with liners in place (no overflow)?",
      "Free of bad odors (no spoiled food, garbage, or drain smell)?",
      "Area is safe (no wet floors, broken chairs, or hazards)?"
    ]
  },
  alpha_standard: {
    name: "Alpha Standard",
    type: "final",
    amberEligible: false,
    description: "Final campus review - does this property meet the Alpha Standard?",
    cleanliness: [
      "Taking one final look at the entire campus - does this property meet the Alpha Standard?"
    ],
    improvementQuestion: {
      text: "Even if everything passes, note one thing you would recommend we upgrade to raise the bar.",
      placeholder: "What one improvement would you recommend?"
    }
  }
};

// Tour route zones (non-restroom mandatory zones)
export const TOUR_ROUTE_ZONE_IDS = ['entry', 'hallway', 'commons', 'supply_closet'];

// Final zone (always at end of walkthrough) - Alpha Standard removed per user request
export const FINAL_ZONE_IDS = [];

// Optional zones (can be added to walkthrough)
export const OPTIONAL_ZONE_IDS = ['classroom', 'office', 'gym', 'cafeteria'];

// Legacy export for backward compatibility
export const MANDATORY_ZONE_IDS = TOUR_ROUTE_ZONE_IDS;
