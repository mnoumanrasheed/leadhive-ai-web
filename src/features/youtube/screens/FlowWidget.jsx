// Controls the 5-step LeadHive flow: Channel -> Persona -> Video -> Reply -> Stats.
// The current step lives in the URL (/flow?step=2) so refresh and the browser Back button work.
// The shared selections are saved in localStorage so a refresh doesn't lose them.
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowUpRight, Play } from "lucide-react";
import { ChannelSelection } from "../components/ChannelSelection";
import { PersonaSelection } from "../components/PersonaSelection";
import { VideoSelection } from "../components/VideoSelection";
import { ReplySection } from "../components/ReplySection";
import { StatsScreen } from "../components/StatsScreen";
import { logoutUser } from "../api";

// Single source of truth: step order, nav label, and the component to render
const FLOW_STEPS = [
  { key: "ChannelSelection", label: "Channel", Component: ChannelSelection },
  { key: "PersonaSelection", label: "AI Persona", Component: PersonaSelection },
  { key: "VideoSelection", label: "Video Library", Component: VideoSelection },
  { key: "ReplySection", label: "Command Center", Component: ReplySection },
  { key: "StatsScreen", label: "Analytics", Component: StatsScreen },
];

const LAST_STEP = FLOW_STEPS.length - 1;

// Same as useState, but the value is saved in localStorage and restored on refresh
function useStoredState(key) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable (private mode, quota): the flow still works, it just won't survive a refresh
    }
  }, [key, value]);

  return [value, setValue];
}

export const FlowWidget = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Channel picked in step 1: { id, name, subscribers, views }. Later steps read channel.id.
  const [channel, setChannel] = useStoredState("leadhive.flow.channel");
  // Persona saved in step 2: { business_name, brand_tone, services, ai_rules }, or null when unsaved
  const [profile, setProfile] = useStoredState("leadhive.flow.profile");
  // Video saved in step 3: { id, title, description }, or null when unsaved
  const [video, setVideo] = useStoredState("leadhive.flow.video");

  // Exit demo state
  const [exiting, setExiting] = useState(false);
  const [exitError, setExitError] = useState("");
  // Bumped on exit so the active step remounts and refetches (otherwise step 1 keeps showing old channels)
  const [sessionKey, setSessionKey] = useState(0);

  // Whether each step is done, in step order. Next stays disabled until the current step is ready.
  // Reply and Stats are not gated yet; their gates are added as those steps get wired.
  const stepReady = [Boolean(channel), Boolean(profile), Boolean(video), true, true];

  // Furthest step the user may be on: the first unfinished step (or the last step if all are done)
  const firstBlocked = stepReady.findIndex(ready => !ready);
  const maxStep = firstBlocked === -1 ? LAST_STEP : firstBlocked;

  // Step from the URL (1-based: ?step=2 is Persona). Missing or invalid means step 1.
  const rawStep = searchParams.get("step");
  const requested = Number.isInteger(Number(rawStep)) && Number(rawStep) >= 1 ? Number(rawStep) - 1 : 0;
  const currentStep = Math.min(requested, LAST_STEP, maxStep);

  // If the URL asks for a step that isn't reachable yet (typed by hand, or state was cleared),
  // correct it in place, replacing the history entry so Back doesn't loop
  useEffect(() => {
    if (rawStep !== null && rawStep !== String(currentStep + 1)) {
      setSearchParams({ step: String(currentStep + 1) }, { replace: true });
    }
  }, [rawStep, currentStep, setSearchParams]);

  // Scroll to the top whenever the step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentStep]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === LAST_STEP;
  const canGoNext = !isLast && stepReady[currentStep];

  // Each step change adds a history entry, so the browser Back button returns to the previous step
  const goToStep = index => setSearchParams({ step: String(index + 1) });

  const nextStep = () => {
    if (canGoNext) goToStep(currentStep + 1);
  };

  const previousStep = () => {
    if (!isFirst) goToStep(currentStep - 1);
  };

  // Picking a different channel clears the persona and video, since they belonged to the previous channel.
  // Re-picking the same channel keeps them.
  const selectChannel = next => {
    if (next?.id !== channel?.id) {
      setProfile(null);
      setVideo(null);
    }
    setChannel(next);
  };

  // Exit demo: log out on the backend (clears the auth cookie), reset the flow, go back to step 1
  const exitDemo = async () => {
    setExiting(true);
    setExitError("");
    try {
      await logoutUser();
    } catch (err) {
      // 401 means the session was already gone, which is fine. Anything else: stay put and show the error.
      if (err?.status !== 401) {
        setExitError(err?.message || "Could not log out. Please try again.");
        setExiting(false);
        return;
      }
    }
    // Setting these to null also clears their localStorage entries (useStoredState does that)
    setChannel(null);
    setProfile(null);
    setVideo(null);
    setSessionKey(k => k + 1);
    setSearchParams({ step: "1" }, { replace: true });
    setExiting(false);
  };

  // Component for the active step
  const { Component: ActiveStep } = FLOW_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header: brand, module label, step navigation, demo + exit */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <img src="/leadhive-logo.png" alt="LeadHive AI" className="h-8 w-auto shrink-0" />
          <span className="hidden h-6 w-px bg-gray-300 sm:block" aria-hidden="true" />
          <span className="hidden whitespace-nowrap text-sm font-semibold text-gray-700 md:block">
            YouTube Intelligence
          </span>

          <nav aria-label="YouTube Intelligence steps" className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {FLOW_STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const reachable = index <= maxStep;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => reachable && !isActive && goToStep(index)}
                  disabled={!reachable}
                  aria-current={isActive ? "step" : undefined}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : reachable
                      ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      : "cursor-not-allowed text-gray-400"
                  }`}
                >
                  {step.label}
                </button>
              );
            })}
          </nav>

          {/* No-login interactive demo (sample video, simulated replies) */}
          <Link
            to="/live-demo"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Play size={14} className="fill-current" aria-hidden="true" />
            <span className="hidden sm:inline">Interactive Demo</span>
            <span className="sm:hidden">Demo</span>
          </Link>

          <button
            type="button"
            onClick={exitDemo}
            disabled={exiting}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <span>{exiting ? "Exiting..." : "Exit Demo"}</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {exitError && (
          <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {exitError}
          </p>
        )}

        {/* Current step (screens ignore props they don't use) */}
        <div>
          <ActiveStep
            key={sessionKey}
            channel={channel}
            onSelectChannel={selectChannel}
            profile={profile}
            onProfileSaved={setProfile}
            video={video}
            onVideoSaved={setVideo}
          />
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={previousStep}
            disabled={isFirst}
            className="rounded bg-gray-200 px-4 py-2 disabled:opacity-50"
          >
            Back
          </button>

          <button
            onClick={nextStep}
            disabled={!canGoNext}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};