import { GsLogo, GsWordmark } from "./Logo";
import { Link } from "react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <GsWordmark />
          <p className="mt-2 text-sm font-semibold text-primary">Sell Smart. Earn Fair. Recycle Right.</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Building a cleaner and more transparent e-waste ecosystem for India.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold">Platform</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#how" className="hover:text-foreground">How It Works</a></li>
            <li><a href="/#prices" className="hover:text-foreground">Price Board</a></li>
            <li><a href="/#recyclers" className="hover:text-foreground">Find Recyclers</a></li>
            <li><a href="/#safety" className="hover:text-foreground">Safety Center</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#about" className="hover:text-foreground">About</a></li>
            <li><a href="/#partners" className="hover:text-foreground">Partners</a></li>
            <li><a href="/#contact" className="hover:text-foreground">Contact</a></li>
            <li><Link to="/privacy" className="hover:text-foreground">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <GsLogo size={18} /> © 2026 GreenSetu
          </span>
          <span>Demo prices are sample market data. Not a government website.</span>
        </div>
      </div>
    </footer>
  );
}
