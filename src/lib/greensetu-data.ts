/* GreenSetu seed data — clearly labeled DEMO / SAMPLE MARKET DATA everywhere it renders. */

export type MaterialDef = {
  key: string;
  emoji: string;
  color: string;
  labelEn: string;
  labelHi: string;
  labelMr: string;
  category: string;
  unit: string;
  basePrice: number;
  trendPct: number;
  priceMin: number;
  priceMax: number;
  priceHistory: number[];
  demo: boolean;
};

/** Price history = last 30 days (oldest → newest, ₹/KG) */
export const MATERIALS: MaterialDef[] = [
  {
    key: "pcb_high_grade",
    emoji: "🟩",
    color: "#22A447",
    labelEn: "High Grade PCB",
    labelHi: "उच्च ग्रेड पीसीबी",
    labelMr: "उच्च दर्जा पीसीबी",
    category: "PCB",
    unit: "KG",
    basePrice: 850,
    trendPct: 2,
    priceMin: 790,
    priceMax: 890,
    priceHistory: [805, 810, 808, 815, 820, 818, 824, 830, 826, 835, 840, 838, 845, 850],
    demo: true,
  },
  {
    key: "pcb_low_grade",
    emoji: "🟫",
    color: "#8BC34A",
    labelEn: "Low Grade PCB",
    labelHi: "लो ग्रेड पीसीबी",
    labelMr: "कमी दर्जा पीसीबी",
    category: "PCB",
    unit: "KG",
    basePrice: 220,
    trendPct: 1,
    priceMin: 200,
    priceMax: 245,
    priceHistory: [210, 212, 211, 214, 213, 215, 214, 216, 215, 217, 218, 217, 219, 220],
    demo: true,
  },
  {
    key: "copper_cable",
    emoji: "🔌",
    color: "#C2703D",
    labelEn: "Copper Cable",
    labelHi: "कॉपर केबल",
    labelMr: "कॉपर केबल",
    category: "Cables",
    unit: "KG",
    basePrice: 450,
    trendPct: 5,
    priceMin: 420,
    priceMax: 480,
    priceHistory: [415, 420, 418, 425, 430, 428, 435, 440, 438, 442, 445, 443, 447, 450],
    demo: true,
  },
  {
    key: "lithium_battery",
    emoji: "🔋",
    color: "#4A6FA5",
    labelEn: "Lithium Battery",
    labelHi: "लिथियम बैटरी",
    labelMr: "लिथियम बॅटरी",
    category: "Batteries",
    unit: "KG",
    basePrice: 120,
    trendPct: -3,
    priceMin: 105,
    priceMax: 140,
    priceHistory: [138, 136, 134, 135, 132, 130, 131, 128, 127, 125, 124, 122, 121, 120],
    demo: true,
  },
  {
    key: "electric_motor",
    emoji: "⚙️",
    color: "#6B7280",
    labelEn: "Electric Motor",
    labelHi: "इलेक्ट्रिक मोटर",
    labelMr: "इलेक्ट्रिक मोटर",
    category: "Motors",
    unit: "KG",
    basePrice: 180,
    trendPct: 4,
    priceMin: 165,
    priceMax: 195,
    priceHistory: [165, 167, 166, 169, 170, 172, 171, 174, 175, 176, 175, 177, 178, 180],
    demo: true,
  },
  {
    key: "lcd_screen",
    emoji: "🖥️",
    color: "#5B8DEF",
    labelEn: "LCD / Screen",
    labelHi: "एलसीडी / स्क्रीन",
    labelMr: "एलसीडी / स्क्रीन",
    category: "Screens",
    unit: "KG",
    basePrice: 95,
    trendPct: 0,
    priceMin: 80,
    priceMax: 110,
    priceHistory: [94, 95, 94, 96, 95, 94, 95, 96, 95, 94, 95, 95, 94, 95],
    demo: true,
  },
  {
    key: "magnet",
    emoji: "🧲",
    color: "#8B5CF6",
    labelEn: "Speaker Magnet",
    labelHi: "स्पीकर मैग्नेट",
    labelMr: "स्पीकर मॅग्नेट",
    category: "Magnets",
    unit: "KG",
    basePrice: 160,
    trendPct: 2,
    priceMin: 145,
    priceMax: 175,
    priceHistory: [152, 153, 152, 154, 155, 154, 156, 155, 157, 156, 158, 157, 159, 160],
    demo: true,
  },
  {
    key: "computer",
    emoji: "💻",
    color: "#374151",
    labelEn: "Computers / Laptop",
    labelHi: "कंप्यूटर / लैपटॉप",
    labelMr: "संगणक / लॅपटॉप",
    category: "Computers",
    unit: "KG",
    basePrice: 140,
    trendPct: 1,
    priceMin: 125,
    priceMax: 160,
    priceHistory: [134, 135, 134, 136, 135, 137, 136, 138, 137, 139, 138, 140, 139, 140],
    demo: true,
  },
  {
    key: "mobile",
    emoji: "📱",
    color: "#0EA5E9",
    labelEn: "Mobile Handset",
    labelHi: "मोबाइल हैंडसेट",
    labelMr: "मोबाईल हॅन्डसेट",
    category: "Mobiles",
    unit: "KG",
    basePrice: 310,
    trendPct: 3,
    priceMin: 280,
    priceMax: 340,
    priceHistory: [290, 292, 291, 294, 296, 295, 298, 300, 299, 302, 304, 305, 307, 310],
    demo: true,
  },
  {
    key: "plastic",
    emoji: "♻️",
    color: "#14B8A6",
    labelEn: "E-Plastic",
    labelHi: "ई-प्लास्टिक",
    labelMr: "ई-प्लास्टिक",
    category: "Plastic",
    unit: "KG",
    basePrice: 45,
    trendPct: -1,
    priceMin: 38,
    priceMax: 55,
    priceHistory: [47, 46, 47, 46, 45, 46, 45, 44, 45, 44, 45, 44, 45, 45],
    demo: true,
  },
];

