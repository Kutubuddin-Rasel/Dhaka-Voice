// Static location data service
// This replaces the need to store thana/ward data in the database

export interface Thana {
  id: number;
  name: string;
  code: string;
}

export interface Ward {
  id: number;
  wardNumber: number;
  name: string;
  areas: string[];
  cityCorporation?: 'DNCC' | 'DSCC';
}

export interface LocationData {
  thanas: Thana[];
  wards: {
    DNCC: Ward[];
    DSCC: Ward[];
  };
}

// Cache for location data
let locationData: LocationData | null = null;

// Load location data from static JSON file
export async function loadLocationData(): Promise<LocationData> {
  if (locationData) {
    return locationData;
  }

  try {
    const response = await fetch('/data/locations.json');
    if (!response.ok) {
      throw new Error('Failed to load location data');
    }
    locationData = await response.json();
    return locationData!;
  } catch (error) {
    console.error('Error loading location data:', error);
    throw new Error('Failed to load location data');
  }
}

// Search thanas by query
export async function searchThanas(query?: string): Promise<Thana[]> {
  const data = await loadLocationData();
  
  if (!query) {
    return data.thanas;
  }

  const lowercaseQuery = query.toLowerCase();
  return data.thanas.filter(thana => 
    thana.name.toLowerCase().includes(lowercaseQuery) ||
    thana.code.toLowerCase().includes(lowercaseQuery)
  );
}

// Get wards by city corporation
export async function getWards(cityCorporation?: 'DNCC' | 'DSCC'): Promise<Ward[]> {
  const data = await loadLocationData();
  
  if (!cityCorporation) {
    return [
      ...data.wards.DNCC.map(ward => ({ ...ward, cityCorporation: 'DNCC' as const })),
      ...data.wards.DSCC.map(ward => ({ ...ward, cityCorporation: 'DSCC' as const }))
    ];
  }

  return data.wards[cityCorporation].map(ward => ({ ...ward, cityCorporation }));
}

// Get thana by ID
export async function getThanaById(id: number): Promise<Thana | null> {
  const data = await loadLocationData();
  return data.thanas.find(thana => thana.id === id) || null;
}

// Get ward by ID
export async function getWardById(id: number): Promise<Ward | null> {
  const data = await loadLocationData();
  const allWards = [...data.wards.DNCC, ...data.wards.DSCC];
  return allWards.find(ward => ward.id === id) || null;
}

// Get ward by city corporation and ward number
export async function getWardByNumber(
  cityCorporation: 'DNCC' | 'DSCC', 
  wardNumber: number
): Promise<Ward | null> {
  const data = await loadLocationData();
  return data.wards[cityCorporation].find(ward => ward.wardNumber === wardNumber) || null;
}

// Get city corporation for a ward
export async function getCityCorporationForWard(wardId: number): Promise<'DNCC' | 'DSCC' | null> {
  const data = await loadLocationData();
  
  if (data.wards.DNCC.find(ward => ward.id === wardId)) {
    return 'DNCC';
  }
  
  if (data.wards.DSCC.find(ward => ward.id === wardId)) {
    return 'DSCC';
  }
  
  return null;
}

// Format location display string
export async function formatLocationDisplay(thanaId?: number, wardId?: number): Promise<string> {
  if (!thanaId || !wardId) {
    return 'Location not specified';
  }

  const [thana, ward] = await Promise.all([
    getThanaById(thanaId),
    getWardById(wardId)
  ]);

  if (!thana || !ward) {
    return 'Location not specified';
  }

  const cityCorp = await getCityCorporationForWard(wardId);
  return `${thana.name}, Ward ${ward.wardNumber} (${cityCorp})`;
}

// Get all thanas (for admin purposes)
export async function getAllThanas(): Promise<Thana[]> {
  const data = await loadLocationData();
  return data.thanas;
}

// Get all wards (for admin purposes)
export async function getAllWards(): Promise<Ward[]> {
  const data = await loadLocationData();
  return [...data.wards.DNCC, ...data.wards.DSCC];
}
