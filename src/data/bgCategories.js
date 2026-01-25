// B&G Issue Categories for Routing
// Based on 14.13 Building and Grounds Quality Bar - Observation & Routing section

export const BG_ISSUE_CATEGORIES = [
  // B&G Owned Issues (creates Worksmith ticket)
  { id: 'landscaping', name: 'Landscaping', icon: '🌿', team: 'Worksmith', pillar: 'B&G' },
  { id: 'hardscape', name: 'Hardscape/Parking', icon: '🅿️', team: 'Worksmith', pillar: 'B&G' },
  { id: 'exterior', name: 'Building Exterior', icon: '🏢', team: 'Worksmith', pillar: 'B&G' },
  { id: 'entrance', name: 'Entrance/Arrival', icon: '🚪', team: 'Worksmith', pillar: 'B&G' },
  { id: 'interior_condition', name: 'Interior Condition', icon: '🧱', team: 'Worksmith', pillar: 'B&G' },

  // Routed to Other Pillars
  { id: 'security', name: 'Security', icon: '🔒', team: 'Security Pillar', pillar: 'Security', tier: 1 },
  { id: 'outdoor_rec', name: 'Outdoor Recreation', icon: '🎮', team: 'Outdoor Rec Pillar', pillar: 'Outdoor Recreation' },
  { id: 'fire_safety', name: 'Fire & Life Safety', icon: '🔥', team: 'Fire/Life Safety Pillar', pillar: 'Fire/Life Safety', tier: 1 },
  { id: 'mechanical', name: 'Mechanical (HVAC/Plumbing/Electrical)', icon: '⚙️', team: 'Mechanical Domain', pillar: 'Mechanical' },
  { id: 'cleanliness', name: 'Cleanliness', icon: '🧹', team: 'Cleanliness Domain', pillar: 'Cleanliness' },
  { id: 'structural', name: 'Structural/Capital', icon: '🏗️', team: 'Leadership', pillar: 'Leadership' }
];

// Routing rules from Quality Bar
export const ROUTING_RULES = {
  security: {
    pillar: 'Security Pillar',
    tier: 1,
    immediateTicket: true,
    examples: [
      'Perimeter doors not latching properly',
      'Gates not self-closing and latching',
      'Fencing gaps',
      'Cameras not powered or views obstructed',
      'Access readers not functional',
      'Doors propped open'
    ]
  },
  outdoor_rec: {
    pillar: 'Outdoor Recreation Pillar',
    tier: 2,
    immediateTicket: true,
    examples: [
      'Equipment with visible damage',
      'Sharp edges or hazards visible',
      'Surfacing voids or displacement',
      'Hard surface exposed in fall zones',
      'Fencing or gate issues',
      'Debris/foreign objects in play area'
    ]
  },
  fire_safety: {
    pillar: 'Fire/Life Safety Pillar',
    tier: 1,
    immediateTicket: true,
    examples: [
      'Extinguishers missing or tags not current',
      'Emergency lighting not functional',
      'Exit signage not illuminated',
      'Address numbers not visible from street',
      'Egress paths obstructed'
    ]
  },
  mechanical: {
    pillar: 'Mechanical Domain',
    tier: 2,
    immediateTicket: true,
    examples: [
      'Temperature complaints',
      'Plumbing issues',
      'Electrical issues',
      'Elevator not functioning'
    ]
  },
  cleanliness: {
    pillar: 'Cleanliness Domain',
    tier: 3,
    immediateTicket: true,
    examples: [
      'Interior cleanliness issues'
    ]
  },
  structural: {
    pillar: 'Leadership',
    tier: 3,
    immediateTicket: false,
    flagForMonthlyReport: true,
    examples: [
      'Structural cracks',
      'Foundation concerns',
      'End-of-life asset conditions',
      'Issues requiring capital investment'
    ]
  }
};

// Routing precedence (from Quality Bar)
// When an observation spans multiple pillars, route to the pillar with higher safety criticality
export const ROUTING_PRECEDENCE = [
  'security',      // Highest priority
  'fire_safety',
  'outdoor_rec',
  'mechanical',
  'cleanliness',
  'structural'     // Lowest priority (flags to Leadership)
];

// Get category by ID
export const getCategoryById = (id) => {
  return BG_ISSUE_CATEGORIES.find(cat => cat.id === id);
};

// Get routing rule by category ID
export const getRoutingRule = (categoryId) => {
  return ROUTING_RULES[categoryId] || null;
};

// Check if category is B&G owned
export const isBGOwned = (categoryId) => {
  const category = getCategoryById(categoryId);
  return category?.pillar === 'B&G';
};

// Get tier for a routed observation
export const getObservationTier = (categoryId) => {
  const rule = ROUTING_RULES[categoryId];
  return rule?.tier || 3;
};
