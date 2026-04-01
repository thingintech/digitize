export function Billing() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Billing & Subscriptions</h1>
      <div className="bg-white p-6 rounded-xl border border-slate-200 max-w-md">
        <h3 className="text-lg font-bold mb-2">Pro Plan</h3>
        <p className="text-slate-600 mb-6">
          $19/mo • Next billing date: May 1, 2026
        </p>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium">
          Update Payment Method
        </button>
      </div>
    </div>
  );
}
