const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.hlumisaproperties.online").replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatArea(sizeInSqm: number) {
  return new Intl.NumberFormat("en-ZA", {
    maximumFractionDigits: 0,
  }).format(sizeInSqm);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export type Lead = {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  location: string;
  leadType: string;
  isContacted: boolean;
  jsonCommunicationThread: string;
  createdAt?: string;
};

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
};

export async function fetchLeads(): Promise<Lead[]> {
  const response = await fetch(apiUrl("/api/leads"), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load leads (${response.status})`);
  return response.json();
}

export async function fetchProperties(): Promise<PropertyListing[]> {
  const response = await fetch(apiUrl("/api/property-listings"), { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load properties (${response.status})`);
  return response.json();
}

export async function createProperty(data: Partial<PropertyListing>): Promise<PropertyListing> {
  const response = await fetch(apiUrl("/api/property-listings"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create property (${response.status})`);
  return response.json();
}

export async function updateProperty(id: number, data: Partial<PropertyListing>): Promise<PropertyListing> {
  const response = await fetch(apiUrl(`/api/property-listings/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update property (${response.status})`);
  return response.json();
}

export async function deleteProperty(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/property-listings/${id}`), { method: "DELETE" });
  if (!response.ok) throw new Error(`Failed to delete property (${response.status})`);
}

export async function updateLeadContacted(id: number, isContacted: boolean): Promise<Lead> {
  const response = await fetch(apiUrl(`/api/leads/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isContacted }),
  });
  if (!response.ok) throw new Error(`Failed to update lead (${response.status})`);
  return response.json();
}