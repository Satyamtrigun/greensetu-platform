import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "hi" | "mr";

export const LANGS: { code: Lang; label: string; voiceLabel: string }[] = [
  { code: "en", label: "English", voiceLabel: "en-IN" },
  { code: "hi", label: "हिंदी", voiceLabel: "hi-IN" },
  { code: "mr", label: "मराठी", voiceLabel: "mr-IN" },
];

type Dict = Record<string, string>;

const en: Dict = {
  "nav.how": "How It Works",
  "nav.prices": "Prices",
  "nav.map": "Recyclers",
  "nav.safety": "Safety",
  "nav.partners": "Partners",
  "nav.contact": "Contact",
  "nav.start": "Start Selling Scrap",
  "nav.findRecycler": "Find Authorized Recycler",
  "nav.dashboard": "Open App",
  "nav.about": "About",

  "hero.badge": "कबाड़ी से अधिकृत रिसाइकलर तक का डिजिटल सेतु",
  "hero.sub":
    "GreenSetu connects informal e-waste collectors directly with authorized recyclers, helping them discover fair prices, sell materials safely, and build a transparent transaction history.",
  "hero.seeHow": "See How It Works",

  "flow.title": "How GreenSetu Works",
  "flow.sub": "From junk to fair payment in six simple steps.",
  "flow.s1": "Take a Photo",
  "flow.s1d": "Collector photographs the e-waste at their shop or home.",
  "flow.s2": "Identify Material",
  "flow.s2d": "AI suggests the material category — confirm or pick manually.",
  "flow.s3": "Check Fair Price",
  "flow.s3d": "See current market price and estimated value instantly.",
  "flow.s4": "Find Nearby Recyclers",
  "flow.s4d": "Compare authorized recyclers by price, distance and pickup.",
  "flow.s5": "Sell & Handover",
  "flow.s5d": "Generate a secure QR-based handover record.",
  "flow.s6": "Get Paid",
  "flow.s6d": "Track cash or digital payment to completion.",

  "prices.title": "Today's E-Waste Prices",
  "prices.sub": "Live rates from recyclers across the network",
  "prices.listen": "Listen to Prices",
  "prices.stop": "Stop",
  "prices.demo": "Demo / Sample Market Data",
  "prices.kg": "/ KG",

  "map.title": "Authorized Recyclers Near You",
  "map.sub": "Verified facilities, offered rates and pickup availability",
  "map.details": "VIEW DETAILS",
  "map.you": "You are here",
  "map.fallback": "Map preview unavailable",
  "map.openMap": "Open Map",

  "eco.title": "Earn More with GreenSetu",
  "eco.sub": "The same material, routed the smart way.",
  "eco.traditional": "Traditional Route",
  "eco.greensetu": "GreenSetu Route",
  "eco.materialValue": "Material Value",
  "eco.middlemanLoss": "Middleman Loss",
  "eco.travel": "Travel",
  "eco.platformFee": "Platform Fee",
  "eco.final": "Final Earnings",
  "eco.additional": "Additional Earnings with GreenSetu",

  "partners.title": "Partners & Ecosystem",
  "partners.sub": "Building the formal e-waste bridge together",

  "safety.title": "Stay Safe",
  "safety.sub": "Simple rules that protect your health — listen in your language.",
  "safety.listen": "Listen",

  "contact.title": "Get In Touch",
  "contact.sub": "Partner with GreenSetu, become an authorized recycler, or join as a collector.",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.msg": "Message",
  "contact.send": "Send Enquiry",
  "contact.sent": "Enquiry noted — our team will reach out (demo).",
  "contact.recycler": "Become an Authorized Recycler",
  "contact.collector": "Join as a Collector",

  "foot.tag": "Sell Smart. Earn Fair. Recycle Right.",
  "foot.msg": "Building a cleaner and more transparent e-waste ecosystem for India.",
  "foot.privacy": "Privacy",

  "demo.data": "Demo Data",
  "app.title": "GreenSetu App",
  "sell.title": "Sell Scrap",
  "common.cancel": "Cancel",
  "common.next": "Next",
  "common.back": "Back",
  "common.confirm": "Confirm",
  "common.offline": "Offline — changes will sync later",
  "common.syncing": "Syncing GreenSetu Data...",
  "common.synced": "Synced",
};