/* ─────────────────────────── Recyclers ─────────────────────────── */

export type RecyclerDef = {
  name: string;
  logoEmoji: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  materialsAccepted: string[];
  rates: { material: string; rate: number }[];
  pickupAvailable: boolean;
  serviceRadiusKm: number;
  authStatus: "verified" | "pending" | "expired" | "unverified";
  authNumber: string;
  authExpiry: string;
  rating: number;
  demo: boolean;
};

const mkRates = (base: Record<string, number>) =>
  Object.entries(base).map(([material, rate]) => ({ material, rate }));

export const RECYCLERS: RecyclerDef[] = [
  {
    name: "GreenCycle Recycling Pvt Ltd",
    logoEmoji: "♻️",
    city: "Delhi",
    address: "Sector 10 Industrial Area, Dwarka, New Delhi",
    lat: 28.5921,
    lng: 77.046,
    phone: "+91 98110 22334",
    materialsAccepted: [
      "pcb_high_grade", "pcb_low_grade", "copper_cable", "lithium_battery",
      "electric_motor", "lcd_screen", "computer", "mobile", "plastic",
    ],
    rates: mkRates({
      pcb_high_grade: 870, pcb_low_grade: 225, copper_cable: 470, lithium_battery: 118,
      electric_motor: 185, lcd_screen: 96, computer: 145, mobile: 315, plastic: 46,
    }),
    pickupAvailable: true,
    serviceRadiusKm: 25,
    authStatus: "verified",
    authNumber: "CPCB-AUTH-2019-DL-0451",
    authExpiry: "2028-03-31",
    rating: 4.6,
    demo: true,
  },
  {
    name: "EcoWaste Solutions",
    logoEmoji: "🌿",
    city: "Delhi",
    address: "Bawana Industrial Estate, Phase 2, Delhi",
    lat: 28.7942,
    lng: 77.0465,
    phone: "+91 99530 44556",
    materialsAccepted: ["copper_cable", "pcb_high_grade", "electric_motor", "computer", "magnet", "plastic"],
    rates: mkRates({
      copper_cable: 450, pcb_high_grade: 850, electric_motor: 180,
      computer: 140, magnet: 160, plastic: 44,
    }),
    pickupAvailable: false,
    serviceRadiusKm: 15,
    authStatus: "verified",
    authNumber: "CPCB-AUTH-2021-DL-0738",
    authExpiry: "2027-11-30",
    rating: 4.2,
    demo: true,
  },
  {
    name: "Delhi E-Recyclers Hub",
    logoEmoji: "🏭",
    city: "Delhi",
    address: "Okhla Industrial Area Phase 3, New Delhi",
    lat: 28.5355,
    lng: 77.2715,
    phone: "+91 98100 77889",
    materialsAccepted: ["pcb_high_grade", "pcb_low_grade", "mobile", "lcd_screen", "lithium_battery", "copper_cable"],
    rates: mkRates({
      pcb_high_grade: 860, pcb_low_grade: 218, mobile: 320,
      lcd_screen: 98, lithium_battery: 122, copper_cable: 462,
    }),
    pickupAvailable: true,
    serviceRadiusKm: 30,
    authStatus: "verified",
    authNumber: "CPCB-AUTH-2020-DL-0612",
    authExpiry: "2027-06-30",
    rating: 4.4,
    demo: true,
  },
  {
    name: "Yamuna Metals Recovery",
    logoEmoji: "⚙️",
    city: "Delhi",
    address: "Wazirpur Industrial Area, Delhi",
    lat: 28.6996,
    lng: 77.1653,
    phone: "+91 98730 11224",
    materialsAccepted: ["copper_cable", "electric_motor", "magnet", "computer"],
    rates: mkRates({ copper_cable: 465, electric_motor: 190, magnet: 165, computer: 142 }),
    pickupAvailable: true,
    serviceRadiusKm: 18,
    authStatus: "pending",
    authNumber: "CPCB-APP-2026-DL-0903",
    authExpiry: "—",
    rating: 4.0,
    demo: true,
  },
  {
    name: "Noida Green Circuits",
    logoEmoji: "🟩",
    city: "Noida",
    address: "Hosiery Complex, Phase 2, Noida, UP",
    lat: 28.5245,
    lng: 77.3568,
    phone: "+91 97110 33445",
    materialsAccepted: ["pcb_high_grade", "pcb_low_grade", "mobile", "lithium_battery", "computer", "lcd_screen"],
    rates: mkRates({
      pcb_high_grade: 880, pcb_low_grade: 228, mobile: 318,
      lithium_battery: 125, computer: 148, lcd_screen: 97,
    }),
    pickupAvailable: true,
    serviceRadiusKm: 35,
    authStatus: "verified",
    authNumber: "UPPCB-AUTH-2022-GB-0188",
    authExpiry: "2029-01-31",
    rating: 4.7,
    demo: true,
  },
  {
    name: "Gurgaon Ecoware Recyclers",
    logoEmoji: "🔋",
    city: "Gurgaon",
    address: "Udyog Vihar Phase 4, Gurugram, Haryana",
    lat: 28.5045,
    lng: 77.0903,
    phone: "+91 98180 55667",
    materialsAccepted: ["lithium_battery", "copper_cable", "electric_motor", "computer", "mobile", "plastic"],
    rates: mkRates({
      lithium_battery: 128, copper_cable: 455, electric_motor: 182,
      computer: 143, mobile: 312, plastic: 47,
    }),
    pickupAvailable: true,
    serviceRadiusKm: 40,
    authStatus: "expired",
    authNumber: "HRPCB-AUTH-2018-GG-0244",
    authExpiry: "2025-12-31",
    rating: 3.8,
    demo: true,
  },
];

