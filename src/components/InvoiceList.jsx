import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List } from "lucide-react";
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

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-semibold mb-6">
        Invoices
      </h1>

      <div className="flex items-center justify-between gap-4">

        {/* SEARCH */}
<div className="relative w-full">
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
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm table-fixed">

          <thead className="bg-gray-50 text-gray-500">
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

    </div>
  );
};