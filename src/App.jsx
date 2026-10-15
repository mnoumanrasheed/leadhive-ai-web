import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router";
import MarketingApp from "@/features/marketing/MarketingApp";
import { FlowWidget } from "./features/youtube/screens/FlowWidget";
import { LiveDemo } from "./features/youtube/components/LiveDemo";
import { getAuthChannels } from "./features/youtube/api";
import { FlowLoader } from "./features/youtube/components/FlowLoader";

const AUTH_RETURN_KEY = "leadhive.youtube.auth-return";

const LegalPage = lazy(() =>
  import("@/features/legal/LegalPage").then((m) => ({ default: m.LegalPage })),
);
const NotFound = lazy(() => import("@/NotFound"));

function HomeRoute() {
  const navigate = useNavigate();
  const [checkingAuth, setCheckingAuth] = useState(
    () => sessionStorage.getItem(AUTH_RETURN_KEY) === "pending",
  );

  useEffect(() => {
    if (!checkingAuth) return;

    let active = true;
    getAuthChannels()
      .then(() => {
        if (!active) return;
        sessionStorage.removeItem(AUTH_RETURN_KEY);
        navigate("/flow?step=1", { replace: true });
      })
      .catch((error) => {
        if (!active) return;
        sessionStorage.removeItem(AUTH_RETURN_KEY);
        if (error?.status !== 401) {
          console.error("[Auth] Could not verify YouTube connection after sign-in", error);
        }
        setCheckingAuth(false);
      });

    return () => {
      active = false;
    };
  }, [checkingAuth, navigate]);

  if (checkingAuth) return <FlowLoader message="Opening your YouTube channels..." />;
  return <MarketingApp />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/contact" element={<MarketingApp />} />
          <Route path="/test-demo" element={<Navigate to="/flow?step=1" replace />} />
          <Route path="/flow" element={<FlowWidget />} />
          <Route path="/live-demo" element={<LiveDemo />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}