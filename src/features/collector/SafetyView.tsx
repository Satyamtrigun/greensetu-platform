import { SafetyGrid } from "@/components/gs/SafetyGrid";
import { useI18n } from "@/lib/i18n";

export function SafetyView() {
  const { lang } = useI18n();
  return (
    <div className="pt-2">
      <SafetyGrid lang={lang} />
    </div>
  );
}
