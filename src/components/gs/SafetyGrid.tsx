import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SAFETY, type SafetyDef } from "@/lib/greensetu-data";
import { speak, stopSpeaking } from "@/lib/tts";
import type { Lang } from "@/lib/i18n";
import { Volume2, Square } from "lucide-react";

function pick(lang: Lang, s: SafetyDef, field: "title" | "text") {
  const k = (field + lang.charAt(0).toUpperCase() + lang.slice(1)) as "titleEn" | "titleHi" | "titleMr" | "textEn" | "textHi" | "textMr";
  return s[k];
}

export function SafetyGrid({ lang }: { lang: Lang }) {
  const dbItems = useQuery(api.safety.list, {}) ?? [];
  const items: SafetyDef[] = dbItems.length > 0 ? dbItems : SAFETY;
  const [speakingKey, setSpeakingKey] = useState<string | null>(null);

  const listen = (s: SafetyDef) => {
    if (speakingKey === s.key) {
      stopSpeaking();
      setSpeakingKey(null);
      return;
    }
    const text = `${pick(lang, s, "title")}. ${pick(lang, s, "text")}`;
    speak(text, lang, () => setSpeakingKey(null));
    setSpeakingKey(s.key);
  };

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">⚠️ Stay Safe</h2>
        <p className="mt-2 text-muted-foreground">
          Simple rules that protect your health — listen in your language.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <Card key={s.key} className="border-border/70 transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-red-50 text-2xl">{s.emoji}</div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => listen(s)}
                >
                  {speakingKey === s.key ? <Square className="size-3" /> : <Volume2 className="size-3.5" />}
                  {speakingKey === s.key ? "Stop" : "Listen"}
                </Button>
              </div>
              <h3 className="mt-3 font-bold">
                {lang === "hi" ? s.titleHi : lang === "mr" ? s.titleMr : s.titleEn}
              </h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {lang === "hi" ? s.textHi : lang === "mr" ? s.textMr : s.textEn}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        <Badge variant="outline" className="mr-2 border-amber-300 bg-amber-50 text-amber-800">Demo Content</Badge>
        Safety guidance for awareness only — not medical advice.
      </p>
    </div>
  );
}
