module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/localData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addBuyer",
    ()=>addBuyer,
    "addDemoHouse",
    ()=>addDemoHouse,
    "addReferral",
    ()=>addReferral,
    "addSeller",
    ()=>addSeller,
    "cycleSellerStatusColor",
    ()=>cycleSellerStatusColor,
    "deleteBuyer",
    ()=>deleteBuyer,
    "deleteDemoHouse",
    ()=>deleteDemoHouse,
    "deleteReferral",
    ()=>deleteReferral,
    "deleteSeller",
    ()=>deleteSeller,
    "formatMoney",
    ()=>formatMoney,
    "getBuyers",
    ()=>getBuyers,
    "getDemoHouses",
    ()=>getDemoHouses,
    "getProfilePicture",
    ()=>getProfilePicture,
    "getReferrals",
    ()=>getReferrals,
    "getSellers",
    ()=>getSellers,
    "saveBuyers",
    ()=>saveBuyers,
    "saveDemoHouses",
    ()=>saveDemoHouses,
    "saveProfilePicture",
    ()=>saveProfilePicture,
    "saveReferrals",
    ()=>saveReferrals,
    "saveSellers",
    ()=>saveSellers,
    "toggleBuyerDiscarded",
    ()=>toggleBuyerDiscarded,
    "toggleReferralDiscarded",
    ()=>toggleReferralDiscarded,
    "toggleSellerDiscarded",
    ()=>toggleSellerDiscarded,
    "updateDemoHouse",
    ()=>updateDemoHouse,
    "updateHouseStatus",
    ()=>updateHouseStatus
]);
// Demo data store — backed by localStorage for profile picture and demo referrals/houses
function getItem(key, fallback) {
    if ("TURBOPACK compile-time truthy", 1) return fallback;
    //TURBOPACK unreachable
    ;
}
function setItem(key, value) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
}
function getProfilePicture() {
    return getItem("hlumisa_profile_picture", null);
}
function saveProfilePicture(pic) {
    setItem("hlumisa_profile_picture", pic);
}
const DEFAULT_REFERRALS = [
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
        isDiscarded: false
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
        isDiscarded: false
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
        isDiscarded: false
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
        isDiscarded: false
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
        isDiscarded: false
    }
];
function getReferrals() {
    return getItem("hlumisa_referrals", DEFAULT_REFERRALS);
}
function saveReferrals(refs) {
    setItem("hlumisa_referrals", refs);
}
function addReferral(r) {
    const current = getReferrals();
    current.unshift(r);
    saveReferrals(current);
}
function deleteReferral(id) {
    const current = getReferrals();
    saveReferrals(current.filter((ref)=>ref.id !== id));
}
function toggleReferralDiscarded(id) {
    const current = getReferrals();
    saveReferrals(current.map((ref)=>ref.id === id ? {
            ...ref,
            isDiscarded: !ref.isDiscarded
        } : ref));
}
const DEFAULT_BUYERS = [
    {
        id: "b1",
        firstName: "Thabo",
        lastName: "Mokoena",
        phoneNumber: "+27 82 123 4567",
        location: "Sandton, Johannesburg",
        budget: "R2.5M - R3.5M",
        propertyType: "Apartment",
        isContacted: true,
        isDiscarded: false
    },
    {
        id: "b2",
        firstName: "Lerato",
        lastName: "Ndlovu",
        phoneNumber: "+27 73 234 5678",
        location: "Fourways, Johannesburg",
        budget: "R4M - R5.5M",
        propertyType: "House",
        isContacted: false,
        isDiscarded: false
    },
    {
        id: "b3",
        firstName: "Sipho",
        lastName: "Zulu",
        phoneNumber: "+27 64 345 6789",
        location: "Midrand, Gauteng",
        budget: "R1.8M - R2.2M",
        propertyType: "Townhouse",
        isContacted: true,
        isDiscarded: false
    },
    {
        id: "b4",
        firstName: "Nomvula",
        lastName: "Dlamini",
        phoneNumber: "+27 71 456 7890",
        location: "Centurion, Pretoria",
        budget: "R3M - R4M",
        propertyType: "House",
        isContacted: false,
        isDiscarded: false
    },
    {
        id: "b5",
        firstName: "Bongani",
        lastName: "Khumalo",
        phoneNumber: "+27 76 567 8901",
        location: "Durbanville, Cape Town",
        budget: "R6M - R8M",
        propertyType: "Luxury Villa",
        isContacted: false,
        isDiscarded: false
    },
    {
        id: "b6",
        firstName: "Zanele",
        lastName: "Mthembu",
        phoneNumber: "+27 82 678 9012",
        location: "Bedfordview, Johannesburg",
        budget: "R2M - R3M",
        propertyType: "Apartment",
        isContacted: true,
        isDiscarded: false
    },
    {
        id: "b7",
        firstName: "Kagiso",
        lastName: "Motaung",
        phoneNumber: "+27 74 789 0123",
        location: "Sunninghill, Johannesburg",
        budget: "R5M - R7M",
        propertyType: "House",
        isContacted: false,
        isDiscarded: false
    },
    {
        id: "b8",
        firstName: "Precious",
        lastName: "Ngcobo",
        phoneNumber: "+27 63 890 1234",
        location: "Umhlanga, Durban",
        budget: "R3.5M - R4.5M",
        propertyType: "Apartment",
        isContacted: false,
        isDiscarded: false
    }
];
function getBuyers() {
    return getItem("hlumisa_buyers", DEFAULT_BUYERS);
}
function saveBuyers(buyers) {
    setItem("hlumisa_buyers", buyers);
}
function addBuyer(buyer) {
    const current = getBuyers();
    current.unshift(buyer);
    saveBuyers(current);
}
function deleteBuyer(id) {
    const current = getBuyers();
    saveBuyers(current.filter((b)=>b.id !== id));
}
function toggleBuyerDiscarded(id) {
    const current = getBuyers();
    saveBuyers(current.map((b)=>b.id === id ? {
            ...b,
            isDiscarded: !b.isDiscarded
        } : b));
}
const DEFAULT_SELLERS = [
    {
        id: "s1",
        firstName: "Michael",
        lastName: "Johnson",
        phoneNumber: "+27 82 111 2233",
        location: "Sandton, Johannesburg",
        propertyType: "House",
        estimatedValue: "R3.2M",
        isContacted: true,
        isDiscarded: false,
        statusColor: "green"
    },
    {
        id: "s2",
        firstName: "Sarah",
        lastName: "Williams",
        phoneNumber: "+27 73 222 3344",
        location: "Fourways, Johannesburg",
        propertyType: "Townhouse",
        estimatedValue: "R2.8M",
        isContacted: false,
        isDiscarded: false,
        statusColor: "white"
    },
    {
        id: "s3",
        firstName: "David",
        lastName: "Brown",
        phoneNumber: "+27 64 333 4455",
        location: "Midrand, Gauteng",
        propertyType: "Apartment",
        estimatedValue: "R1.5M",
        isContacted: true,
        isDiscarded: false,
        statusColor: "green"
    },
    {
        id: "s4",
        firstName: "Michelle",
        lastName: "Davis",
        phoneNumber: "+27 71 444 5566",
        location: "Centurion, Pretoria",
        propertyType: "House",
        estimatedValue: "R4.1M",
        isContacted: false,
        isDiscarded: false,
        statusColor: "white"
    },
    {
        id: "s5",
        firstName: "James",
        lastName: "Wilson",
        phoneNumber: "+27 76 555 6677",
        location: "Durbanville, Cape Town",
        propertyType: "Luxury Villa",
        estimatedValue: "R7.5M",
        isContacted: false,
        isDiscarded: false,
        statusColor: "white"
    },
    {
        id: "s6",
        firstName: "Linda",
        lastName: "Taylor",
        phoneNumber: "+27 82 666 7788",
        location: "Bedfordview, Johannesburg",
        propertyType: "Apartment",
        estimatedValue: "R2.2M",
        isContacted: true,
        isDiscarded: false,
        statusColor: "green"
    },
    {
        id: "s7",
        firstName: "Robert",
        lastName: "Anderson",
        phoneNumber: "+27 74 777 8899",
        location: "Sunninghill, Johannesburg",
        propertyType: "House",
        estimatedValue: "R5.9M",
        isContacted: false,
        isDiscarded: false,
        statusColor: "white"
    }
];
function getSellers() {
    const raw = getItem("hlumisa_sellers", DEFAULT_SELLERS);
    return raw.map((s)=>({
            ...s,
            statusColor: s.statusColor ?? "white"
        }));
}
function saveSellers(sellers) {
    setItem("hlumisa_sellers", sellers);
}
function addSeller(seller) {
    const current = getSellers();
    current.unshift(seller);
    saveSellers(current);
}
function deleteSeller(id) {
    const current = getSellers();
    saveSellers(current.filter((s)=>s.id !== id));
}
function toggleSellerDiscarded(id) {
    const current = getSellers();
    saveSellers(current.map((s)=>s.id === id ? {
            ...s,
            isDiscarded: !s.isDiscarded
        } : s));
}
function cycleSellerStatusColor(id) {
    const current = getSellers();
    const nextColor = {
        white: "red",
        red: "green",
        green: "white"
    };
    saveSellers(current.map((s)=>s.id === id ? {
            ...s,
            statusColor: nextColor[s.statusColor]
        } : s));
}
const DEFAULT_HOUSES = [
    {
        id: "h1",
        title: "Modern Family Home in Sandton",
        description: "A beautiful 4-bedroom home with a pool, double garage, and open-plan living area in a sought-after Sandton neighbourhood.",
        price: 4500000,
        images: [
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3ESandton Home%3C/text%3E%3C/svg%3E"
        ],
        dateAdded: "2026-06-20",
        status: "on-market",
        sellerName: "Michael Johnson"
    },
    {
        id: "h2",
        title: "Luxury Penthouse – Umhlanga Ridge",
        description: "Stunning 3-bedroom penthouse with ocean views, rooftop terrace, and premium finishes. Access to gym and 24-hour security.",
        price: 6200000,
        images: [
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3EUmhlanga Penthouse%3C/text%3E%3C/svg%3E"
        ],
        dateAdded: "2026-06-18",
        status: "under-offer",
        sellerName: "Sarah Williams"
    },
    {
        id: "h3",
        title: "Cosy Cottage in Franschhoek",
        description: "Charming 2-bedroom cottage nestled in the Franschhoek valley. Perfect holiday getaway or retirement home. Vineyard views.",
        price: 1850000,
        images: [
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect width='400' height='260' fill='%232a241a'/%3E%3Ctext x='200' y='130' text-anchor='middle' fill='%23d4b373' font-size='18' font-family='sans-serif'%3EFranschhoek Cottage%3C/text%3E%3C/svg%3E"
        ],
        dateAdded: "2026-06-15",
        status: "sold",
        sellerName: "David Brown"
    }
];
function getDemoHouses() {
    return getItem("hlumisa_demo_houses", DEFAULT_HOUSES);
}
function saveDemoHouses(houses) {
    setItem("hlumisa_demo_houses", houses);
}
function addDemoHouse(house) {
    const current = getDemoHouses();
    current.unshift(house);
    saveDemoHouses(current);
}
function deleteDemoHouse(id) {
    const current = getDemoHouses();
    saveDemoHouses(current.filter((h)=>h.id !== id));
}
function updateHouseStatus(id, status) {
    const current = getDemoHouses();
    const updated = current.map((h)=>h.id === id ? {
            ...h,
            status
        } : h);
    saveDemoHouses(updated);
}
function updateDemoHouse(id, updates) {
    const current = getDemoHouses();
    const updated = current.map((h)=>h.id === id ? {
            ...h,
            ...updates
        } : h);
    saveDemoHouses(updated);
}
function formatMoney(amount) {
    return new Intl.NumberFormat("en-ZA", {
        style: "currency",
        currency: "ZAR",
        maximumFractionDigits: 0
    }).format(amount);
}
}),
"[project]/src/components/Sidebar.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Sidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/localData.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
const navItems = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: "◉"
    },
    {
        label: "Referrals",
        href: "/admin/referrals",
        icon: "◎"
    },
    {
        label: "Properties",
        href: "/admin/properties",
        icon: "◆"
    },
    {
        label: "Books",
        href: "/admin/books",
        icon: "📓"
    },
    {
        label: "Books Understanding",
        href: "/admin/books/understanding",
        icon: "📖"
    }
];
function Sidebar() {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const [profilePic, setProfilePic] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const pic = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$localData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getProfilePicture"])();
        if (pic) setProfilePic(pic.dataUrl);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: "fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-[#0a0a08] backdrop-blur-xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 border-b border-white/10 px-6 py-6",
                children: [
                    profilePic ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: profilePic,
                        alt: "Profile",
                        className: "h-10 w-10 rounded-xl object-cover"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 29,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-sm font-bold text-stone-950",
                        children: "HP"
                    }, void 0, false, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 35,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-white",
                                children: "Hlumisa Properties"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 40,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-stone-400",
                                children: "Admin Dashboard"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Sidebar.tsx",
                lineNumber: 27,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                className: "flex-1 space-y-1 px-4 py-6",
                children: navItems.map((item)=>{
                    const isActive = pathname === item.href || item.href !== "/admin/dashboard" && pathname.startsWith(item.href);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? "bg-amber-200/10 text-amber-200 font-semibold" : "text-stone-400 hover:text-white hover:bg-white/5"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: item.icon
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 58,
                                columnNumber: 15
                            }, this),
                            item.label
                        ]
                    }, item.href, true, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/src/components/Sidebar.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-white/10 px-6 py-4 space-y-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/admin/settings",
                        className: "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "⚙"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            "Settings"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 66,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/admin",
                        className: "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-400 transition hover:text-white hover:bg-white/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "◀"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 77,
                                columnNumber: 11
                            }, this),
                            "Back to profile"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/admin/login",
                        className: "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-500 transition hover:text-white hover:bg-white/5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-lg",
                                children: "↩"
                            }, void 0, false, {
                                fileName: "[project]/src/components/Sidebar.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            "Sign out"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Sidebar.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Sidebar.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Sidebar.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/SidebarProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SidebarProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/Sidebar.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function SidebarProvider({ children }) {
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const isProfilePage = pathname === "/admin";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-full",
        children: [
            !isProfilePage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$Sidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/src/components/SidebarProvider.tsx",
                lineNumber: 12,
                columnNumber: 26
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: `flex-1 min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,214,153,0.18),transparent_24%),linear-gradient(180deg,#12100e_0%,#070707_48%,#050505_100%)] p-8 ${!isProfilePage ? "ml-64" : ""}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/SidebarProvider.tsx",
                lineNumber: 13,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/SidebarProvider.tsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__20nuwtr._.js.map