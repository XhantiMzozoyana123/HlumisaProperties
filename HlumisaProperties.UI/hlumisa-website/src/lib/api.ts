// Hardcoded production API base URL — intentionally NOT read from an env var,
// so a stale build-time value can never make a deployed UI talk to the wrong API.
// For local development against a local API, temporarily change this constant.
const apiBaseUrl = "https://api.hlumisaproperties.online";

export type PropertyListing = {
  id: number;
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  sizeInSqm: number;
  isAvailable: boolean;
  imageBase64: string;
  images: string[];
  dateAdded: string;
  status: string;
  sellerName: string;
  createdAt?: string;
};

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function fetchProperties(): Promise<PropertyListing[]> {
  const response = await fetch(`${apiBaseUrl}/api/property-listings`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Failed to load properties (${response.status})`);
  return response.json();
}

export async function fetchPropertyById(id: number): Promise<PropertyListing> {
  const response = await fetch(`${apiBaseUrl}/api/property-listings/${id}`, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Failed to load property (${response.status})`);
  return response.json();
}