import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Grid, List, Plus  } from "lucide-react";
import { Trash2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Loading } from "@/components/ui/loading";

export const QuotationList = ({ onView }) => {
  const [quotations, setQuotations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
const handleCancel = async (id) => {
  if (!confirm("Cancel this quotation?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/cancel-quotation.php`,
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
      toast({ title: 'Quotation Cancelled', description: `Quotation #${id} has been cancelled.`, variant: 'destructive', duration: 3000 });
      fetchQuotations();
    }
  } catch (err) {
    console.error(err);
  }
};
const handleDelete = async (id) => {
  if (!confirm("Delete this quotation permanently?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/delete-quotation.php`,
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
        title: "Quotation Deleted",
        description: `Quotation #${id} has been deleted permanently.`,
        variant: "destructive",
      });

      fetchQuotations();

    } else {

      toast({
        title: "Delete Failed",
        description: data.message || "Unable to delete quotation",
        variant: "destructive",
      });

      console.error(data.message);
    }

  } catch (err) {

    console.error(err);

    toast({
      title: "Server Error",
      description: "Something went wrong while deleting quotation",
      variant: "destructive",
    });
  }
};
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table"); // table | grid
const handleView = (id) => {
  // store selected quotation
  localStorage.setItem("selectedQuotationId", id);

  // switch tab (IMPORTANT)
  window.dispatchEvent(new CustomEvent("openQuotationDetails"));
};
  // 🔥 FETCH
  const fetchQuotations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-quotations.php`);
      const data = await res.json();

      const safeData = Array.isArray(data) ? data : [];
      setQuotations(safeData);
      setFiltered(safeData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // 🔍 SEARCH FILTER
  useEffect(() => {
    const result = quotations.filter((q) =>
      (q.customer_name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, quotations]);

  if (loading) return <Loading message="Loading quotations" className="min-h-[320px]" />;

  return (
    <div className="p-4 space-y-4">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <h2 className="font-display text-2xl font-normal">Quotations</h2>

  
      </div>

      {/* FILTER BAR */}
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

      {/* TABLE VIEW */}
      {view === "table" && (
       <div className="bg-card rounded-2xl border overflow-hidden">
         <table className="w-full text-sm table-fixed">

            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
<th className="p-3 text-left w-[60px]">#</th>
<th className="p-3 text-left w-[220px]">Customer</th>
<th className="p-3 text-left w-[160px]">Phone</th>
<th className="p-3 text-left w-[140px]">Start</th>
<th className="p-3 text-left w-[140px]">End</th>
<th className="p-3 text-left w-[120px]">Status</th>
<th className="p-3 text-right w-[140px]">Total</th>
<th className="p-3 text-center w-[220px]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-4 text-gray-500">
                    No quotations found
                  </td>
                </tr>
              ) : (
                filtered.map((q, index) => (
                  <tr
  key={q.id}
  onClick={() => onView(q.id)}
  className="border-t hover:bg-gray-50 cursor-pointer"
>
                    <td className="p-3 font-medium">
  {q.id}
</td>
                    <td className="p-3 font-medium">{q.customer_name}</td>
                    <td className="p-3">{q.customer_phone || "-"}</td>
                    <td className="p-3">{q.start_date}</td>
<td className="p-3">{q.end_date}</td>

<td className="p-3">
  <span
    className={`px-2 py-1 rounded-full text-xs font-medium ${
      q.status === "approved"
        ? "bg-green-100 text-green-700"
        : q.status === "cancelled"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700"
    }`}
  >
    {q.status || "draft"}
  </span>
</td>

<td className="p-3 text-right font-semibold">
  ₹{Number(q.total_amount).toFixed(2)}
</td>

<td className="p-3 flex gap-2 justify-center">

  {/* Cancel */}
  {q.status !== "completed" &&
    q.status !== "cancelled" &&
    Number(q.challan_id ?? 0) === 0 && (
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          handleCancel(q.id);
        }}
      >
        <XCircle className="h-4 w-4" />
      </Button>
  )}

  {/* Delete */}
  {q.status === "cancelled" && (
    <Button
      size="icon"
      variant="ghost"
      className="h-9 w-9 rounded-full border border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all"
      onClick={(e) => {
        e.stopPropagation();
        handleDelete(q.id);
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )}

</td>

{/* <Button
  size="sm"
  variant="outline"
  onClick={() => onView(q.id)}
>
  View
</Button> */}
                    
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {view === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="font-semibold text-gray-800">
                {q.customer_name}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {q.start_date} → {q.end_date}
              </div>

              <div className="mt-3 text-green-600 font-bold">
                ₹{Number(q.total_amount).toFixed(2)}
              </div>

<Button
  size="sm"
  className="mt-3 w-full"
  onClick={() => onView(q.id)}
>
  View Details
</Button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};