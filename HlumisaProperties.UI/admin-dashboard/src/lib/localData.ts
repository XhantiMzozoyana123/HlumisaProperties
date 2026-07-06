// Demo data store — backed by localStorage for profile picture and demo referrals/houses

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ─── Profile picture ─── */

export type ProfilePicture = {
  dataUrl: string; // base64 data URL
  name: string;
};

export function getProfilePicture(): ProfilePicture | null {
  return getItem<ProfilePicture | null>("hlumisa_profile_picture", null);
}

export function saveProfilePicture(pic: ProfilePicture) {
  setItem("hlumisa_profile_picture", pic);
}

/* ─── Referrals (demo) ─── */

export type Referral = {
  id: string;
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
};

const DEFAULT_REFERRALS: Referral[] = [
  {
    id: "r1",
    referrerName: "Nomsa Dlamini",
    referrerPhone: "+27 82 555 0101",
    referrerAddress: "12 Acacia Street, Sandton, 2196",
    referredName: "Thabo Mokoena",
    referredPhone: "+27 71 555 0102",
    referredAddress: "45 Oak Avenue, Midrand, 1685",
    intent: "buy",
    note: "Looking for a 3-bedroom house in Sandton.",
    date: "2026-06-28",
    isDiscarded: false,
  },
  {
    id: "r2",
    referrerName: "Bongani Ndlovu",
    referrerPhone: "+27 73 555 0103",
    referrerAddress: "78 Sea View Road, Durban North, 4051",
    referredName: "Lindiwe Zulu",
    referredPhone: "+27 64 555 0104",
    referredAddress: "23 Palm Boulevard, Umhlanga, 4319",
    intent: "sell",
    note: "Wanting to sell a 4-bedroom home in Durban North.",
    date: "2026-06-25",
    isDiscarded: false,
  },
  {
    id: "r3",
    referrerName: "Amanda Khumalo",
    referrerPhone: "+27 82 555 0105",
    referrerAddress: "5 Long Street, Cape Town CBD, 8001",
    referredName: "Sipho Molefe",
    referredPhone: "+27 76 555 0106",
    referredAddress: "12 Bree Street, Cape Town, 8001",
    intent: "buy",
    note: "First-time buyer looking for a flat in Cape Town CBD.",
    date: "2026-06-20",
    isDiscarded: false,
  },
  {
    id: "r4",
    referrerName: "Thulani Hadebe",
    referrerPhone: "+27 72 555 0107",
    referrerAddress: "99 Main Road, Midrand, 1682",
    referredName: "Nosipho Mthembu",
    referredPhone: "+27 83 555 0108",
    referredAddress: "15 Hibiscus Lane, Midrand, 1685",
    intent: "sell",
    note: "Selling a duplex in Midrand, asking R2.4M.",
    date: "2026-06-15",
    isDiscarded: false,
  },
  {
    id: "r5",
    referrerName: "Zola Mzozoyana",
    referrerPhone: "+27 82 555 0001",
    referrerAddress: "1 Luxury Drive, Umhlanga Ridge, 4319",
    referredName: "Refiloe Moeketsi",
    referredPhone: "+27 61 555 0109",
    referredAddress: "88 Palm Resort, Umhlanga, 4319",
    intent: "buy",
    note: "Looking for a luxury penthouse in Umhlanga.",
    date: "2026-06-10",
    isDiscarded: false,
  },
];

export function getReferrals(): Referral[] {
  return getItem<Referral[]>("hlumisa_referrals", DEFAULT_REFERRALS);
}

export function saveReferrals(refs: Referral[]) {
  setItem("hlumisa_referrals", refs);
}

export function addReferral(r: Referral) {
  const current = getReferrals();
  current.unshift(r);
  saveReferrals(current);
}

export function deleteReferral(id: string) {
  const current = getReferrals();
  saveReferrals(current.filter((ref) => ref.id !== id));
}

export function toggleReferralDiscarded(id: string) {
  const current = getReferrals();
  saveReferrals(current.map((ref) => (ref.id === id ? { ...ref, isDiscarded: !ref.isDiscarded } : ref)));
}

/* ─── Buyers (demo) ─── */

export type Buyer = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  budget: string;
  propertyType: string;
  isContacted: boolean;
  isDiscarded: boolean;
};

