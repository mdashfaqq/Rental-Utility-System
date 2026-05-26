import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import { custom } from "zod";
import { Trash2, XCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export const QuotationDetails = ({
  id,
  onBack,
  setActiveTab,
  setSelectedQuotationId,
  setSelectedChallanId,
  setSelectedInvoiceId
}) => {
  const [subtotal, setSubtotal] = useState(0);
  const [gstAmount, setGstAmount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [quotation, setQuotation] = useState(null);
  const [approving, setApproving] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
const [editingIndex, setEditingIndex] = useState(null);
const [draftItems, setDraftItems] = useState([]);
const [showProductPicker, setShowProductPicker] = useState(false);
const [priceWarning, setPriceWarning] = useState("");
const handleCancel = async () => {

  if (quotation?.challan_id) {

    toast({
      title: "Cannot Cancel",
      description: "Delivery Challan already generated for this quotation",
      variant: "destructive",
    });

    return;
  }

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
      setQuotation((prev) => ({
        ...prev,
        status: "cancelled",
      }));
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
const [editedItems, setEditedItems] = useState([]);
  const getStatusStyle = (status) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};
const [productSearch, setProductSearch] = useState("");
const filteredProducts = products.filter(product =>
  product.name
    ?.toLowerCase()
    .includes(productSearch.toLowerCase())
);
const fetchProducts = async () => {
  try {

    const res = await fetch(
      `${API_BASE_URL}/products.php`
    );

    const data = await res.json();

    if (Array.isArray(data)) {
      setProducts(data);
    }

  } catch (err) {
    console.error("Products fetch failed", err);
  }
};

const handleAddEmptyItem = () => {

  setEditedItems(prev => [
    ...prev,
    {
      id: null,
      product_id: null,
      product_name: "",
      quantity: 1,
      price: 0,
      rental_days: 1,
      total: 0
    }
  ]);

  setEditingIndex(editedItems.length);
};

const generatePDFBlob = async () => {

  const element = document.getElementById("print-section");

  // wait for images
  const images = element.getElementsByTagName("img");

  await Promise.all(
    Array.from(images).map((img) => {

      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });

    })
  );

  const opt = {

    margin: 0,

    filename: "Quotation.pdf",

    image: {
      type: "jpeg",
      quality: 1
    },

    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false
    },

    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }

  };

  const worker = html2pdf()
    .set(opt)
    .from(element);

  return await worker.outputPdf("blob");
};

const handleSharePDF = async () => {

  const blob = await generatePDFBlob();

  const file = new File(
    [blob],
    "Quotation.pdf",
    { type: "application/pdf" }
  );

  try {

    await navigator.share({
      title: "Quotation",
      text: `Quotation for ${quotation?.customer_name}`,
      files: [file]
    });

  } catch (err) {

    console.error(err);

  }
};

const th = {
  border: "1px solid black",
  padding: "8px",
  fontWeight: "bold"
};

const td = {
  border: "1px solid black",
  padding: "8px"
};
const handleDownloadPDF = async () => {
  const element = document.getElementById("print-section");

  const images = element.getElementsByTagName("img");

  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return;
      return new Promise((res) => {
        img.onload = res;
        img.onerror = res;
      });
    })
  );

  const opt = {
    margin: 0,
    filename: `Quotation-${quotation?.id || "download"}.pdf`, // ✅ file name fixed
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true, // ✅ important for images in production
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait",
    },
  };

  html2pdf().set(opt).from(element).save();
};

const [tax, setTax] = useState({});

