import { AdminLayout } from "../../layouts/AdminLayout";

export function AdminBusinesses() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-medium text-slate-600">Business</th>
              <th className="p-4 font-medium text-slate-600">Status</th>
              <th className="p-4 font-medium text-slate-600">Plan</th>
              <th className="p-4 font-medium text-slate-600">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="p-4">
                <div className="font-medium text-slate-900">Joe's Cafe</div>
                <div className="text-sm text-slate-500">joe@example.com</div>
              </td>
              <td className="p-4">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Active
                </span>
              </td>
              <td className="p-4">Pro ($19/mo)</td>
              <td className="p-4">
                <button className="text-purple-600 text-sm font-medium hover:underline">
                  Impersonate
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
