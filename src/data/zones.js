export const ZONES = {
  entry: {
    name: "Entry & Lobby",
    type: "mandatory",
    amberEligible: true,
    description: "Parent-facing zone",
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Entry mat clean and flat (no trip hazard)?",
      "Exterior door glass smudge-free?",
      "Interior glass smudge-free?",
      "Reception surfaces dust-free?",
      "High-touch surfaces clean (door handles, counter)?",
      "Trash cans empty with liners intact?",
      "No detectable odor from doorway?",
      "All clear — no safety hazards?"
    ]
  },
  hallway: {
    name: "Hallway / Corridor",
    type: "mandatory",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Edges, corners, and baseboards dust-free?",
      "No visible scuff marks on walls?",
      "Glass and doors smudge-free?",
      "High-touch surfaces clean (door handles, railings)?",
      "Trash cans empty with liners intact?",
      "All clear — no safety hazards?"
    ]
  },
  restroom_primary: {
    name: "Restroom (Primary)",
    type: "mandatory",
    amberEligible: false,
    description: "Any defect = RED",
    cleanliness: [
      "Toilets/urinals sanitary (no visible soil, stains, residue)?",
      "Sinks and counters dry and clean?",
      "Mirrors smudge-free?",
      "Floor free of debris, water, and stains?",
      "Soap dispensers functional and stocked?",
      "Paper towels/hand dryers functional and stocked?",
      "Toilet paper stocked (not empty)?",
      "Trash cans empty with liners intact?",
      "No detectable odor from doorway?",
      "All clear — no safety hazards?"
    ]
  },
  commons: {
    name: "Commons Area",
    type: "mandatory",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Tables and surfaces clean and dry?",
      "Furniture properly arranged (not scattered)?",
      "High-touch surfaces clean?",
      "Trash cans empty with liners intact?",
      "No detectable odor?",
      "All clear — no safety hazards?"
    ]
  },
  supply_closet: {
    name: "Supply Closet",
    type: "mandatory",
    amberEligible: true,
    description: "1-week minimum threshold",
    isSupplyCheck: true,
    cleanliness: [
      "Toilet paper: 1-week supply available?",
      "Paper towels: 1-week supply available?",
      "Soap/sanitizer: 1-week supply available?",
      "Trash liners: 1-week supply available?",
      "Cleaning supplies present and stocked?",
      "Closet organized (not cluttered/hazardous)?"
    ],
    supplyItems: [0, 1, 2, 3]
  },
  restroom_additional: {
    name: "Restroom (Additional)",
    type: "optional",
    amberEligible: false,
    description: "Any defect = RED",
    cleanliness: [
      "Toilets/urinals sanitary?",
      "Sinks and counters dry and clean?",
      "Mirrors smudge-free?",
      "Floor free of debris, water, and stains?",
      "Soap dispensers functional and stocked?",
      "Paper towels/hand dryers functional and stocked?",
      "Toilet paper stocked?",
      "Trash cans empty with liners intact?",
      "No detectable odor from doorway?",
      "All clear — no safety hazards?"
    ]
  },
  classroom: {
    name: "Classroom",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Edges, corners, and baseboards dust-free?",
      "Student desks/tables clean?",
      "Teacher desk/surfaces clean?",
      "Whiteboard/board area clean (tray, ledge)?",
      "High-touch surfaces clean (door handle, light switches)?",
      "Trash cans empty with liners intact?",
      "All clear — no safety hazards?"
    ]
  },
  office: {
    name: "Office / Workroom",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris and stains?",
      "Desk and work surfaces dust-free?",
      "High-touch surfaces clean?",
      "Trash cans empty with liners intact?",
      "All clear — no safety hazards?"
    ]
  },
  gym: {
    name: "Gym / Multi-Purpose",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Floor finish intact (no excessive scuffing/peeling)?",
      "Bleachers/seating clean?",
      "Equipment storage area organized?",
      "High-touch surfaces clean (door handles, equipment)?",
      "Trash cans empty with liners intact?",
      "No detectable odor?",
      "All clear — no safety hazards?"
    ]
  },
  cafeteria: {
    name: "Cafeteria",
    type: "optional",
    amberEligible: true,
    cleanliness: [
      "Floor free of debris, spills, and stains?",
      "Tables and seating clean and dry?",
      "Service/counter area clean?",
      "High-touch surfaces clean?",
      "Trash cans empty with liners intact?",
      "No detectable odor?",
      "All clear — no safety hazards?"
    ]
  }
};

export const MANDATORY_ZONE_IDS = ['entry', 'hallway', 'restroom_primary', 'commons', 'supply_closet'];
export const OPTIONAL_ZONE_IDS = ['restroom_additional', 'classroom', 'office', 'gym', 'cafeteria'];