const hi: Dict = {
  "nav.how": "कैसे काम करता है",
  "nav.prices": "भाव",
  "nav.map": "रिसाइकलर",
  "nav.safety": "सुरक्षा",
  "nav.partners": "साझेदार",
  "nav.contact": "संपर्क",
  "nav.start": "कबाड़ बेचें",
  "nav.findRecycler": "अधिकृत रिसाइकलर खोजें",
  "nav.dashboard": "ऐप खोलें",
  "nav.about": "हमारे बारे में",

  "hero.badge": "कबाड़ी से अधिकृत रिसाइकलर तक का डिजिटल सेतु",
  "hero.sub":
    "GreenSetu अनौपचारिक ई-वेस्ट संग्रहकर्ताओं को सीधे अधिकृत रिसाइकलर से जोड़ता है — उचित भाव, सुरक्षित बिक्री और पारदर्शी लेन-देन का इतिहास।",
  "hero.seeHow": "देखें कैसे काम करता है",

  "flow.title": "GreenSetu कैसे काम करता है",
  "flow.sub": "कबाड़ से उचित भुगतान तक — छह आसान कदम।",
  "flow.s1": "फोटो लें",
  "flow.s1d": "संग्रहकर्ता ई-वेस्ट की फोटो खींचता है।",
  "flow.s2": "सामग्री पहचानें",
  "flow.s2d": "AI सामग्री की श्रेणी सुझाता है — पुष्टि करें या चुनें।",
  "flow.s3": "उचित भाव देखें",
  "flow.s3d": "मौजूदा बाज़ार भाव और अनुमानित कीमत तुरंत देखें।",
  "flow.s4": "नज़दीकी रिसाइकलर खोजें",
  "flow.s4d": "भाव, दूरी और पिकअप के आधार पर तुलना करें।",
  "flow.s5": "बेचें और सौंपें",
  "flow.s5d": "सुरक्षित QR आधारित हैंडओवर रिकॉर्ड बनाएं।",
  "flow.s6": "भुगतान पाएं",
  "flow.s6d": "नकद या डिजिटल भुगतान की स्थिति देखें।",

  "prices.title": "आज के ई-वेस्ट भाव",
  "prices.sub": "नेटवर्क के रिसाइकलर से ताज़ा दरें",
  "prices.listen": "भाव सुनें",
  "prices.stop": "रोकें",
  "prices.demo": "डेमो / नमूना बाज़ार डेटा",
  "prices.kg": "/ किलो",

  "map.title": "आपके पास के अधिकृत रिसाइकलर",
  "map.sub": "सत्यापित सुविधाएँ, दरें और पिकअप उपलब्धता",
  "map.details": "विवरण देखें",
  "map.you": "आप यहाँ हैं",
  "map.fallback": "नक्शा उपलब्ध नहीं",
  "map.openMap": "नक्शा खोलें",

  "eco.title": "GreenSetu से ज़्यादा कमाएँ",
  "eco.sub": "वही सामग्री, समझदार रास्ता।",
  "eco.traditional": "पारंपरिक रास्ता",
  "eco.greensetu": "GreenSetu रास्ता",
  "eco.materialValue": "सामग्री मूल्य",
  "eco.middlemanLoss": "बिचौलिया नुकसान",
  "eco.travel": "यात्रा खर्च",
  "eco.platformFee": "प्लेटफ़ॉर्म शुल्क",
  "eco.final": "अंतिम कमाई",
  "eco.additional": "GreenSetu के साथ अतिरिक्त कमाई",

  "partners.title": "साझेदार और पारिस्थितिकी",
  "partners.sub": "औपचारिक ई-वेस्ट सेतु का निर्माण साथ मिलकर",

  "safety.title": "सुरक्षित रहें",
  "safety.sub": "आपकी सेहत की रक्षा करने वाले सरल नियम — अपनी भाषा में सुनें।",
  "safety.listen": "सुनें",

  "contact.title": "संपर्क करें",
  "contact.sub": "GreenSetu से जुड़ें — रिसाइकलर बनें या संग्रहकर्ता बनें।",
  "contact.name": "नाम",
  "contact.email": "ईमेल",
  "contact.msg": "संदेश",
  "contact.send": "पूछताछ भेजें",
  "contact.sent": "पूछताछ दर्ज — हमारी टीम संपर्क करेगी (डेमो)।",
  "contact.recycler": "अधिकृत रिसाइकलर बनें",
  "contact.collector": "संग्रहकर्ता बनें",

  "foot.tag": "समझदारी से बेचें। उचित दाम पाएँ। सही रीसाइकल करें।",
  "foot.msg": "भारत के लिए एक स्वच्छ और पारदर्शी ई-वेस्ट पारिस्थितिकी तंत्र का निर्माण।",
  "foot.privacy": "गोपनीयता",

  "demo.data": "डेमो डेटा",
  "app.title": "GreenSetu ऐप",
  "sell.title": "कबाड़ बेचें",
  "common.cancel": "रद्द करें",
  "common.next": "आगे",
  "common.back": "पीछे",
  "common.confirm": "पुष्टि करें",
  "common.offline": "ऑफ़लाइन — बाद में सिंक होगा",
  "common.syncing": "GreenSetu डेटा सिंक हो रहा है...",
  "common.synced": "सिंक हो गया",
};