useEffect(() => {

  if (!editedItems.length) return;

  const sub = draftItems.reduce(
    (sum, item) =>
      sum + Number(item.total || 0),
    0
  );

const gst =
  Number(
    quotation?.gst_amount || 0
  );

  // ✅ USE SAVED DB TOTAL
  const savedTotal =
    Number(
      quotation?.total_amount || 0
    );

  setSubtotal(sub);

  setGstAmount(gst);

  setGrandTotal(
    savedTotal > 0
      ? savedTotal
      : (sub + gst)
  );

}, [editedItems, tax, quotation]);

  // 🔥 FETCH QUOTATION
  const fetchQuotation = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-quotation.php?id=${id}`);
      const data = await res.json();

if (data.success) {

const normalizedItems = (data.items || []).map(item => ({
  ...item,

  quantity: Number(item.quantity ?? 0),

  price: Number(item.price ?? 0),

  rental_days: Number(item.rental_days ?? 1),

  total:
    Number(item.quantity ?? 0) *
    Number(item.price ?? 0) *
    Number(item.rental_days ?? 1)
}));

  setQuotation(data.quotation);

  setItems(normalizedItems);
  setEditedItems(normalizedItems);
  setDraftItems(JSON.parse(JSON.stringify(normalizedItems)));

  if (data.quotation.customer_phone) {
    fetchCustomer(data.quotation.customer_phone);
  }

} else {
  console.error(data.message);
}

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  console.log("QUOTATION DATA:", quotation);
}, [quotation]);

useEffect(() => {
  if (!id) {
    console.error("No ID received");
    setLoading(false);
    return;
  }
 fetchSettings();
  fetchQuotation();
  fetchProducts();
}, [id]);

const saveItemsToBackend = async () => {
  try {

    // REMOVE ITEMS WITH 0 QTY ONLY WHEN SAVING
const filteredItems = draftItems.filter(
  item => Number(item.quantity) > 0
);
    const res = await fetch(`${API_BASE_URL}/update-quotation.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quotation_id: id,
items: filteredItems.map(item => ({
  id: item.id,
  product_id: item.product_id,
  product_name: item.product_name,
  quantity: item.quantity,
  price: item.price,
  rental_days: item.rental_days,
  total: item.total
}))
      }),
    });

    const data = await res.json();

    if (data.success) {

      // UPDATE UI AFTER SAVE
      setEditedItems(filteredItems);

      toast({
  title: "Quotation Updated",
  description: "Items updated successfully",
});

      await fetchQuotation();

      setEditingIndex(null);

    } else {
      console.error(data);
      alert("Update failed");
    }

  } catch (err) {
    console.error(err);
  }
};
const handleChange = (index, field, value) => {

  const updated = [...draftItems];

  let parsedValue = Number(value);

  // Prevent invalid values
  if (isNaN(parsedValue)) {
    parsedValue = 0;
  }

  // Prevent negatives
  if (parsedValue < 0) {
    parsedValue = 0;
  }

 if (field === "price") {

const originalPrice =
  Number(editedItems[index]?.price || 0);

  if (originalPrice > 0) {

    const reduction =
      ((originalPrice - parsedValue) / originalPrice) * 100;

    if (reduction > 50) {

      setPriceWarning(
        `Warning: Price reduced by ${Math.round(reduction)}%`
      );

    } else {

      setPriceWarning("");
    }
  }
}

  updated[index][field] = parsedValue;

  updated.forEach((item) => {

    const qty = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    const days = Number(item.rental_days ?? 1);

    item.total = qty * price * days;
  });

  setDraftItems(updated);
};
const [store, setStore] = useState({});


const fetchSettings = async () => {
  try {
    const storeRes = await fetch(`${API_BASE_URL}/settings.php?type=store`);
    const storeData = await storeRes.json();

    const taxRes = await fetch(`${API_BASE_URL}/settings.php?type=tax`);
    const taxData = await taxRes.json();

    if (storeData) setStore(storeData);
    if (taxData) setTax(taxData);

  } catch (err) {
    console.error("Settings error:", err);
  }
};


