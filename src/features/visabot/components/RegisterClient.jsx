import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { createProfile } from "../api";

const platforms = [
  {
    name: "Facebook",
    color: "#1877F2",
    iconPath: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    name: "Instagram",
    color: "#E4405F",
    iconPath: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  },
  {
    name: "WhatsApp",
    color: "#25D366",
    isLucide: true,
    Icon: MessageCircle,
  },
];

export const RegisterClient = () => {
  // form state: keys match what the backend aliases expect (firstName, company, agree, ...)
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    agree: false,
    platform: "",
  });
  // true while the POST is in flight, blocks double submits
  const [submitting, setSubmitting] = useState(false);

  // generic input handler for text fields and the checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // platform buttons set the platform field directly
  const handlePlatformSelect = (platform) => {
    setForm((prev) => ({
      ...prev,
      platform,
    }));
  };

  // flow: validate -> save profile in backend -> redirect to the platform's OAuth route
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.platform) {
      alert("Please select a platform to connect.");
      return;
    }

    if (!form.agree) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    const authorizationRoutes = {
      Facebook: "/auth/facebook",
      Instagram: "/auth/instagram",
      WhatsApp: "/auth/whatsapp",
    };

    setSubmitting(true);
    try {
      // POST /profile, throws if the backend returns 422 or any other error
      const saved = await createProfile(form);
      console.log("Profile saved:", saved);

      // only redirect once the profile is stored
      window.location.href = authorizationRoutes[form.platform];
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Could not save your details. Please try again.");
      setSubmitting(false); // allow retry (on success the page navigates away)
    }
  };

  const inputClass =
    "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-12">
      <div className="hidden items-center justify-center bg-gray-100 text-gray-400 md:col-span-7 md:flex">
        <p>Image to be added later</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 md:col-span-5 md:px-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900">Connect Your Account</h2>
          <p className="mt-2 text-gray-600">Tell us what you are connecting</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Miller"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="janemiller@m3hive.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="company" className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="M3Hive"
                value={form.company}
                onChange={handleChange}
                autoComplete="organization"
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Select Platform</label>
              <p className="mt-1 text-sm text-gray-500">Choose the account you want to connect.</p>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {platforms.map(({ name, color, isLucide, Icon, iconPath }) => {
                  const selected = form.platform === name;

                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handlePlatformSelect(name)}
                      aria-pressed={selected}
                      style={selected ? { borderColor: color, color: color } : undefined}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                        selected ? "bg-gray-50" : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {isLucide ? (
                        <Icon className="h-4 w-4 shrink-0" />
                      ) : (
                        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d={iconPath} />
                        </svg>
                      )}
                      <span className="truncate">{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <label htmlFor="agree" className="flex items-start gap-2 text-sm text-gray-600">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={form.agree}
                onChange={handleChange}
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-blue-600"
              />
              <span>I agree to the terms and conditions.</span>
            </label>

            <button
              type="submit"
              disabled={!form.platform || submitting}
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : form.platform
                ? `Connect ${form.platform} Account`
                : "Select a Platform"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};