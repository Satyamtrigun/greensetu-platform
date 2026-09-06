import { SiteHeader } from "@/components/gs/SiteHeader";
import { SiteFooter } from "@/components/gs/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          GreenSetu — demo / hackathon build. Last updated: September 2026.
        </p>

        <Card className="mt-6">
          <CardContent className="space-y-4 p-6 text-sm leading-6 text-muted-foreground">
            <p>
              <b className="text-foreground">What we store.</b> GreenSetu stores the
              information you create while using the app: your display name, chosen role,
              the material lots you create (photo preview, material, weight, condition,
              approximate location/city), and the transactions generated when recyclers
              confirm handovers. Prices, recycler facilities and safety content are demo
              sample data.
            </p>
            <p>
              <b className="text-foreground">Why we store it.</b> To show you your lots,
              earnings ledger, and traceability timeline, and to let recyclers confirm
              handovers. This is the core product function.
            </p>
            <p>
              <b className="text-foreground">Location.</b> The app uses a fixed demo
              location (New Delhi) instead of reading your precise GPS location in this
              build.
            </p>
            <p>
              <b className="text-foreground">Payments.</b> GreenSetu does not process
              payments. Recyclers mark cash as paid and collectors confirm receipt — the
              platform records the status only. Digital payments (UPI / bank transfer)
              are a future roadmap item.
            </p>
            <p>
              <b className="text-foreground">Offline queue.</b> Lots created while
              offline are stored only in your browser's local storage until they sync to
              the server. Clearing your browser data removes them.
            </p>
            <p>
              <b className="text-foreground">Your choices.</b> You can sign out at any
              time. Demo accounts and data can be deleted on request in a production
              deployment.
            </p>
          </CardContent>
        </Card>
      </div>
      <SiteFooter />
    </div>
  );
}
