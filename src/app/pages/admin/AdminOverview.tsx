import { AdminLayout } from "../../layouts/AdminLayout";

export function AdminOverview() {
  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-slate-900">Platform Metrics</h1>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: "MRR", val: "$12,450", trend: "+14%" },
            { label: "Active Subs", val: "342", trend: "+5%" },
            { label: "Churn Rate", val: "2.1%", trend: "-0.4%" },
            {
              label: "New Signups (7d)",
              val: "48",
              trend: "+12%",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"
            >
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{stat.val}</h3>
              <p
                className={`text-sm mt-2 font-medium ${stat.trend.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}
              >
                {stat.trend}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-3 text-sm font-medium text-slate-600">Event</th>
                <th className="p-3 text-sm font-medium text-slate-600">User</th>
                <th className="p-3 text-sm font-medium text-slate-600">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  event: "New Subscription (Pro)",
                  user: "Bella Italia",
                  time: "10 mins ago",
                },
                {
                  event: "Menu Updated",
                  user: "The Daily Grind",
                  time: "1 hour ago",
                },
                {
                  event: "Account Created",
                  user: "Sushi Palace",
                  time: "3 hours ago",
                },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="p-3 text-sm font-medium text-slate-900">{row.event}</td>
                  <td className="p-3 text-sm text-slate-600">{row.user}</td>
                  <td className="p-3 text-sm text-slate-500">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
