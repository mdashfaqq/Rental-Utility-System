import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CustomerLedgerPage = ({
    customer: propCustomer,
  onBack,
  onTabChange,
  setSelectedInvoiceId
}) => {
  const [data, setData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] =
  useState("cash");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast(); 
  const [customer, setCustomer] = useState(propCustomer);
const [selectedInvoices, setSelectedInvoices] =
  useState([]);
  const [invoiceSearch, setInvoiceSearch] =
  useState("");
  // 🔥 FETCH DATA
const fetchData = async () => {
  try {
    setError(null);

    const [ledgerRes, payRes] = await Promise.all([
      fetch(
        `${API_BASE_URL}/customer-ledger.php?phone=${customer.phone}`
      ),

      fetch(
        `${API_BASE_URL}/payments.php?phone=${customer.phone}`
      ),
    ]);

    const ledger = await ledgerRes.json();
    const payData = await payRes.json();
console.log(ledger);

if (!ledger.success) {
  throw new Error(
    ledger.message || ledger.error || "Failed to load ledger"
  );
}

    setData(ledger);
    setPayments(payData.payments || []);

  } catch (err) {
    console.error(err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {

  // restore after refresh
  if (!propCustomer) {

    const saved =
      localStorage.getItem("ledgerCustomer");

    if (saved) {
      setCustomer(JSON.parse(saved));
    }

  } else {

    setCustomer(propCustomer);

    localStorage.setItem(
      "ledgerCustomer",
      JSON.stringify(propCustomer)
    );
  }

}, [propCustomer]);

useEffect(() => {

  if (!customer?.phone) {
    setLoading(false);
    return;
  }

  setLoading(true);

  fetchData();

}, [customer]);

  // 🔥 APPLY PAYMENT
  const handlePayment = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_BASE_URL}/apply-payment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
body: JSON.stringify({
  customer_phone: customer.phone,
  customer_name: customer.name,
  amount: Number(amount),
  payment_method: paymentMethod,
  selected_invoices: selectedInvoices
})
      });

      const result = await res.json();
if (Number(amount) > Number(data.balance)) {
  toast({
    title: "Invalid Payment",
    description: "Payment amount cannot exceed balance amount.",
    variant: "destructive",
  });

  return;
}
      if (!result.success) {
        throw new Error(result.error || "Payment failed");
      }

      setAmount("");
      setSelectedInvoices([]);
      fetchData(); // 🔥 refresh

    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  
  useEffect(() => {

  if (!data?.invoices) return;

  const total = data.invoices
    .filter((i) =>
      selectedInvoices.includes(i.id)
    )
    .reduce((sum, i) => {

      const balance =
        Number(i.total_amount) -
        Number(i.paid_amount);

      return sum + balance;

    }, 0);

  setAmount(
    total > 0
      ? total.toFixed(2)
      : ""
  );

}, [selectedInvoices, data]);

  // 🔴 ERROR
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ {error}
      </div>
    );
  }

  // ⏳ LOADING
if (loading) {
  return (
    <div className="p-6 text-center text-gray-500">
      Loading ledger...
    </div>
  );
}

if (!customer) {
  return (
    <div className="p-6 text-center text-red-500">
      Customer not found
    </div>
  );
}

