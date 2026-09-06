import type { Lang } from "./i18n";

/* ───────────────────────── Text to Speech ───────────────────────── */

let voices: SpeechSynthesisVoice[] = [];
function loadVoices() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    voices = window.speechSynthesis.getVoices();
  }
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const target = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
  return (
    voices.find((v) => v.lang === target) ??
    voices.find((v) => v.lang.startsWith(lang)) ??
    voices.find((v) => v.lang.startsWith("hi-IN"))
  );
}

/** Speak text in the given language. No-ops safely on unsupported browsers. */
export function speak(text: string, lang: Lang, onEnd?: () => void) {
  try {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    u.rate = 0.95;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  } catch {
    onEnd?.();
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

/** Hindi number → words (simple, for TTS sentences). */
function numToHiWords(n: number): string {
  const ones = [
    "शून्य", "एक", "दो", "तीन", "चार", "पाँच", "छह", "सात", "आठ", "नौ",
    "दस", "ग्यारह", "बारह", "तेरह", "चौदह", "पंद्रह", "सोलह", "सत्रह",
    "अठारह", "उन्नीस", "बीस",
  ];
  const tens: Record<number, string> = { 30: "तीस", 40: "चालीस", 50: "पचास", 60: "साठ", 70: "सत्तर", 80: "अस्सी", 90: "नब्बे" };
  if (n <= 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10) * 10;
    return `${tens[t]} ${ones[n % 10]}`;
  }
  if (n < 1000) {
    return `${ones[Math.floor(n / 100)]} सौ${n % 100 ? ` ${numToHiWords(n % 100)}` : ""}`;
  }
  return String(n);
}

/** Price announcement sentence per language (as per spec examples). */
export function priceAnnouncement(
  lang: Lang,
  materialLabel: string,
  price: number,
  unit = "किलो",
): string {
  if (lang === "hi") {
    return `${materialLabel} का आज का अनुमानित भाव ${numToHiWords(price)} रुपये प्रति ${unit} है।`;
  }
  if (lang === "mr") {
    return `${materialLabel}चा आजचा अंदाजे दर ${price} रुपये प्रति किलो आहे.`;
  }
  return `Today's estimated price of ${materialLabel} is ${price} rupees per kilo.`;
}

/* ───────────────────────── Formatting ───────────────────────── */

export function inr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
