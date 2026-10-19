import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Navbar } from "./components/Navbar";
import "./styles/index.css";
import { style } from "motion/react-client";

// Platforms cycled in the headline, each with its brand color
const platforms = [
  { name: "Meta", color: "#0668E1" },
  { name: "Instagram", color: "#E4405F" },
  { name: "Facebook", color: "#1877F2" },
  { name: "WhatsApp", color: "#25D366" },
];

export const VisaApp = () => {
  const [index, setIndex] = useState(0);

  // Hook that lets us change routes from code (used by the Connect button)
  const navigate = useNavigate();

  // Advance to the next platform on an interval, looping back to the first
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % platforms.length);
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const current = platforms[index];

  return (
    <>
      {/* Top navigation */}
      <div>
        <Navbar />
      </div>

      <section className="min-h-[calc(100vh-4rem)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-12 md:grid-cols-10 md:gap-4">
          {/* LEFT: text content */}
          <div className="md:col-span-6 md:pr-8">
            <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
              Handle conversations for{" "}
              <span style={{ color: current.color }} className="flip-down">
                {current.name}
              </span>
              ,
              <br />
              on autopilot
            </h1>

            <p className="mt-4 max-w-xl text-lg text-gray-600">
              Leadhive automates prospecting, engages high-intent leads and
              books meetings, so you can focus on closing deals, not chasing
              them.
            </p>

            {/* Call-to-action: goes to the register screen */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/visa/register")}
                style={{ backgroundColor: current.color }}
                className="rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90"
              >
                Connect
              </button>
            </div>

            {/* Quick stats row */}
            <div className="mt-10 flex gap-10">
              <div>
                <p className="text-2xl font-bold text-gray-900">30+</p>
                <p className="text-sm text-gray-500">Countries</p>
              </div>
            </div>
          </div>

          {/* right col */}
          <div className="md:col-span-4">
            <div className="flex h-80 w-full items-center justify-center rounded-t-xl bg-gray-100 text-gray-400 md:h-full">
              Image goes here
            </div>
          </div>
        </div>
      </section>
    </>
  );
};