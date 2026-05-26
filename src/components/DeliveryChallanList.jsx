import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List } from "lucide-react";
 import { Trash2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const DeliveryChallanList = ({ onView }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [filtered, setFiltered] = useState([]);
const fetchChallans = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/get-delivery-challans.php`);
    const data = await res.json();

    if (data.success) {
      setData(data.data);
      setFiltered(data.data);
    }
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const handleCancel = async (id) => {
  if (!confirm("Cancel this delivery challan?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/cancel-delivery-challan.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const data = await res.json();
    console.log(data);

    if (data.success) {
      fetchChallans();
      {toast({ title: 'Challan Cancelled', description: `Delivery challan #${id} has been cancelled.`, variant: 'destructive', duration: 3000 });}
    }
  } catch (err) {
    console.error(err);
  }
};

const handleDelete = async (id) => {
  if (!confirm("Delete this challan permanently?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/delete-delivery-challan.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      }
    );

    const data = await res.json();

if (data.success) {

  toast({
    title: "Delivery Challan Deleted",
    description: `Challan #${id} was deleted successfully.`,
  });

  fetchChallans();

} else {

  toast({
    title: "Cannot Delete Challan",
    description: data.message || "Completed challans cannot be deleted.",
    variant: "destructive",
  });
}
  } catch (err) {
    console.error(err);
  }
};
  useEffect(() => {
    fetch(`${API_BASE_URL}/get-delivery-challans.php`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
  setData(res.data);
  setFiltered(res.data); // 🔥 important
}
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
  const term = search.toLowerCase();

  const result = data.filter((c) =>
    (c.customer_name || "").toLowerCase().includes(term) ||
    (c.customer_phone || "").toLowerCase().includes(term) ||
    String(c.id).includes(term)
  );

  setFiltered(result);
}, [search, data]);

  // 🔥 STATUS LOGIC
const getStatus = (c) => {
  if (c.status === "cancelled") return "cancelled";

  if (c.status === "completed") return "returned";

const today = new Date();
today.setHours(0, 0, 0, 0);

const end = new Date(c.end_date + "T00:00:00");
end.setHours(0, 0, 0, 0);

if (end.getTime() < today.getTime()) {
  return "overdue";
}

  return "ongoing";
};
  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Delivery Challans
      </h1>
<div className="mb-4 flex items-center gap-4">

  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

    <Input
      className="pl-10"
      placeholder="Search by customer, phone, or challan ID..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

</div>

<br />

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">#</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Start</th>
              <th className="px-6 py-3">End</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-400">
                  No challans found
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const status = getStatus(c);

                return (
                  <tr
                    key={c.id}
                    onClick={() => onView(c.id)}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${
                      status === "overdue" ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4">{c.id}</td>
                    <td className="px-6 py-4">{c.customer_name}</td>
                    <td className="px-6 py-4">{c.customer_phone}</td>
                    <td className="px-6 py-4">{c.start_date}</td>
                    <td className="px-6 py-4">{c.end_date}</td>

                    {/* 🔥 STATUS UI */}
<td className="px-6 py-4">
  <div className="flex justify-center">
    <span
      style={{
        backgroundColor:
          status === "ongoing"
            ? "#dbeafe"
            : status === "overdue"
            ? "#fee2e2"
            : status === "cancelled"
            ? "#b91c1c"
            : "#dcfce7",

        color:
          status === "ongoing"
            ? "#1d4ed8"
            : status === "overdue"
            ? "#b91c1c"
            : status === "cancelled"
            ? "#ffffff"
            : "#15803d",

        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  </div>
</td>
                    <td className="px-6 py-4">
  <div className="flex justify-center gap-2">

    {/* Cancel */}


{/* Cancel */}
{c.status !== "completed" &&
  c.status !== "cancelled" && (
    <Button
      size="icon"
      variant="ghost"
      className="h-9 w-9 rounded-full border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
      onClick={(e) => {
        e.stopPropagation();
        handleCancel(c.id);
      }}
    >
      <XCircle className="h-4 w-4" />
    </Button>
)}

{/* Delete */}
{c.status !== "completed" && (
  <Button
    size="icon"
    variant="ghost"
    className="h-9 w-9 rounded-full border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200"
    onClick={(e) => {
      e.stopPropagation();
      handleDelete(c.id);
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
)}
  </div>
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