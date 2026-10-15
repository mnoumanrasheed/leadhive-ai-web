// Visa dashboard: KPI cards, engagement breakdown, qualified leads table.
// Flow: static data at the top -> small helpers -> one component that renders three sections.
import {
  Users,
  MessageSquare,
  UserCheck,
  FileText,
  Globe2,
  Phone,
  ArrowUpRight,
} from "lucide-react";

// KPI cards shown in the top row
const stats = [
  { label: "Total Leads", value: "128", change: "+12.5%", description: "vs. previous period", icon: UserCheck, color: "blue" },
  { label: "Engaged Users", value: "486", change: "+8.2%", description: "unique conversations", icon: Users, color: "violet" },
  { label: "Messages Received", value: "1,842", change: "+18.4%", description: "across all platforms", icon: MessageSquare, color: "emerald" },
  { label: "Qualified Leads", value: "94", change: "+6.8%", description: "ready for follow-up", icon: FileText, color: "amber" },
];

// Sample rows for the leads table (replace with API data later)
const leads = [
  { id: 1, name: "Ahmed Khan", phone: "+92 300 1234567", visa: "Canada Visit", country: "Canada", callingTime: "10 AM - 12 PM", platform: "WhatsApp", status: "Qualified" },
  { id: 2, name: "Sarah Malik", phone: "+92 321 7654321", visa: "USA Visit", country: "USA", callingTime: "2 PM - 4 PM", platform: "Facebook", status: "Qualified" },
  { id: 3, name: "Usman Ali", phone: "+92 333 1122334", visa: "Startup Visa", country: "Finland", callingTime: "4 PM - 6 PM", platform: "Instagram", status: "Qualified" },
  { id: 4, name: "Ayesha Siddiqui", phone: "+92 312 9876543", visa: "Canada LMIA", country: "Canada", callingTime: "11 AM - 1 PM", platform: "WhatsApp", status: "Qualified" },
  { id: 5, name: "Hamza Sheikh", phone: "+92 301 4567890", visa: "Schengen Visit", country: "Schengen", callingTime: "3 PM - 5 PM", platform: "Facebook", status: "Qualified" },
];

// Users grouped by how deeply they engaged with the bot
const engagementBuckets = [
  { label: "Low Engagement", users: 152, qualified: 12, color: "bg-slate-400" },
  { label: "Moderate Engagement", users: 174, qualified: 28, color: "bg-blue-500" },
  { label: "Good Engagement", users: 108, qualified: 31, color: "bg-violet-500" },
  { label: "Complete Engagement", users: 52, qualified: 23, color: "bg-emerald-500" },
];

// Full class strings so Tailwind can detect them at build time
const platformStyles = {
  WhatsApp: "bg-emerald-50 text-emerald-700",
  Facebook: "bg-blue-50 text-blue-700",
  Instagram: "bg-pink-50 text-pink-700",
};

const colorStyles = {
  blue: "bg-blue-50 text-blue-600",
  violet: "bg-violet-50 text-violet-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

// "Ahmed Khan" -> "AK" (avatar initials)
const getInitials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export const VisaDashboard = () => {
  // Totals are derived from the buckets so the numbers can never drift apart
  const totalUsers = engagementBuckets.reduce((sum, b) => sum + b.users, 0);
  const totalQualified = engagementBuckets.reduce((sum, b) => sum + b.qualified, 0);
  const conversionRate = ((totalQualified / totalUsers) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-slate-800">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
          Dashboard Overview
        </h2>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, Admin
        </h1>

        {/* KPI cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, change, description, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                    {value}
                  </p>
                </div>

                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorStyles[color]}`}>
                  <Icon size={21} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <ArrowUpRight size={14} aria-hidden="true" />
                  {change}
                </span>
                <span className="text-slate-400">{description}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Engagement overview: bars on the left, summary tiles on the right (large screens) */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Engagement Overview</h3>
              <p className="mt-1 text-sm text-slate-500">Users grouped by engagement level</p>
            </div>

            <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
              {totalUsers.toLocaleString()} users
            </span>
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-3">
            {/* Progress bars, one per bucket */}
            <div className="space-y-5 lg:col-span-2">
              {engagementBuckets.map((bucket) => {
                const percentage = (bucket.users / totalUsers) * 100;

                return (
                  <div key={bucket.label}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${bucket.color}`} />
                        <span className="text-sm font-medium text-slate-700">{bucket.label}</span>
                      </div>

                      <div className="text-right text-sm">
                        <span className="font-semibold text-slate-900">{bucket.users}</span>
                        <span className="ml-2 text-slate-400">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${bucket.color}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-400">{bucket.qualified} qualified leads</p>
                  </div>
                );
              })}
            </div>

            {/* Summary tiles */}
            <div className="grid grid-cols-2 content-start gap-3 lg:grid-cols-1 lg:border-l lg:border-slate-100 lg:pl-8">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Engagement Rate</p>
                <p className="mt-1 text-xl font-bold text-slate-900">72.4%</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Lead Conversion</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{conversionRate}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Qualified leads table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h3 className="font-bold text-slate-900">Qualified Leads</h3>
            <p className="mt-1 text-sm text-slate-500">Leads captured by the AI Visa Assistant</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400">
                  {["Lead", "Visa Interest", "Country", "Calling Time", "Platform", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-6 py-4 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-slate-50/70">
                    {/* Avatar + name + phone */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {getInitials(lead.name)}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <Phone size={11} aria-hidden="true" />
                            {lead.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{lead.visa}</td>

                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        <Globe2 size={15} className="text-slate-400" aria-hidden="true" />
                        {lead.country}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{lead.callingTime}</td>

                    {/* Platform badge, colored per platform */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                          platformStyles[lead.platform] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {lead.platform}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Shown when the list is empty (e.g. before the API returns data) */}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-500">
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <p className="text-xs text-slate-500">Showing {leads.length} sample leads</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VisaDashboard;