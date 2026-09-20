import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List } from "lucide-react";
import { Loading } from "@/components/ui/loading";
export const InvoiceList = ({ onView }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
  const [view, setView] = useState("table"); // table | grid
  const [filtered, setFiltered] = useState([]);



useEffect(() => {
  const term = search.toLowerCase();

  const result = data.filter((inv) =>
    (inv.customer_name || "").toLowerCase().includes(term) ||
    (inv.customer_phone || "").toLowerCase().includes(term) ||
    String(inv.id).includes(term)
  );

  setFiltered(result);
}, [search, data]);

useEffect(() => {
  fetch(`${API_BASE_URL}/get-invoices.php`)
    .then(res => res.json())
    .then(res => {
  if (res.success) {
  setData(res.data);
  setFiltered(res.data); // 🔥 important
}else {
        console.error("API error:", res);
      }
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
}, []);
console.log(data);

  // 🔥 STATUS LOGIC
  const getStatus = (inv) => {
    const total = Number(inv.total_amount || 0);
    const paid = Number(inv.paid_amount || 0);

    if (paid === 0) return "pending";
    if (paid < total) return "partial";
    return "paid";
  };

  if (loading) return <Loading message="Loading invoices" className="min-h-[320px]" />;

  return (
    <div className="p-4 sm:p-8">

      <h1 className="font-display text-2xl font-normal mb-6">
        Invoices
      </h1>

      <div className="flex items-center justify-between gap-4 flex-col sm:flex-row">

        {/* SEARCH */}
<div className="relative w-full sm:w-auto flex-1">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

  <Input
    
    className="pl-10"
    placeholder="Search customer..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

        {/* VIEW SWITCH */}
        {/* <div className="flex gap-2">
          <Button
            size="sm"
            variant={view === "table" ? "default" : "outline"}
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => setView("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div> */}
      </div>
<br />
      
      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Paid</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  No invoices found
                </td>
              </tr>
            ) : (
              filtered.map((inv) => {
                const status = getStatus(inv);
                const total = Number(inv.total_amount || 0);
                const paid = Number(inv.paid_amount || 0);
                const balance = total - paid;

                return (
                  <tr
                    key={inv.id}
                    onClick={() => onView(inv.id)}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-4 py-3 text-center">{inv.id}</td>
                    <td className="px-4 py-3 text-center">{inv.customer_name}</td>
                    <td className="px-4 py-3 text-center">{inv.customer_phone}</td>

                    <td className="px-4 py-3 text-center">₹{total}</td>
                    <td className="px-4 py-3 text-center">₹{paid}</td>
                    <td className="px-4 py-3 text-center">₹{balance.toFixed(2)}</td>

                   <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        status === "paid"
                          ? "bg-green-100 text-green-700"
                          : status === "partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {inv.created_at?.split(" ")[0]}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            No invoices found
          </div>
        ) : (
          filtered.map((inv) => {
            const status = getStatus(inv);
            const total = Number(inv.total_amount || 0);
            const paid = Number(inv.paid_amount || 0);
            const balance = total - paid;

            return (
              <div
                key={inv.id}
                onClick={() => onView(inv.id)}
                className="bg-card rounded-2xl border p-4 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-sm">#{inv.id}</p>
                    <p className="text-xs text-gray-500">{inv.created_at?.split(" ")[0]}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    status === "paid"
                      ? "bg-green-100 text-green-700"
                      : status === "partial"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="mb-2">
                  <p className="font-medium text-sm">{inv.customer_name}</p>
                  <p className="text-xs text-gray-500">{inv.customer_phone}</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div><span className="text-gray-500">Total:</span> ₹{total}</div>
                  <div><span className="text-gray-500">Paid:</span> ₹{paid}</div>
                  <div><span className="text-gray-500">Balance:</span> <span className="text-red-600 font-medium">₹{balance.toFixed(2)}</span></div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};