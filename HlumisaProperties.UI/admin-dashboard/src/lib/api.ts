const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.hlumisaproperties.online").replace(/\/$/, "");

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("hlumisa_auth_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function mergeHeaders(extra?: Record<string, string>): Record<string, string> {
  return { ...authHeaders(), ...extra };
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

export type Buyer = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  budget: string;
  propertyType: string;
  isContacted: boolean;
  isDiscarded: boolean;
  createdAt?: string;
};

export type Seller = {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  propertyType: string;
  estimatedValue: string;
  isContacted: boolean;
  isDiscarded: boolean;
  statusColor: string;
  createdAt?: string;
};

export type Referral = {
  id: number;
  referrerName: string;
  referrerPhone: string;
  referrerAddress: string;
  referredName: string;
  referredPhone: string;
  referredAddress: string;
  intent: "buy" | "sell";
  note: string;
  date: string;
  isDiscarded: boolean;
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
  images: string[];
  dateAdded: string;
  status: string;
  sellerName: string;
  createdAt?: string;
};

// Buyers
export async function fetchBuyers(): Promise<Buyer[]> {
  const response = await fetch(apiUrl("/api/buyers"), { cache: "no-store", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load buyers (${response.status})`);
  return response.json();
}

export async function createBuyer(data: Partial<Buyer>): Promise<Buyer> {
  const response = await fetch(apiUrl("/api/buyers"), {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create buyer (${response.status})`);
  return response.json();
}

export async function updateBuyer(id: number, data: Partial<Buyer>): Promise<Buyer> {
  const response = await fetch(apiUrl(`/api/buyers/${id}`), {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update buyer (${response.status})`);
  return response.json();
}

export async function deleteBuyer(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/buyers/${id}`), { method: "DELETE", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to delete buyer (${response.status})`);
}

export async function toggleBuyerDiscarded(id: number): Promise<Buyer> {
  const response = await fetch(apiUrl(`/api/buyers/${id}/discard`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to toggle buyer discard (${response.status})`);
  return response.json();
}

export async function markBuyerContacted(id: number): Promise<Buyer> {
  const response = await fetch(apiUrl(`/api/buyers/${id}/mark-contacted`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to mark buyer contacted (${response.status})`);
  return response.json();
}

// Sellers
export async function fetchSellers(): Promise<Seller[]> {
  const response = await fetch(apiUrl("/api/sellers"), { cache: "no-store", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load sellers (${response.status})`);
  return response.json();
}

export async function createSeller(data: Partial<Seller>): Promise<Seller> {
  const response = await fetch(apiUrl("/api/sellers"), {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create seller (${response.status})`);
  return response.json();
}

export async function updateSeller(id: number, data: Partial<Seller>): Promise<Seller> {
  const response = await fetch(apiUrl(`/api/sellers/${id}`), {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update seller (${response.status})`);
  return response.json();
}

export async function deleteSeller(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/sellers/${id}`), { method: "DELETE", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to delete seller (${response.status})`);
}

export async function toggleSellerDiscarded(id: number): Promise<Seller> {
  const response = await fetch(apiUrl(`/api/sellers/${id}/discard`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to toggle seller discard (${response.status})`);
  return response.json();
}

export async function markSellerContacted(id: number): Promise<Seller> {
  const response = await fetch(apiUrl(`/api/sellers/${id}/mark-contacted`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to mark seller contacted (${response.status})`);
  return response.json();
}

export async function cycleSellerStatusColor(id: number): Promise<Seller> {
  const response = await fetch(apiUrl(`/api/sellers/${id}/cycle-status`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to cycle seller status (${response.status})`);
  return response.json();
}

// Referrals
export async function fetchReferrals(): Promise<Referral[]> {
  const response = await fetch(apiUrl("/api/referrals"), { cache: "no-store", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load referrals (${response.status})`);
  return response.json();
}

export async function createReferral(data: Partial<Referral>): Promise<Referral> {
  const response = await fetch(apiUrl("/api/referrals"), {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create referral (${response.status})`);
  return response.json();
}

export async function updateReferral(id: number, data: Partial<Referral>): Promise<Referral> {
  const response = await fetch(apiUrl(`/api/referrals/${id}`), {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update referral (${response.status})`);
  return response.json();
}

export async function deleteReferral(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/referrals/${id}`), { method: "DELETE", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to delete referral (${response.status})`);
}

export async function toggleReferralDiscarded(id: number): Promise<Referral> {
  const response = await fetch(apiUrl(`/api/referrals/${id}/discard`), { method: "PATCH", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to toggle referral discard (${response.status})`);
  return response.json();
}

// Properties
export async function fetchProperties(): Promise<PropertyListing[]> {
  const response = await fetch(apiUrl("/api/property-listings"), { cache: "no-store", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to load properties (${response.status})`);
  return response.json();
}

export async function createProperty(data: Partial<PropertyListing>): Promise<PropertyListing> {
  const response = await fetch(apiUrl("/api/property-listings"), {
    method: "POST",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create property (${response.status})`);
  return response.json();
}

export async function updateProperty(id: number, data: Partial<PropertyListing>): Promise<PropertyListing> {
  const response = await fetch(apiUrl(`/api/property-listings/${id}`), {
    method: "PUT",
    headers: mergeHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update property (${response.status})`);
  return response.json();
}

export async function deleteProperty(id: number): Promise<void> {
  const response = await fetch(apiUrl(`/api/property-listings/${id}`), { method: "DELETE", headers: authHeaders() });
  if (!response.ok) throw new Error(`Failed to delete property (${response.status})`);
}