const mr: Dict = {
  "nav.how": "कसे कार्य करते",
  "nav.prices": "भाव",
  "nav.map": "रिसायकलर",
  "nav.safety": "सुरक्षा",
  "nav.partners": "भागीदार",
  "nav.contact": "संपर्क",
  "nav.start": "स्क्रॅप विका",
  "nav.findRecycler": "अधिकृत रिसायकलर शोधा",
  "nav.dashboard": "अ‍ॅप उघडा",
  "nav.about": "आमच्याविषयी",

  "hero.badge": "कबाडीपासून अधिकृत रिसायकलरपर्यंतचा डिजिटल सेतू",
  "hero.sub":
    "GreenSetu अनौपचारिक ई-वेस्ट संकलकांना थेट अधिकृत रिसायकलरशी जोडते — योग्य भाव, सुरक्षित विक्री आणि पारदर्शी व्यवहाराचा इतिहास.",
  "hero.seeHow": "कसे कार्य करते ते पहा",

  "flow.title": "GreenSetu कसे कार्य करते",
  "flow.sub": "कबाडीपासून योग्य देयकापर्यंत — सहा सोप्या पायऱ्या.",
  "flow.s1": "फोटो काढा",
  "flow.s1d": "संकलक ई-वेस्टचा फोटो काढतो.",
  "flow.s2": "सामग्री ओळखा",
  "flow.s2d": "AI सामग्री श्रेणी सुचवते — खात्री करा किंवा निवडा.",
  "flow.s3": "योग्य भाव पहा",
  "flow.s3d": "चालू बाजार भाव आणि अंदाजित किंमत लगेच पहा.",
  "flow.s4": "जवळचे रिसायकलर शोधा",
  "flow.s4d": "भाव, अंतर आणि पिकअपनुसार तुलना करा.",
  "flow.s5": "विका आणि सुपूर्द करा",
  "flow.s5d": "सुरक्षित QR आधारित हँडओव्हर रेकॉर्ड तयार करा.",
  "flow.s6": "देयक घ्या",
  "flow.s6d": "रोख रक्कम किंवा डिजिटल देयक मागोवा.",
  "prices.title": "आजचे ई-वेस्ट भाव",
  "prices.sub": "नेटवर्कमधील रिसायकलरकडून ताज्या दर",
  "prices.listen": "भाव ऐका",
  "prices.stop": "थांबा",
  "prices.demo": "डेमो / नमुना बाजार डेटा",
  "prices.kg": "/ किलो",

  "map.title": "तुमच्या जवळचे अधिकृत रिसायकलर",
  "map.sub": "सत्यापित सुविधा, दर आणि पिकअप उपलब्धता",
  "map.details": "तपशील पहा",
  "map.you": "तुम्ही येथे आहात",
  "map.fallback": "नकाशा उपलब्ध नाही",
  "map.openMap": "नकाशा उघडा",

  "eco.title": "GreenSetu सह जास्त कमवा",
  "eco.sub": "तीच सामग्री, हुशार मार्ग.",
  "eco.traditional": "पारंपरिक मार्ग",
  "eco.greensetu": "GreenSetu मार्ग",
  "eco.materialValue": "सामग्री मूल्य",
  "eco.middlemanLoss": "मध्यस्थ नुकसान",
  "eco.travel": "प्रवास खर्च",
  "eco.platformFee": "प्लॅटफॉर्म शुल्क",
  "eco.final": "अंतिम कमाई",
  "eco.additional": "GreenSetu सह अतिरिक्त कमाई",

  "partners.title": "भागीदार आणि परिसंस्था",
  "partners.sub": "औपचारिक ई-वेस्ट सेतूचे बांधकाम एकत्र",

  "safety.title": "सुरक्षित रहा",
  "safety.sub": "आरोग्याचे रक्षण करणारे सोपे नियम — तुमच्या भाषेत ऐका.",
  "safety.listen": "ऐका",

  "contact.title": "संपर्क करा",
  "contact.sub": "GreenSetuशी जोडला जा — रिसायकलर व्हा किंवा संकलक व्हा.",
  "contact.name": "नाव",
  "contact.email": "ईमेल",
  "contact.msg": "संदेश",
  "contact.send": "चौकशी पाठवा",
  "contact.sent": "चौकशी नोंदवली — आमची टीम संपर्क करेल (डेमो).",
  "contact.recycler": "अधिकृत रिसायकलर व्हा",
  "contact.collector": "संकलक म्हणून सामील व्हा",

  "foot.tag": "हुशारीने विका. योग्य दर मिळवा. योग्य पद्धतीने रीसायकल करा.",
  "foot.msg": "भारतासाठी स्वच्छ व पारदर्शक ई-वेस्ट परिसंस्थेचे बांधकाम.",
  "foot.privacy": "गोपनीयता",

  "demo.data": "डेमो डेटा",
  "app.title": "GreenSetu अ‍ॅप",
  "sell.title": "स्क्रॅप विका",
  "common.cancel": "रद्द करा",
  "common.next": "पुढे",
  "common.back": "मागे",
  "common.confirm": "खात्री करा",
  "common.offline": "ऑफलाइन — नंतर सिंक होईल",
  "common.syncing": "GreenSetu डेटा सिंक होत आहे...",
  "common.synced": "सिंक झाले",
};

const DICTS: Record<Lang, Dict> = { en, hi, mr };

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, fallback?: string) => string;
};

const Ctx = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: (k, f) => f ?? k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("gs_lang");
      return saved === "hi" || saved === "mr" || saved === "en" ? saved : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("gs_lang", lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: string, fallback?: string) => {
      return DICTS[lang][key] ?? DICTS.en[key] ?? fallback ?? key;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** Get a localized label out of a tri-lingual record. */
export function pickLabel(
  lang: Lang,
  item: { labelEn: string; labelHi: string; labelMr: string },
): string {
  if (lang === "hi") return item.labelHi;
  if (lang === "mr") return item.labelMr;
  return item.labelEn;
}
