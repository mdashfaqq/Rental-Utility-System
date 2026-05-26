import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Users } from "lucide-react";

export const CustomerListForLedger = ({ onSelect }) => {
  const [customers, setCustomers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH CUSTOMERS WITH OUTSTANDING
  const fetchCustomers = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/customers-ledger-summary.php`
      );
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers);
        setFiltered(data.customers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 🔍 SEARCH
  useEffect(() => {
    const value = search.toLowerCase();

    const result = customers.filter((c) =>
      c.customer_name?.toLowerCase().includes(value) ||
      c.customer_phone?.includes(value)
    );

    setFiltered(result);
  }, [search, customers]);

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading customers...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="flex items-center gap-2">
        <Users className="text-blue-600" />
        <h1 className="text-xl font-semibold">
          Customer Ledger
        </h1>
      </div>

      {/* SEARCH */}
      <Input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* EMPTY */}
      {filtered.length === 0 && (
        <div className="text-center text-gray-400 mt-10">
          No customers found
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {filtered.map((c) => (
          <div
            key={c.customer_phone}
            onClick={() =>
  onSelect({
    name: c.customer_name,
    phone: c.customer_phone
  })
}
            className="bg-white border rounded-xl p-4 shadow hover:shadow-md cursor-pointer transition"
          >

            {/* NAME */}
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {c.customer_name || "Walk-in"}
                </p>
                <p className="text-sm text-gray-500">
                  {c.customer_phone}
                </p>
              </div>

              {/* BALANCE BADGE */}
              <div>
                {Number(c.balance) > 0 ? (
                  <span className="px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
                    ₹{c.balance}
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-600">
                    No Due
                  </span>
                )}
              </div>
            </div>

            {/* EXTRA INFO */}
            <div className="mt-3 text-sm text-gray-500 flex justify-between">
              <span>Total: ₹{c.total}</span>
              <span>Paid: ₹{c.paid}</span>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};