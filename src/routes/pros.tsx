import { createFileRoute } from "@tanstack/react-router";
import { Phone, Star, MapPin, Clock, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pros")({
  head: () => ({
    meta: [
      { title: "Profis in der Nähe – FixScan" },
      { name: "description", content: "Lokale SHK- und Elektro-Fachbetriebe in deiner Umgebung finden." },
    ],
  }),
  component: ProsPage,
});

const center: [number, number] = [52.5321, 13.385];

const pros = [
  { name: "Müller SHK GmbH", trade: "Sanitär & Heizung", rating: 4.8, reviews: 213, distance: "1,2 km", eta: "Heute 16:00", phone: "+49 30 1234567", lat: 52.5365, lng: 13.378 },
  { name: "Elektro Schmidt", trade: "Elektroinstallation", rating: 4.7, reviews: 156, distance: "2,4 km", eta: "Morgen 09:00", phone: "+49 30 7654321", lat: 52.528, lng: 13.402 },
  { name: "KlimaTech Berlin", trade: "Klima & Lüftung", rating: 4.9, reviews: 98, distance: "3,1 km", eta: "Mi 11:30", phone: "+49 30 9988776", lat: 52.541, lng: 13.391 },
  { name: "Bäder & Mehr", trade: "Sanitär", rating: 4.5, reviews: 341, distance: "4,0 km", eta: "Do 14:00", phone: "+49 30 5544332", lat: 52.523, lng: 13.371 },
];

function ProsPage() {
  const [active, setActive] = useState(pros[0].name);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">Profis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Geprüfte Fachbetriebe in deiner Nähe.</p>

      <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="w-full bg-transparent text-sm outline-none" placeholder="PLZ oder Stadt eingeben" defaultValue="10115 Berlin" />
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-border shadow-soft" style={{ height: 280 }}>
        <LeafletMap active={active} onSelect={setActive} />
      </div>

      <ul className="mt-5 space-y-3">
        {pros.map((p) => (
          <li
            key={p.name}
            onClick={() => setActive(p.name)}
            className={cn(
              "cursor-pointer rounded-2xl border bg-card p-4 shadow-soft transition-colors",
              active === p.name ? "border-foreground" : "border-border"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.trade}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {p.rating}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.distance}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.eta}</span>
              <span>{p.reviews} Bewertungen</span>
            </div>
            <a href={`tel:${p.phone}`} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-medium text-background">
              <Phone className="h-4 w-4" /> Anrufen
            </a>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}

function LeafletMap({ active, onSelect }: { active: string; onSelect: (n: string) => void }) {
  const [Comp, setComp] = useState<null | {
    MapContainer: any; TileLayer: any; Marker: any; CircleMarker: any; Popup: any; L: any;
  }>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [rl, leaflet] = await Promise.all([
        import("react-leaflet"),
        import("leaflet"),
      ]);
      await import("leaflet/dist/leaflet.css");
      if (cancelled) return;
      const L = leaflet.default ?? leaflet;
      // Default marker icon fix
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setComp({
        MapContainer: rl.MapContainer,
        TileLayer: rl.TileLayer,
        Marker: rl.Marker,
        CircleMarker: rl.CircleMarker,
        Popup: rl.Popup,
        L,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  if (!Comp) {
    return <div className="grid h-full w-full place-items-center bg-secondary text-xs text-muted-foreground">Karte lädt…</div>;
  }

  const { MapContainer, TileLayer, Marker, CircleMarker, Popup, L } = Comp;

  const makeIcon = (isActive: boolean) =>
    L.divIcon({
      className: "",
      html: `<div style="display:grid;place-items:center;width:36px;height:36px;border-radius:9999px;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);background:${isActive ? "#111" : "oklch(0.72 0.17 155)"};color:${isActive ? "#fff" : "#0a0a0a"};font-weight:600;font-size:14px">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={center} radius={8} pathOptions={{ color: "#0ea5e9", fillColor: "#0ea5e9", fillOpacity: 0.6 }}>
        <Popup>Du bist hier</Popup>
      </CircleMarker>
      {pros.map((p) => (
        <Marker
          key={p.name}
          position={[p.lat, p.lng]}
          icon={makeIcon(active === p.name)}
          eventHandlers={{ click: () => onSelect(p.name) }}
        >
          <Popup>
            <strong>{p.name}</strong>
            <br />
            {p.trade} · ⭐ {p.rating}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
