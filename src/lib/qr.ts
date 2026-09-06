/** QR payload for a lot handover record. */
export function handoverQrPayload(opts: {
  lotId: string;
  handoverRef?: string;
  collector: string;
  recycler?: string;
  material: string;
  weightKg: number;
}) {
  return JSON.stringify({
    t: "greensetu-handover",
    v: 1,
    lotId: opts.lotId,
    ho: opts.handoverRef ?? null,
    collector: opts.collector,
    recycler: opts.recycler ?? null,
    material: opts.material,
    kg: opts.weightKg,
  });
}

/** Full handover record text (display + printable). */
export function handoverRecordText(opts: {
  lotId: string;
  handoverRef?: string;
  collector: string;
  recycler?: string;
  material: string;
  weightKg: number;
  finalValue?: number;
  city?: string;
  ts?: number;
}) {
  const lines = [
    "GreenSetu Handover Record",
    "─────────────────────────",
    `Lot ID: ${opts.lotId}`,
    `Collector: ${opts.collector}`,
    `Recycler: ${opts.recycler ?? "—"}`,
    `Material: ${opts.material}`,
    `Weight: ${opts.weightKg} KG`,
    `Final Price: ${opts.finalValue ? `₹${opts.finalValue.toLocaleString("en-IN")}` : "—"}`,
    `Location: ${opts.city ?? "—"}`,
    `Timestamp: ${new Date(opts.ts ?? Date.now()).toLocaleString("en-IN")}`,
    `Reference: ${opts.handoverRef ?? "Pending handover"}`,
  ];
  return lines.join("\n");
}