const handlePrint = () => {
  const win = window.open("", "_blank");

  const logoUrl = window.location.origin + "/logo.jpg";

  win.document.write(`
    <html>
      <head>
        <title>Quotation</title>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; font-family: Arial; }
        </style>
      </head>
      <body>
        ${generateInvoiceHTML(logoUrl)}
        
        <script>
          const img = document.querySelector("img");

          function triggerPrint() {
            window.print();
            window.close();
          }

          if (img && !img.complete) {
            img.onload = triggerPrint;
            img.onerror = triggerPrint;
          } else {
            triggerPrint();
          }
        <\/script>
      </body>
    </html>
  `);

  win.document.close();
};

  // 🔥 APPROVE → GENERATE CHALLAN
 const approveQuotation = async () => {
  try {
    setApproving(true);

    const res = await fetch(`${API_BASE_URL}/delivery-challan.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quotation_id: id,
        customer_name: quotation.customer_name,
        customer_phone: quotation.customer_phone,
        customer_address: quotation.address,
        start_date: quotation.start_date,
        end_date: quotation.end_date,

items: editedItems
  .map((item, i) => ({
    product_id: item.product_id ?? item.id,
    product_name: item.product_name,
    quantity_sent: Number(draftItems[i]?.quantity || 0),
    rental_days: Number(draftItems[i]?.rental_days || 1),
    
  }))
  .filter(item =>
    item.product_id &&
    item.quantity_sent > 0
  )
      })
    });
console.log("SENDING ITEMS:", editedItems);
    const data = await res.json();

if (data.success) {

  setQuotation(prev => ({
    ...prev,
    status: "approved"
  }));

  const newId = Number(data.challan_id);

  setSelectedChallanId(newId);

  setTimeout(() => {
    setActiveTab("delivery-challan-details");
  }, 0);

} else {
      alert(data.error || "Failed to approve");
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setApproving(false);
  }
};

  if (loading) return <div className="p-4">Loading...</div>;
  if (!quotation) return <div className="p-4">No Data</div>;

return (
  <div className="p-8 max-w-5xl mx-auto">
<button
  onClick={onBack}
  className="mb-4 text-blue-600 hover:underline"
>
  ← Back to Quotations
</button>

    {/* HEADER */}
    <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">

      <div className="flex justify-between items-center">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quotation #{id}
          </h1>
          <span className={`px-3 py-1 text-xs rounded-full ${getStatusStyle(quotation.status)}`}>
  {quotation.status || "Draft"}
</span>



          <p className="text-gray-500 mt-1">
            {quotation.start_date} → {quotation.end_date}
          </p>
 {/* DOCUMENT FLOW */}
<div className="mt-4">

  {/* LABEL */}
  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
    Document Flow
  </div>

  {/* FLOW */}
  <div className="flex flex-wrap items-center gap-2 text-sm">

    {/* CURRENT QUOTATION */}
    <>
      <div
        className="
          inline-flex items-center
          rounded-full
          bg-white
          border
          border-gray-300
          ring-1
          ring-gray-200
          text-gray-900
          px-3 py-1
          font-semibold
          shadow
        "
      >
        QT-{quotation.id}
      </div>

      {quotation?.challan_id && (
        <span className="text-gray-300 text-xs">
          →
        </span>
      )}
    </>

    {/* CHALLAN */}
    {quotation?.challan_id && (
      <>
        <button
          onClick={() => {
            setSelectedChallanId(quotation.challan_id);
            setActiveTab("delivery-challan-details");
          }}
          className="
            inline-flex items-center
            rounded-full
            bg-green-50
            hover:bg-green-100
            text-green-700
            px-3 py-1
            font-medium
            shadow-sm
            transition-all
            duration-200
          "
        >
          DC-{quotation.challan_id}
        </button>

        {quotation?.invoice_id && (
          <span className="text-gray-300 text-xs">
            →
          </span>
        )}
      </>
    )}

    {/* INVOICE */}
{quotation?.invoice_id && (
  <button
    onClick={() => {
      setSelectedInvoiceId(quotation.invoice_id);
      setActiveTab("invoice-details");
    }}
    style={{
      background: "#ede9fe",
      color: "#6d28d9",
      border: "none"
    }}
    className="
      inline-flex items-center
      rounded-full
      px-3 py-1
      font-medium
      shadow-sm
      transition-all
      duration-200
    "
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "#ddd6fe";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "#ede9fe";
    }}
  >
    INV-{quotation.invoice_id}
  </button>
)}
  

  </div>

</div>
        </div>

        <div className="flex gap-3">
<Button onClick={() => {
  setTimeout(() => {
    window.print();
  }, 500);
}}>
  Print
</Button>

<Button onClick={handleDownloadPDF} className="bg-blue-600 text-white">
  Download PDF
</Button>



<Button
  disabled={
    quotation.status === "approved" ||
    approving ||
    editingIndex !== null
  }
  onClick={approveQuotation}
  className="bg-green-600 text-white disabled:opacity-50"
>
{approving
  ? "Processing..."
  : quotation.status === "approved"
  ? "Already Approved"
  : editingIndex !== null
  ? "Save changes first"
  : "Approve & Generate Challan"}
</Button>



<Button
  className="bg-blue-600 hover:bg-blue-700"
  onClick={handleSharePDF}
>
  Share PDF
</Button>

{/* Cancel Quotation */}
{quotation.status !== "completed" &&
  quotation.status !== "cancelled" &&
  !quotation?.challan_id && (
    <Button
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
      onClick={handleCancel}
    >
      <XCircle className="h-4 w-4 mr-2" />
      Cancel Quotation
    </Button>
)}

{/* Delete Quotation */}
{quotation.status === "cancelled" && (
  <Button
    variant="destructive"
    className="shadow-sm hover:shadow-md transition-all duration-200"
    onClick={() => handleDelete(quotation.id)}
  >
    <Trash2 className="h-4 w-4 mr-2" />
    Delete Quotation
  </Button>
)}
        </div>
      </div>
    </div>

    {/* CUSTOMER + TOTAL */}
   <div className="grid grid-cols-2 gap-6 mb-6">

  {/* CUSTOMER */}
  <div className="bg-white border rounded-xl shadow-sm">

    {/* HEADER */}
    <div className="px-6 py-4 border-b font-medium text-gray-700">
      Customer Details
    </div>

    {/* CONTENT */}
    <div className="px-6 py-4 space-y-4 text-sm">

      <div className="flex items-center justify-between">
        <span className="text-gray-500">Name</span>
        <span className="font-semibold text-gray-900">
          {quotation.customer_name}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500">Phone</span>
        <span className="font-semibold text-gray-900">
          {quotation.customer_phone || "-"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500">Address</span>
        <span className="font-semibold text-gray-900">
          {quotation.address || "-"}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500">Start Date</span>
        <span>{quotation.start_date}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-gray-500">End Date</span>
        <span>{quotation.end_date}</span>
      </div>

    </div>
  </div>

  {/* TOTAL */}
  <div className="bg-gradient-to-br from-green-50 to-green-100 border rounded-xl p-6 shadow-sm flex flex-col justify-between">

    <div>
      <span className="text-gray-600 text-sm">
        Total Amount
      </span>

<div className="text-4xl font-bold text-green-700 mt-2">
  ₹{Number(grandTotal || 0).toFixed(2)}
</div>

      <div className="text-xs text-gray-500 mt-1">
        Includes all rental items
      </div>
    </div>

    {/* EXTRA UX INFO */}
    <div className="text-sm text-gray-600 mt-4 border-t pt-3">
      <div className="flex justify-between">
        <span>Total Items</span>
        <span className="font-medium">{items.length}</span>
      </div>

      <div className="flex justify-between mt-1">
        <span>Duration</span>
        <span className="font-medium">
          {items[0]?.rental_days || 1} day(s)
        </span>
      </div>
    </div>

  </div>

</div>

    {/* ITEMS TABLE */}
<div className="bg-white border rounded-xl shadow-sm relative">

<div className="px-6 py-3 border-b flex justify-between items-center">
  <span className="font-medium text-gray-700">Items</span>

  {quotation.status !== "approved" && (
    <button
  onClick={() => setShowProductPicker(true)}
      className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
    >
      + Add Item
    </button>
  )}
{showProductPicker && (
<div className="absolute top-0 right-6 left-6 z-50 pr-4">

<div className="
  bg-white
w-full max-w-[320px] ml-auto
  rounded-xl
  border
  shadow-2xl
  p-3

">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">
          Search Product
        </h2>

        <button
          onClick={() => setShowProductPicker(false)}
          className="text-gray-500"
        >
          ✕
        </button>
      </div>

      {/* SEARCH */}
      <input
        autoFocus
        type="text"
        placeholder="Search inventory..."
        value={productSearch}
        onChange={(e) =>
          setProductSearch(e.target.value)
        }
        className="w-full border rounded-lg px-3 py-2 mb-4"
      />

      {/* FIXED HEIGHT LIST */}
      <div className="max-h-[300px] overflow-y-auto space-y-2">

        {filteredProducts.map(product => (

          <button
            key={product.id}
onClick={async () => {

  const newItems = [
    ...editedItems,
    {
      id: null,
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      price: Number(product.price || 0),
      rental_days: 1,
      total: Number(product.price || 0)
    }
  ];

  setEditedItems(newItems);
  setDraftItems(newItems);

  setShowProductPicker(false);
  setProductSearch("");

  try {

    const res = await fetch(
      `${API_BASE_URL}/update-quotation.php`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quotation_id: id,
items: newItems.map(item => ({
  id: item.id,
  product_id: item.product_id,
  product_name: item.product_name,
  quantity: item.quantity,
  price: item.price,
  rental_days: item.rental_days,
  total: item.total
}))
        })
      }
    );

    const data = await res.json();

if (data.success) {

  toast({
    title: "Item Added",
    description: `${product.name} added to quotation`,
  });

  await fetchQuotation();
}

  } catch (err) {
    console.error(err);
  }
}}
            className="w-full border rounded-lg p-3 text-left hover:bg-gray-50"
          >
            <div className="font-medium">
              {product.name}
            </div>

            <div className="text-sm text-gray-500">
              ₹{product.price}
            </div>

          </button>

        ))}

      </div>

    </div>

  </div>
)}
</div>

      

      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-6 py-3 text-left">Item</th>
            <th className="px-6 py-3 text-center">Qty</th>
            <th className="px-6 py-3 text-right">Price</th>
            <th className="px-6 py-3 text-center">Days</th>
            <th className="px-6 py-3 text-right">Total</th>
            <th className="px-6 py-3 text-center">Action</th>
          </tr>
        </thead>

<tbody>
  {editedItems.length === 0 ? (
    <tr>
      <td colSpan="6" className="text-center py-6 text-gray-400">
        No items in this quotation
      </td>
    </tr>
  ) : (
    editedItems.map((item, i) => (
      <tr key={i} className="border-t hover:bg-gray-50">

        {/* NAME */}
        <td className="px-6 py-4 font-medium">
          {item.product_name}
        </td>

        {/* QTY */}
        <td className="px-6 py-4 text-center">
          {editingIndex === i ? (
            <input
              type="number"
              value={draftItems[i]?.quantity}
              onChange={(e) =>
                handleChange(i, "quantity", e.target.value)
              }
              className="w-16 border rounded px-2 py-1 text-center"
            />
          ) : (
            draftItems[i]?.quantity
          )}
        </td>

        

        {/* PRICE */}
        <td className="px-6 py-4 text-right">
          {editingIndex === i ? (
            <input
              type="number"
              value={draftItems[i]?.price}
              onChange={(e) =>
                handleChange(i, "price", e.target.value)
              }
              className="w-20 border rounded px-2 py-1 text-right"
            />
          ) : (
            `₹${draftItems[i]?.price}`
          )}
        </td>

        {/* DAYS */}
        <td className="px-6 py-4 text-center">
          {/* {editingIndex === i ? (
            <input
              type="number"
              value={draftItems[i]?.rental_days}
              onChange={(e) =>
                handleChange(i, "rental_days", e.target.value)
              }
              className="w-16 border rounded px-2 py-1 text-center"
            />
          ) : (
            draftItems[i]?.rental_days
          )} */}

          {Math.max(
  1,
  Math.ceil(
    (
      new Date(quotation.end_date) -
      new Date(quotation.start_date)
    ) / (1000 * 60 * 60 * 24)
  )
)} day(s)
        </td>

        {/* TOTAL */}
        <td className="px-6 py-4 text-right font-semibold">
          ₹{draftItems[i]?.total}
        </td>

        {/* ACTION */}
<td className="px-6 py-4 text-center">

<div className="flex items-center justify-center gap-3">

{quotation.status !== "approved" && (
  editingIndex === i ? (
    <button
      onClick={async () => {

        setEditedItems(draftItems);

        await saveItemsToBackend();
      }}
      className="text-green-600 text-sm"
    >
      Save
    </button>
  ) : (
    <button
      onClick={() => {

        if (
          editingIndex !== null &&
          editingIndex !== i
        ) {

          const confirmSwitch = window.confirm(
            "You have unsaved changes. Switch editing item?"
          );

          if (!confirmSwitch) return;
        }

        setEditingIndex(i);
      }}
      className="text-blue-600 text-sm"
    >
      Edit
    </button>
  )
)}

{quotation.status !== "approved" && (
  <button
onClick={async () => {

  if (editingIndex !== null) {

    toast({
      title: "Unsaved Changes",
      description: "Save the current edited item first",
      variant: "destructive"
    });

    return;
  }

  const confirmDelete = window.confirm(
        `Remove ${item.product_name}?`
      );

      if (!confirmDelete) return;

      const updated = draftItems.filter(
        (_, index) => index !== i
      );

      setDraftItems(updated);
      setEditedItems(updated);

      try {

        const res = await fetch(
          `${API_BASE_URL}/update-quotation.php`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              quotation_id: id,
              items: updated.map(item => ({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                rental_days: item.rental_days,
                total: item.total
              }))
            })
          }
        );

        const data = await res.json();

        if (data.success) {

          toast({
            title: "Item Removed",
            description: `${item.product_name} removed`,
            variant: "destructive"
          });

          await fetchQuotation();

        }

      } catch (err) {
        console.error(err);
      }
    }}
    className="text-red-600 text-sm"
  >
    Remove
  </button>
)}

</div>

</td>

      </tr>
    ))
  )}
</tbody>
      </table>

{priceWarning && (
  <div className="
    mx-6 mb-4
    rounded-lg
    border border-orange-200
    bg-orange-50
    text-orange-700
    px-4 py-3
    text-sm
  ">
    {priceWarning}
  </div>
)}

    </div>

<div className="mt-12">
<br />
  {/* HEADER */}
  <div className="flex items-start justify-between gap-4 mb-6">

    {/* LEFT */}
    <div className="min-w-0">
      <h2 className="text-2xl font-semibold tracking-tight">
        Quotation Preview
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Review the quotation before printing or downloading.
      </p>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-2 flex-shrink-0">

      <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
        A4 Format
      </div>

      <div className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
        Customer Copy
      </div>

    </div>
  </div>

  {/* PREVIEW AREA */}
  <div
    className="
      rounded-3xl
      border
      bg-gradient-to-b
      from-gray-100
      to-gray-200
      dark:from-gray-900
      dark:to-gray-950
      p-12
      overflow-auto
      flex
      justify-center
      mb-5
    "
  >

    {/* PAPER */}
    <div
      id="print-section"
      className="
        bg-white
        border border-gray-300
        shadow-[0_25px_60px_rgba(0,0,0,0.18)]
        rounded-sm
        flex-shrink-0
      "
      style={{
        width: "794px",
        overflow: "hidden"
      }}
    >

  <div style={{ width: "210mm", padding: "15mm", fontFamily: "Arial" }}>

    {/* HEADER */}
    <div style={{ border: "2px solid black", padding: "15px" }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>

        {/* LEFT */}
        <div style={{ width: "60%" }}>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#1f3d2b" }}>
            {store?.name}
          </h1>

          <p>{store?.address}</p>
          <p>Mobile : {store?.phone}</p>
          <p>Email : {store?.email}</p>
        </div>

        {/* RIGHT */}
        <div style={{ width: "40%", textAlign: "right" }}>
          <b>GSTIN: {store?.gstNumber}</b>

<img
  src={`${window.location.origin}/Premier-Rentals/logo.jpg`}
  style={{ width: "300px", height: "110px" }}
/>
        </div>

      </div>

      {/* STRIP */}
      <div style={{
        borderTop: "2px solid green",
        borderBottom: "2px solid green",
        textAlign: "center",
        fontWeight: "bold",
        padding: "5px",
        marginTop: "10px"
      }}>
        CROCKERY | CUTLERY | GLASS WARES | BUFFET WARES
      </div>

    </div>

    {/* TITLE */}
    <div style={{
      textAlign: "center",
      border: "1px solid black",
      borderTop: "none",
      fontWeight: "bold",
      padding: "5px"
    }}>
      QUOTATION
    </div>

    {/* CUSTOMER */}
<table style={{
  width: "100%",
  borderCollapse: "collapse",
  border: "1px solid black",
  borderBottom: "1px solid black",
}}>
  <tbody>

    {/* ROW 1 */}
    <tr>
      {/* LEFT → TO (spans 2 rows) */}
      <td rowSpan="2" style={{
        width: "60%",
        borderRight: "1px solid black",
        verticalAlign: "top",
        padding: "8px"
      }}>
        <b>To</b>

        <div style={{ marginTop: "5px", lineHeight: "1.4" }}>
          <b>{quotation.customer_name}</b><br/>
          {quotation.address?.split(",").map((line, i) => (
            <div key={i}>{line.trim()}</div>
          ))}
        </div>
      </td>

      {/* RIGHT LABEL */}
      <td style={{
        width: "20%",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        padding: "6px",
        fontWeight: "bold"
      }}>
        Quotation Date
      </td>

      {/* RIGHT VALUE */}
      <td style={{
        width: "20%",
        borderBottom: "1px solid black",
        padding: "6px",
        textAlign: "right"
      }}>
        {new Date(quotation.start_date).toLocaleDateString("en-GB")}
      </td>
    </tr>

    {/* ROW 2 */}
    <tr>
      <td style={{
        borderRight: "1px solid black",
        padding: "6px",
        fontWeight: "bold"
      }}>
        Quotation No
      </td>

      <td style={{
        padding: "6px",
        textAlign: "right"
      }}>
        Quote-{quotation.id}
      </td>
    </tr>

  </tbody>
</table>

<div style={{
  textAlign: "center",
  fontWeight: "bold",
  border: "1px solid black",
  borderTop: "none",
  padding: "6px"
}}>
  HIRING ITEM PER DAY (24 hrs) CHARGES
</div>

    {/* TABLE */}
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={th}>Item</th>
          <th style={th}>Qty</th>
          <th style={th}>Price</th>
          <th style={th}>Days</th>
          <th style={th}>Total</th>
        </tr>
      </thead>

      <tbody>
        {editedItems.map((item, i) => (
          <tr key={i}>
            <td style={td}>{item.product_name}</td>
    <td style={{ ...td, textAlign: "center" }}>
      {draftItems[i]?.quantity}
    </td>

    <td style={{ ...td, textAlign: "center" }}>
      ₹{draftItems[i]?.price}
    </td>

    <td style={{ ...td, textAlign: "center" }}>
      {draftItems[i]?.rental_days}
    </td>

    <td style={{ ...td, textAlign: "center" }}>
      ₹{draftItems[i]?.total}
    </td>
          </tr>
        ))}

<tr>
  {/* LEFT EMPTY AREA (with border) */}
  <td colSpan="3" style={{
    borderLeft: "1px solid black",
    borderBottom: "1px solid black"
  }}>
  </td>

  {/* RIGHT SIDE (NESTED TABLE) */}
  <td colSpan="2" style={{
    padding: 0,
    border: "none"
  }}>
    <table style={{
      width: "100%",
      borderCollapse: "collapse"
    }}>
      <tbody>

        <tr>
          <td style={{
            border: "1px solid black",
            padding: "6px",
            fontWeight: "bold",
            textAlign: "right"
          }}>
            Subtotal
          </td>
          <td style={{
            border: "1px solid black",
            padding: "6px",
            textAlign: "right"
          }}>
            ₹ {subtotal.toFixed(2)}
          </td>
        </tr>

{quotation?.gst_enabled == 1 && (
  <tr>
    <td style={{
      border: "1px solid black",
      padding: "6px",
      textAlign: "right"
    }}>
      GST ({quotation?.gst_percentage || 0}%)
    </td>

    <td style={{
      border: "1px solid black",
      padding: "6px",
      textAlign: "right"
    }}>
     ₹ {Number(quotation?.gst_amount || 0).toFixed(2)}
    </td>
  </tr>
)}
{Number(quotation?.discount_amount || 0) > 0 && (
  <tr>
    <td style={{
      border: "1px solid black",
      padding: "6px",
      textAlign: "right",
      color: "red"
    }}>
      Discount
    </td>

    <td style={{
      border: "1px solid black",
      padding: "6px",
      textAlign: "right",
      color: "red",
      fontWeight: "bold"
    }}>
      - ₹ {
        Number(
          quotation?.discount_amount || 0
        ).toFixed(2)
      }
    </td>
  </tr>
)}
        <tr>
          <td style={{
            border: "1px solid black",
            padding: "6px",
            fontWeight: "bold",
            textAlign: "right"
          }}>
            Total
          </td>
          <td style={{
            border: "1px solid black",
            padding: "6px",
            fontWeight: "bold",
            textAlign: "right"
          }}>
            ₹ {grandTotal.toFixed(2)}
          </td>
        </tr>

      </tbody>
    </table>
  </td>
</tr>
      </tbody>
    </table>

</div>
</div>

  </div>
</div>
  </div>
);
};