const DEFAULT_BUYERS: Buyer[] = [
  { id: "b1", firstName: "Thabo", lastName: "Mokoena", phoneNumber: "+27 82 123 4567", location: "Sandton, Johannesburg", budget: "R2.5M - R3.5M", propertyType: "Apartment", isContacted: true, isDiscarded: false },
  { id: "b2", firstName: "Lerato", lastName: "Ndlovu", phoneNumber: "+27 73 234 5678", location: "Fourways, Johannesburg", budget: "R4M - R5.5M", propertyType: "House", isContacted: false, isDiscarded: false },
  { id: "b3", firstName: "Sipho", lastName: "Zulu", phoneNumber: "+27 64 345 6789", location: "Midrand, Gauteng", budget: "R1.8M - R2.2M", propertyType: "Townhouse", isContacted: true, isDiscarded: false },
  { id: "b4", firstName: "Nomvula", lastName: "Dlamini", phoneNumber: "+27 71 456 7890", location: "Centurion, Pretoria", budget: "R3M - R4M", propertyType: "House", isContacted: false, isDiscarded: false },
  { id: "b5", firstName: "Bongani", lastName: "Khumalo", phoneNumber: "+27 76 567 8901", location: "Durbanville, Cape Town", budget: "R6M - R8M", propertyType: "Luxury Villa", isContacted: false, isDiscarded: false },
  { id: "b6", firstName: "Zanele", lastName: "Mthembu", phoneNumber: "+27 82 678 9012", location: "Bedfordview, Johannesburg", budget: "R2M - R3M", propertyType: "Apartment", isContacted: true, isDiscarded: false },
  { id: "b7", firstName: "Kagiso", lastName: "Motaung", phoneNumber: "+27 74 789 0123", location: "Sunninghill, Johannesburg", budget: "R5M - R7M", propertyType: "House", isContacted: false, isDiscarded: false },
  { id: "b8", firstName: "Precious", lastName: "Ngcobo", phoneNumber: "+27 63 890 1234", location: "Umhlanga, Durban", budget: "R3.5M - R4.5M", propertyType: "Apartment", isContacted: false, isDiscarded: false },
];

export function getBuyers(): Buyer[] {
  return getItem<Buyer[]>("hlumisa_buyers", DEFAULT_BUYERS);
}

export function saveBuyers(buyers: Buyer[]) {
  setItem("hlumisa_buyers", buyers);
}

export function addBuyer(buyer: Buyer) {
  const current = getBuyers();
  current.unshift(buyer);
  saveBuyers(current);
}

export function deleteBuyer(id: string) {
  const current = getBuyers();
  saveBuyers(current.filter((b) => b.id !== id));
}

export function toggleBuyerDiscarded(id: string) {
  const current = getBuyers();
  saveBuyers(current.map((b) => (b.id === id ? { ...b, isDiscarded: !b.isDiscarded } : b)));
}

/* ─── Sellers (demo) ─── */

export type SellerStatusColor = "white" | "red" | "green";

export type Seller = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  location: string;
  propertyType: string;
  estimatedValue: string;
  isContacted: boolean;
  isDiscarded: boolean;
  statusColor: SellerStatusColor;
};

const DEFAULT_SELLERS: Seller[] = [
  { id: "s1", firstName: "Michael", lastName: "Johnson", phoneNumber: "+27 82 111 2233", location: "Sandton, Johannesburg", propertyType: "House", estimatedValue: "R3.2M", isContacted: true, isDiscarded: false, statusColor: "green" },
  { id: "s2", firstName: "Sarah", lastName: "Williams", phoneNumber: "+27 73 222 3344", location: "Fourways, Johannesburg", propertyType: "Townhouse", estimatedValue: "R2.8M", isContacted: false, isDiscarded: false, statusColor: "white" },
  { id: "s3", firstName: "David", lastName: "Brown", phoneNumber: "+27 64 333 4455", location: "Midrand, Gauteng", propertyType: "Apartment", estimatedValue: "R1.5M", isContacted: true, isDiscarded: false, statusColor: "green" },
  { id: "s4", firstName: "Michelle", lastName: "Davis", phoneNumber: "+27 71 444 5566", location: "Centurion, Pretoria", propertyType: "House", estimatedValue: "R4.1M", isContacted: false, isDiscarded: false, statusColor: "white" },
  { id: "s5", firstName: "James", lastName: "Wilson", phoneNumber: "+27 76 555 6677", location: "Durbanville, Cape Town", propertyType: "Luxury Villa", estimatedValue: "R7.5M", isContacted: false, isDiscarded: false, statusColor: "white" },
  { id: "s6", firstName: "Linda", lastName: "Taylor", phoneNumber: "+27 82 666 7788", location: "Bedfordview, Johannesburg", propertyType: "Apartment", estimatedValue: "R2.2M", isContacted: true, isDiscarded: false, statusColor: "green" },
  { id: "s7", firstName: "Robert", lastName: "Anderson", phoneNumber: "+27 74 777 8899", location: "Sunninghill, Johannesburg", propertyType: "House", estimatedValue: "R5.9M", isContacted: false, isDiscarded: false, statusColor: "white" },
];