if (!data) {
  return (
    <div className="p-6 text-center text-red-500">
      Ledger not available
    </div>
  );
}

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-4">
  <button onClick={onBack} className="text-blue-600">
        ← Back to Ledger
      </button>
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold">
          {customer?.name}
        </h1>
        <p className="text-gray-500">{customer?.phone}</p>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <p>Total</p>
          <p className="font-bold text-lg">₹{data.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p>Paid</p>
          <p className="text-green-600 font-bold text-lg">
            ₹{data.paid}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p>Balance</p>
          <p className="text-red-600 font-bold text-lg">
            ₹{data.balance}
          </p>
        </div>
      </div>

      {/* PAYMENT BOX */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        
        <h2 className="font-medium">Add Payment</h2>

        <div className="flex gap-3">
          <input
            type="number"
            value={amount}
            min="0"
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 border p-3 rounded"
            placeholder="Enter amount"
          />

<Select
  value={paymentMethod}
  onValueChange={setPaymentMethod}
>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Method" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="cash">Cash</SelectItem>
    <SelectItem value="upi">UPI</SelectItem>
    <SelectItem value="card">Card</SelectItem>
    <SelectItem value="bank">
      Bank Transfer
    </SelectItem>
  </SelectContent>
</Select>

          <Button
            disabled={saving}
            onClick={handlePayment}
          >
            {saving ? "Processing..." : "Apply Payment"}
          </Button>
        </div>
      </div>

      {/* INVOICE LIST */}
      <div className="bg-white rounded-xl shadow">
<div className="
  p-4
  border-b
  flex
  items-center
  justify-between
  gap-4
">

  {/* LEFT */}
  <div>

    <p className="font-medium">
      Invoices
    </p>

    <p className="text-sm text-gray-500">
      {data.invoices.length} Invoices
    </p>

  </div>

  {/* SEARCH */}
  <input
    type="text"
    placeholder="Search invoice..."
    value={invoiceSearch}
    onChange={(e) =>
      setInvoiceSearch(e.target.value)
    }
    className="
      border
      rounded-lg
      px-3
      py-2
      text-sm
      w-[220px]
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
  />

</div>
<div className="max-h-[650px] overflow-y-auto border-t">
        <table className="w-full text-sm">
         <thead className="bg-gray-50 sticky top-0 z-10">
<tr>
  <th className="p-3"></th>
  <th className="p-3">ID</th>
  <th>Total</th>
  <th>Paid</th>
  <th>Balance</th>
  <th>Status</th>
</tr>
          </thead>

          <tbody>
            {data.invoices
  .filter((i) =>
    i.id
      .toString()
      .includes(invoiceSearch)
  )
  .map((i) => {
              const balance = i.total_amount - i.paid_amount;

              return (
                
<tr
  key={i.id}
  onClick={() => {

    setSelectedInvoiceId(i.id);

    onTabChange("invoice-details");

  }}
  className="
    border-t
    cursor-pointer
    hover:bg-gray-50
    transition-colors
  "
>
  <td className="p-3 text-center">
<input
  type="checkbox"
  checked={selectedInvoices.includes(i.id)}
  onClick={(e) => e.stopPropagation()}
  disabled={balance <= 0}
  onChange={(e) => {

    if (e.target.checked) {

setSelectedInvoices((prev) =>
  [...new Set([...prev, i.id])]
);

    } else {

      setSelectedInvoices(
        selectedInvoices.filter(
          (id) => id !== i.id
        )
      );

    }

  }}
/>
</td>
                  <td className="p-3 text-center">#{i.id}</td>
                  <td className="p-3 text-center">₹{i.total_amount}</td>
                  <td className="p-3 text-center">₹{i.paid_amount}</td>
                  <td className="p-3 text-center text-red-600">
                    ₹{balance.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        i.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : i.status === "partial"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-4 font-medium border-b">
          Payment History
        </div>
<div className="max-h-[650px] overflow-y-auto border-t">
        <table className="w-full text-sm">
         <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th  className="p-3 text-center">Date</th>
              <th className="p-3 text-center">Amount</th>
              <th className="p-3 text-center">Method</th>
            </tr>
          </thead>

          <tbody>
              {payments.length > 0 ? (
    payments.map((p) => (
      <tr key={p.id} className="border-t">
        <td className="p-3 text-center">
{new Date(p.created_at.replace(' ', 'T')).toLocaleString('en-IN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})}
        </td>

        <td className="font-medium text-center">
          ₹{p.amount}
        </td>

        <td className="p-3 text-center">
          {p.payment_method}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={3}
        className="p-6 text-center text-gray-500"
      >
        No payment history found
      </td>
    </tr>
  )}

          </tbody>
        </table>
      </div>
</div>
    </div>
  );
};