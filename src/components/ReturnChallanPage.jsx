import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export const ReturnChallanPage = ({
  id,
  onBack,
  setActiveTab,
  setSelectedChallanId,
   setSelectedInvoiceId,
  quotationId
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quotation, setQuotation] =
  useState(null);

  useEffect(() => {

  const fetchQuotation = async () => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/get-quotation.php?id=${quotationId}`
      );

      const data =
        await res.json();

      if (data.success) {
        setQuotation(data.quotation);
      }

    } catch (err) {

      console.error(err);

    }
  };

  if (quotationId) {
    fetchQuotation();
  }

}, [quotationId]);
  // ✅ STABLE FETCH (works with any backend)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/get-delivery-challan.php?id=${id}`);
        const data = await res.json();

        if (data.success && data.items) {
const formatted = data.items.map(item => ({
  product_id: item.product_id || item.id,

  name:
    item.product_name ||
    item.name ||
    "Unknown Item",

quantity:
  Number(item.quantity_sent || item.quantity || 0),

good_qty:
  Number(item.quantity_sent || item.quantity || 0),

damaged_qty: 0,

missing_qty: 0,

damage_fee: 0,

  unit_price: Number(
    item.unit_price ||
    item.unitPrice ||
    item.price ||
    0
  ),

  condition: "good"
}));

          setItems(formatted);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error(err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [id]);

  // ✅ UPDATE LOGIC (SMART)
const updateItem = (index, field, value) => {

  const updated = [...items];

  value = Math.max(0, Number(value));

  updated[index] = {

    ...updated[index],

    [field]: value
  };

  const item = updated[index];

  const total =
    Number(item.good_qty || 0) +
    Number(item.damaged_qty || 0) +
    Number(item.missing_qty || 0);

  if (total > item.quantity) {

toast({
  title: "Quantity Exceeded",
  description: `Total returned quantity cannot exceed given quantity (${item.quantity}).`,
  variant: "destructive"
});

return;
  }

  setItems(updated);

  console.log(
    "UPDATED ITEM",
    updated[index]
  );
};

 const handleSubmit = async () => {
    for (let i of items) {
// ❌ Check 1: returned cannot exceed given
const total =
  Number(i.good_qty || 0) +
  Number(i.damaged_qty || 0) +
  Number(i.missing_qty || 0);

if (total !== i.quantity) {
  alert(`Quantity mismatch for ${i.name}`);
  return;
}
}
const payload = items.map(i => ({
  product_id: i.product_id,

  good_qty: Number(i.good_qty || 0),

  damaged_qty: Number(i.damaged_qty || 0),

  missing_qty: Number(i.missing_qty || 0),

  damage_fee: Number(i.damage_fee || 0),

  unit_price: i.unit_price || i.price || 0
}));

  try {
    // 🔹 1. Save return
    const res = await fetch(`${API_BASE_URL}/return-challan-inspect.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        challan_id: id,
        items: payload
      })
    });

    const data = await res.json();
    console.log("RETURN SAVE:", data);

  if (!data.success) {

  toast({
    title: "Damage Fee Required",
    description:
      data.message || "Please enter damage fee for damaged items.",
    variant: "destructive"
  });

  return;
}

    // 🔥 IMPORTANT DELAY
    await new Promise(resolve => setTimeout(resolve, 300));

    // 🔹 2. Create invoice
    const invoiceRes = await fetch(`${API_BASE_URL}/create-invoice.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        challan_id: id,
        gst_enabled: quotation?.gst_enabled ? 1 : 0
      })
    });

    const invoiceData = await invoiceRes.json();
    console.log("🔥 CREATED INVOICE:", invoiceData.invoice_id);
    console.log("INVOICE CREATE:", invoiceData);

    if (!invoiceData.success) {
      alert(invoiceData.message || "Invoice creation failed");
      return;
    }
const newInvoiceId = Number(invoiceData.invoice_id);

if (typeof setSelectedInvoiceId !== "function") {
  console.error("setSelectedInvoiceId missing");
  return;
}

setSelectedInvoiceId(newInvoiceId);

setTimeout(() => {
  setActiveTab("invoice-details");
}, 0);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

  if (loading) return <div className="p-6">Loading...</div>;

  if (!items.length) {
    return (
      <div className="p-6 text-gray-500 text-center">
        No items found for this challan
      </div>
    );
  }

return (
  <div className="p-6 max-w-5xl mx-auto">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-6">

      <button
        onClick={onBack}
        className="text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-semibold text-center flex-1">
        Return Inspection
      </h1>

      <div className="w-20" />

    </div>

    {/* ITEMS */}
    <div className="space-y-4">

      {items.map((item, index) => (

        <div
          key={index}
          className="bg-white border rounded-xl p-4 shadow-sm"
        >

          {/* HEADER */}
          <div className="flex justify-between mb-3">

            <h2 className="font-medium">
              {item.name}
            </h2>

            <span className="text-sm text-gray-500">
              Given: {item.quantity}
            </span>

          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* GOOD */}
            <div>
              <label className="text-sm text-gray-600">
                Good Qty
              </label>

              <input
                type="number"
                min="0"
                value={item.good_qty}
                onChange={(e) =>
                  updateItem(
                    index,
                    "good_qty",
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* DAMAGED */}
            <div>
              <label className="text-sm text-gray-600">
                Damaged Qty
              </label>

              <input
                type="number"
                min="0"
                value={item.damaged_qty}
                onChange={(e) =>
                  updateItem(
                    index,
                    "damaged_qty",
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* MISSING */}
            <div>
              <label className="text-sm text-gray-600">
                Missing Qty
              </label>

              <input
                type="number"
                min="0"
                value={item.missing_qty}
                onChange={(e) =>
                  updateItem(
                    index,
                    "missing_qty",
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded p-2"
              />
            </div>

            {/* DAMAGE FEE */}
            <div>
              <label className="text-sm text-gray-600">
                Damage Fee
              </label>

              <input
                type="number"
                min="0"
                value={item.damage_fee}
                onChange={(e) =>
                  updateItem(
                    index,
                    "damage_fee",
                    Number(e.target.value)
                  )
                }
                className="w-full border rounded p-2"
              />
            </div>

          </div>

          {/* STATUS */}
          <div className="mt-3 text-sm text-gray-500">

            Total Checked:
            {" "}

            {Number(item.good_qty || 0) +
             Number(item.damaged_qty || 0) +
             Number(item.missing_qty || 0)}

            {" / "}

            {item.quantity}

          </div>

        </div>

      ))}

    </div>

    {/* ACTIONS */}
    <div className="flex justify-end gap-3 mt-6">

      <Button
        variant="outline"
        onClick={onBack}
      >
        Cancel
      </Button>

      <Button onClick={handleSubmit}>
        Save & Generate Invoice
      </Button>

    </div>

  </div>
);
};