export function getSellers(): Seller[] {
  const raw = getItem<Seller[]>("hlumisa_sellers", DEFAULT_SELLERS);
  return raw.map((s) => ({ ...s, statusColor: s.statusColor ?? "white" }));
}

export function saveSellers(sellers: Seller[]) {
  setItem("hlumisa_sellers", sellers);
}

export function addSeller(seller: Seller) {
  const current = getSellers();
  current.unshift(seller);
  saveSellers(current);
}

export function deleteSeller(id: string) {
  const current = getSellers();
  saveSellers(current.filter((s) => s.id !== id));
}

export function toggleSellerDiscarded(id: string) {
  const current = getSellers();
  saveSellers(current.map((s) => (s.id === id ? { ...s, isDiscarded: !s.isDiscarded } : s)));
}

export function cycleSellerStatusColor(id: string) {
  const current = getSellers();
  const nextColor: Record<SellerStatusColor, SellerStatusColor> = {
    white: "red",
    red: "green",
    green: "white",
  };
  saveSellers(current.map((s) => (s.id === id ? { ...s, statusColor: nextColor[s.statusColor] } : s)));
}

/* ─── Demo Houses (local-only) ─── */

export type PropertyStatus = "on-market" | "under-offer" | "sold";

export type DemoHouse = {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[]; // base64 data URLs
  dateAdded: string;
  status: PropertyStatus;
  sellerName: string;
};

const DEFAULT_HOUSES: DemoHouse[] = [
  {
    id: "h1",
    title: "Modern Family Home in Sandton",
    description: "A beautiful 4-bedroom home with a pool, double garage, and open-plan living area in a sought-after Sandton neighbourhood.",
    price: 4500000,
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3ESandton Home%3C/text%3E%3C/svg%3E",
    ],
    dateAdded: "2026-06-20",
    status: "on-market",
    sellerName: "Michael Johnson",
  },
  {
    id: "h2",
    title: "Luxury Penthouse – Umhlanga Ridge",
    description: "Stunning 3-bedroom penthouse with ocean views, rooftop terrace, and premium finishes. Access to gym and 24-hour security.",
    price: 6200000,
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3EUmhlanga Penthouse%3C/text%3E%3C/svg%3E",
    ],
    dateAdded: "2026-06-18",
    status: "under-offer",
    sellerName: "Sarah Williams",
  },
  {
    id: "h3",
    title: "Cosy Cottage in Franschhoek",
    description: "Charming 2-bedroom cottage nestled in the Franschhoek valley. Perfect holiday getaway or retirement home. Vineyard views.",
    price: 1850000,
    images: [
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3EFranschhoek Cottage%3C/text%3E%3C/svg%3E",
    ],
    dateAdded: "2026-06-15",
    status: "sold",
    sellerName: "David Brown",
  },
];

export function getDemoHouses(): DemoHouse[] {
  return getItem<DemoHouse[]>("hlumisa_demo_houses", DEFAULT_HOUSES);
}

export function saveDemoHouses(houses: DemoHouse[]) {
  setItem("hlumisa_demo_houses", houses);
}

export function addDemoHouse(house: DemoHouse) {
  const current = getDemoHouses();
  current.unshift(house);
  saveDemoHouses(current);
}

export function deleteDemoHouse(id: string) {
  const current = getDemoHouses();
  saveDemoHouses(current.filter((h) => h.id !== id));
}

export function updateHouseStatus(id: string, status: PropertyStatus) {
  const current = getDemoHouses();
  const updated = current.map((h) => (h.id === id ? { ...h, status } : h));
  saveDemoHouses(updated);
}

export function updateDemoHouse(id: string, updates: Partial<Omit<DemoHouse, "id" | "images" | "dateAdded">>) {
  const current = getDemoHouses();
  const updated = current.map((h) => (h.id === id ? { ...h, ...updates } : h));
  saveDemoHouses(updated);
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(amount);
}