/* ─────────────────────────── Safety content ─────────────────────────── */

export type SafetyDef = {
  key: string;
  emoji: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  textEn: string;
  textHi: string;
  textMr: string;
};

export const SAFETY: SafetyDef[] = [
  {
    key: "no_burn",
    emoji: "🔥",
    titleEn: "Don't Burn Cables",
    titleHi: "केबल मत जलाएँ",
    titleMr: "केबल जाळू नका",
    textEn: "Burning cables releases dangerous toxic smoke. Hand them to an authorized recycler instead.",
    textHi: "केबल जलाने से जहरीला धुआँ निकलता है। इन्हें अधिकृत रिसाइकलर को दें।",
    textMr: "केबल जाळल्याने विषारी धूर निघतो. ते अधिकृत रिसायकलरला द्या.",
  },
  {
    key: "no_acid",
    emoji: "☠️",
    titleEn: "Don't Use Acid",
    titleHi: "तेज़ाब मत उपयोग करें",
    titleMr: "आम्ल वापरू नका",
    textEn: "Acid extraction is dangerous and illegal. It can burn skin and poison water.",
    textHi: "तेज़ाब से धातु निकालना खतरनाक और गैरकानूनी है। यह त्वचा जला सकता है और पानी दूषित करता है।",
    textMr: "आम्लाने धातू काढणे धोकादायक व बेकायदेशीर आहे. त्वचा भाजू शकते व पाणी दूषित होते.",
  },
  {
    key: "no_puncture",
    emoji: "🔋",
    titleEn: "Don't Puncture Batteries",
    titleHi: "बैटरी में छेद मत करें",
    titleMr: "बॅटरीला छिद्र पाडू नका",
    textEn: "Lithium batteries can catch fire if punctured. Store them dry and cool, and sell them whole.",
    textHi: "लिथियम बैटरी में छेद करने से आग लग सकती है। इन्हें सूखा और ठंडा रखें और पूरी बेचें।",
    textMr: "लिथियम बॅटरीला छिद्र पाडल्यास आग लागू शकते. त्या कोरड्या व थंड ठेवा आणि संपूर्ण विका.",
  },
  {
    key: "crt_care",
    emoji: "📺",
    titleEn: "Handle CRT Carefully",
    titleHi: "सीआरटी सावधानी से संभालें",
    titleMr: "सीआरटी काळजीपूर्वक हाताळा",
    textEn: "Old TV glass (CRT) can implode and contain lead. Do not break it — hand it over intact.",
    textHi: "पुराने टीवी का कांच (सीआरटी) विस्फोटित हो सकता है और उसमें सीसा होता है। इसे न तोड़ें, सौंप दें।",
    textMr: "जुन्या टीव्हीचे काच (सीआरटी) स्फोटू शकते व त्यात शिसे असते. ते तोडू नका, सुपूर्द करा.",
  },
  {
    key: "gloves",
    emoji: "🧤",
    titleEn: "Wear Gloves",
    titleHi: "दस्ताने पहनें",
    titleMr: "हातमोजे घाला",
    textEn: "Sharp edges on PCBs and metal can cut. Wear gloves when sorting scrap.",
    textHi: "पीसीबी और धातु के तीखे किनारे काट सकते हैं। कबाड़ छँटाई में दस्ताने पहनें।",
    textMr: "पीसीबी व धातूच्या धारदार कडा चटका शकतात. स्क्रॅप विवियताना हातमोजे घाला.",
  },
  {
    key: "dust_mask",
    emoji: "😷",
    titleEn: "Cover Your Nose",
    titleHi: "नाक ढकें",
    titleMr: "नाक झाका",
    textEn: "Dust from old devices harms the lungs. Wear a mask when breaking down electronics.",
    textHi: "पुराने उपकरणों की धूल फेफड़ों को नुकसान पहुँचाती है। इलेक्ट्रॉनिक्स तोड़ते समय मास्क पहनें।",
    textMr: "जुन्या उपकरणांची धूळ फुफ्फुसांना हानी करते. इलेक्ट्रॉनिक्स तोडताना मास्क घाला.",
  },
];

/* ─────────────────────────── Lots / users / misc ─────────────────────────── */

export const CITIES = ["Delhi", "Noida", "Gurgaon"] as const;

export const RECYCLER_MATCH_WEIGHTS = {
  authorization: 0.35,
  price: 0.3,
  distance: 0.15,
  pickup: 0.1,
  material: 0.1,
};

/** haversine distance in KM */
export function haversineKm(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export const DEMO_COLLECTOR_HOME = {
  lat: 28.6139,
  lng: 77.209,
  label: "New Delhi",
  city: "Delhi",
};
