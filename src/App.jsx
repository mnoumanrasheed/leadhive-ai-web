import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import MarketingApp from "@/features/marketing/MarketingApp";
import { FlowWidget } from "./features/youtube/screens/FlowWidget";
import { LiveDemo } from "./features/youtube/components/LiveDemo";
import { VisaApp } from "./features/visabot/VisaApp";
import { RegisterClient } from "./features/visabot/components/RegisterClient";
import VisaDashboard from "./features/visabot/components/VisaDashboard";

const LegalPage = lazy(() =>
  import("@/features/legal/LegalPage").then((m) => ({ default: m.LegalPage })),
);
const NotFound = lazy(() => import("@/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<MarketingApp />} />
          <Route path="/contact" element={<MarketingApp />} />
          <Route path="/test-demo" element={<Navigate to="/flow?step=1" replace />} />
          <Route path="/flow" element={<FlowWidget />} />
          <Route path="/live-demo" element={<LiveDemo />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/visa" element={<VisaApp/>}/>
          <Route path="/visa/register" element={<RegisterClient/>}/>
          <Route path="/visa/dashboard" element={<VisaDashboard/>}/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}