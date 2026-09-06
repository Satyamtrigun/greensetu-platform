import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { DEMO_COLLECTOR_HOME } from "@/lib/greensetu-data";
import { inr } from "@/lib/tts";
import { Link } from "react-router";
import { useI18n } from "@/lib/i18n";

const AUTH_STYLES: Record<string, { dot: string; label: string }> = {
  verified: { dot: "bg-emerald-500", label: "✅ Authorized" },
  pending: { dot: "bg-amber-500", label: "🟡 Pending" },
  expired: { dot: "bg-red-500", label: "🔴 Expired" },
  unverified: { dot: "bg-slate-400", label: "⚪ Unverified" },
};

function markerIcon(verified: boolean, pending: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${
      verified ? "#0B5D3B" : pending ? "#B45309" : "#94A3B8"
    };color:#fff;font-size:16px;border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.35)">♻️</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

export function RecyclerMap({
  height = 420,
  compact = false,
}: {
  height?: number;
  compact?: boolean;
}) {
  const recyclers = useQuery(api.recyclers.list, {}) ?? [];
  const { t } = useI18n();
  const home = DEMO_COLLECTOR_HOME;

  const points = useMemo(
    () =>
      recyclers.map((r) => ({
        ...r,
        distanceKm: Math.hypot(r.lat - home.lat, r.lng - home.lng) * 111,
      })),
    [recyclers, home],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
      <MapContainer
        center={[home.lat, home.lng]}
        zoom={10}
        style={{ height }}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[home.lat, home.lng]}
          radius={20000}
          pathOptions={{ color: "#22A447", fillColor: "#22A447", fillOpacity: 0.06 }}
        />
        <Marker position={[home.lat, home.lng]} icon={youIcon()}>
          <Popup>
            <div className="text-sm font-semibold">📍 {t("map.you")}</div>
            <div className="text-xs text-muted-foreground">New Delhi (demo location)</div>
          </Popup>
        </Marker>
        {points.map((r) => {
          const rate = r.rates.find((x) => x.material === "copper_cable")?.rate ?? null;
          const style = AUTH_STYLES[r.authStatus];
          return (
            <Marker key={r._id} position={[r.lat, r.lng]} icon={markerIcon(r.authStatus === "verified", r.authStatus === "pending")}>
              <Popup>
                <div className="min-w-[210px] space-y-1.5">
                  <div className="text-sm font-bold">
                    {r.logoEmoji} {r.name}
                  </div>
                  <div className="text-xs font-medium text-emerald-700">{style?.label}</div>
                  {rate != null && (
                    <div className="text-sm">💰 {inr(rate)}/KG (copper)</div>
                  )}
                  <div className="text-xs text-muted-foreground">📍 {r.distanceKm.toFixed(1)} KM away</div>
                  <div className="text-xs">
                    🚚 {r.pickupAvailable ? "Pickup Available" : "No Pickup"} · ⭐ {r.rating}
                  </div>
                  <Button asChild size="sm" className="mt-1 w-full">
                    <Link to="/auth">{compact ? "VIEW" : "VIEW DETAILS"}</Link>
                  </Button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

function youIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,.25)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}
