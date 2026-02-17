// Campus Room Lists
// Maps campus names to their specific room lists
// When a campus has a room list defined here, checklist setup pages
// will show dropdown selectors instead of free text inputs.
//
// To add rooms for a new campus, add an entry to CAMPUS_ROOMS below.
// Each room should have:
//   - name: Display name (required)
//   - type: Room category - "learning", "restroom", "common", "office", "kitchen", "storage", "vestibule", "hallway", "other"
//   - floor: Optional floor identifier (e.g., "1", "2", "Main")

export const CAMPUS_ROOMS = {
  "GT School": [
    // Element-themed learning spaces (from floor plan)
    { name: "Neon Room", type: "learning" },
    { name: "Platinum Room", type: "learning" },
    { name: "Gold Room", type: "learning" },
    { name: "Argon Room", type: "learning" },
    { name: "Nickel Room", type: "learning" },
    { name: "Carbon Room", type: "learning" },
    { name: "Oxygen Room", type: "learning" },
    { name: "Nitrogen Room", type: "learning" },
    { name: "Silicon Room", type: "learning" },
    { name: "Hydrogen Room", type: "learning" },
    { name: "Sodium Room", type: "learning" },
    { name: "Iron Room", type: "learning" },
    { name: "Copper Room", type: "learning" },
    { name: "Zinc Room", type: "learning" },
    { name: "Silver Room", type: "learning" },
    { name: "Helium Room", type: "learning" },
    { name: "Lithium Room", type: "learning" },
    { name: "Boron Room", type: "learning" },
    // Front lobby
    { name: "Vestibule", type: "vestibule" },
    // Hallways
    { name: "Main Hallway", type: "hallway" },
    // Restrooms - main hallway + in-classroom bathrooms
    { name: "Main Hallway Bathroom", type: "restroom" },
    { name: "Carbon Room Bathroom", type: "restroom" },
    { name: "Oxygen Room Bathroom", type: "restroom" },
    { name: "Nitrogen Room Bathroom", type: "restroom" },
    { name: "Silver Room Bathroom", type: "restroom" },
    { name: "Zinc Room Bathroom", type: "restroom" },
    { name: "Copper Room Bathroom", type: "restroom" },
    { name: "Iron Room Bathroom", type: "restroom" },
    // Lithium bathroom converted to nursing/safe space
    { name: "Lithium Room - Nursing/Safe Space", type: "other", note: "Converted from bathroom" },
  ]
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all rooms for a campus
 * @param {string} campusName - The campus name (must match CAMPUSES entry)
 * @returns {Array} Array of room objects, or empty array if no rooms defined
 */
export const getCampusRooms = (campusName) => {
  return CAMPUS_ROOMS[campusName] || [];
};

/**
 * Get rooms filtered by type for a campus
 * @param {string} campusName
 * @param {string|string[]} types - Single type or array of types to filter by
 * @returns {Array} Filtered room objects
 */
export const getCampusRoomsByType = (campusName, types) => {
  const rooms = getCampusRooms(campusName);
  const typeArray = Array.isArray(types) ? types : [types];
  return rooms.filter(room => typeArray.includes(room.type));
};

/**
 * Check if a campus has a room list defined
 * @param {string} campusName
 * @returns {boolean}
 */
export const hasCampusRooms = (campusName) => {
  return Boolean(CAMPUS_ROOMS[campusName] && CAMPUS_ROOMS[campusName].length > 0);
};

/**
 * Get all room names for a campus (flat string array)
 * @param {string} campusName
 * @returns {string[]}
 */
export const getCampusRoomNames = (campusName) => {
  return getCampusRooms(campusName).map(room => room.name);
};

/**
 * Get room names filtered by type
 * @param {string} campusName
 * @param {string|string[]} types
 * @returns {string[]}
 */
export const getCampusRoomNamesByType = (campusName, types) => {
  return getCampusRoomsByType(campusName, types).map(room => room.name);
};

/**
 * Get all available room types for a campus
 * @param {string} campusName
 * @returns {string[]}
 */
export const getCampusRoomTypes = (campusName) => {
  const rooms = getCampusRooms(campusName);
  return [...new Set(rooms.map(room => room.type))];
};

// Room type display labels
export const ROOM_TYPE_LABELS = {
  learning: "Learning Space",
  restroom: "Restroom",
  common: "Common Area",
  office: "Office",
  kitchen: "Kitchen / Food Service",
  storage: "Storage",
  vestibule: "Vestibule / Lobby",
  hallway: "Hallway / Corridor",
  other: "Other"
};

/**
 * Get display label for a room type
 * @param {string} type
 * @returns {string}
 */
export const getRoomTypeLabel = (type) => {
  return ROOM_TYPE_LABELS[type] || type;
};
