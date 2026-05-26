import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import html2pdf from "html2pdf.js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Trash2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const DeliveryChallanDetails = ({
  id,
  onBack,
  setActiveTab,
  setSelectedQuotationId,
  setSelectedChallanId,
  setSelectedInvoiceId
}) => {
  const navigate = useNavigate();
  const [challan, setChallan] = useState(null);
  const [items, setItems] = useState([]);
const [store, setStore] = useState({});
const minRows = 10;        // 👈 how many rows you want before terms starts
const rowHeight = 28;      // 👈 must match your td height

const emptyRows = Math.max(0, minRows - items.length);
const dynamicHeight = emptyRows * rowHeight;
const handleCancel = async () => {
  if (!confirm("Cancel this challan?")) return;

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

    if (data.success) {

      setChallan((prev) => ({
        ...prev,
        status: "cancelled",
      }));

      toast({
        title: "Delivery Challan Cancelled",
        description: `Challan #${id} was cancelled successfully.`,
      });

    } else {

      toast({
        title: "Cannot Cancel Challan",
        description: data.message || "Unable to cancel challan.",
        variant: "destructive",
      });
    }

  } catch (err) {

    console.error(err);

    toast({
      title: "Server Error",
      description: "Something went wrong while cancelling challan.",
      variant: "destructive",
    });
  }
};

const handleDelete = async () => {
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

      onBack();

    } else {

      toast({
        title: "Cannot Delete Challan",
        description: data.message || "Completed challans cannot be deleted.",
        variant: "destructive",
      });
    }

  } catch (err) {

    console.error(err);

    toast({
      title: "Server Error",
      description: "Something went wrong while deleting challan.",
      variant: "destructive",
    });
  }
};

const fetchSettings = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings.php?type=store`);
    const data = await res.json();

    if (data) setStore(data);

  } catch (err) {
    console.error("Store fetch error:", err);
  }
};

useEffect(() => {
  if (!id) return;

  fetchSettings(); // ✅ ADD THIS

  fetch(`${API_BASE_URL}/get-delivery-challan.php?id=${id}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setChallan(data.challan);
        setItems(data.items || []);
      }
    });
}, [id]);

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
    "Delivery-Challan.pdf",
    { type: "application/pdf" }
  );

  try {

    await navigator.share({
      title: "Delivery Challan",
      text: `Delivery Challan for ${challan?.customer_name}`,
      files: [file]
    });

  } catch (err) {

    console.error(err);

  }
};

const th = {
  border: "1px solid black",
  padding: "8px",
  fontWeight: "bold",
  textAlign: "center"
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

  html2pdf().from(element).save();
};

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!id) return;

    fetch(`${API_BASE_URL}/get-delivery-challan.php?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChallan(data.challan);
          setItems(data.items || []);
        }
      })
      .catch(err => console.error(err));
  }, [id]);

  // 🔥 STATUS LOGIC
const getStatus = () => {
  if (!challan) return "loading";

  if (challan.status === "cancelled") return "cancelled";

  if (challan.status === "completed") return "returned";

const today = new Date();
today.setHours(0, 0, 0, 0);

const end = new Date(challan.end_date + "T00:00:00");
end.setHours(0, 0, 0, 0);

console.log("today", today);
console.log("end", end);

if (end.getTime() < today.getTime()) {
  return "overdue";
}

return "ongoing";
};


  // 🔥 PRINT

const handlePrint = () => {
  setTimeout(() => {
    window.print();
  }, 500);
};

  const generateHTML = () => {
    return `
      <h2>Delivery Challan #${id}</h2>
      <p><strong>Customer:</strong> ${challan.customer_name}</p>
      <p><strong>Phone:</strong> ${challan.customer_phone}</p>
      <p><strong>Period:</strong> ${challan.start_date} → ${challan.end_date}</p>

      <table>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Days</th>
        </tr>

        ${items.map(i => `
          <tr>
            <td>${i.product_name}</td>
            <td>${i.quantity_sent}</td>
            <td>${i.rental_days}</td>
          </tr>
        `).join("")}
      </table>
    `;
  };

  // 🔥 RETURN
  const handleReturn = async () => {
    if (!confirm("Are you sure you want to mark this as returned?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/return-challan.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challan_id: id }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Returned successfully");

        setChallan(prev => ({
          ...prev,
          status: "completed"
          
        }));

      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!id) return <div className="p-4">Invalid Challan</div>;
  if (!challan) return <div className="p-4">Loading...</div>;

  const status = getStatus();

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* BACK */}
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Back to Challans
      </button>

      {/* HEADER */}
<div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">

  <div className="flex justify-between items-center">

    {/* LEFT SIDE */}
    <div>
      <h1 className="text-2xl font-semibold">
        Delivery Challan #{id}
      </h1>

      <span className={`px-3 py-1 text-xs rounded-full ${
status === "ongoing"
  ? "bg-blue-100 text-blue-700"
  : status === "overdue"
  ? "bg-red-100 text-red-700"
  : status === "cancelled"
  ? "bg-gray-200 text-gray-700"
  : "bg-green-100 text-green-700"
      }`}>
        {status}
      </span>

      <p className="text-gray-500 mt-1">
        {challan.start_date} → {challan.end_date}
      </p>

{/* DOCUMENT FLOW */}
<div className="mt-4">

  {/* LABEL */}
  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
    Document Flow
  </div>

  {/* FLOW ITEMS */}
  <div className="flex flex-wrap items-center gap-2 text-sm">

    {/* QUOTATION */}
    {challan?.quotation_id && (
      <>
        <button
          onClick={() => {
            setSelectedQuotationId(challan.quotation_id);
            setActiveTab("quotation-details");
          }}
          className="
            inline-flex items-center
            rounded-full
            bg-blue-50
            hover:bg-blue-100
            text-blue-700
            px-3 py-1
            font-medium
            shadow-sm
            transition-all
            duration-200
          "
        >
          QT-{challan.quotation_id}
        </button>

        <span className="text-gray-300 text-xs">
          →
        </span>
      </>
    )}

    {/* CURRENT CHALLAN */}
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
        DC-{challan.id}
      </div>

      {challan?.invoice_id && (
        <span className="text-gray-300 text-xs">
          →
        </span>
      )}
    </>

{/* INVOICE */}
{challan?.invoice_id && (
  <button
    onClick={() => {
      setSelectedInvoiceId(challan.invoice_id);
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
    INV-{challan.invoice_id}
  </button>
)}
  </div>

</div>
    </div>

    {/* RIGHT SIDE BUTTONS (LIKE QUOTATION) */}
    <div className="flex gap-3">




      <button
        onClick={handlePrint}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Print
      </button>
      <button
        onClick={handleDownloadPDF}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Download PDF
      </button>



{challan.status !== "completed" && (
  <button
    onClick={() => {
      setSelectedChallanId(id);
      setActiveTab("return-challan");
    }}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Return & Inspect
  </button>
)}
      <Button
  className="bg-blue-600 hover:bg-blue-700"
  onClick={handleSharePDF}
>
  Share PDF
</Button>

{/* Cancel Challan */}
{challan.status !== "completed" &&
  challan.status !== "cancelled" && (
    <Button
      variant="outline"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200"
      onClick={handleCancel}
    >
      <XCircle className="h-4 w-4 mr-2" />
      Cancel Challan
    </Button>
)}

{/* Delete Challan */}
{challan.status !== "completed" && (
  <Button
    variant="destructive"
    className="shadow-sm hover:shadow-md transition-all duration-200"
    onClick={handleDelete}
  >
    <Trash2 className="h-4 w-4 mr-2" />
      Delete Challan
  </Button>
)}
    </div>

  </div>

</div>

      {/* CUSTOMER */}
      <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="font-medium mb-4">Customer</h2>
        <p><strong>{challan.customer_name}</strong></p>
        <p>{challan.customer_phone}</p>
      </div>



      {/* ITEMS */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-medium">Items</div>

        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Item</th>
              <th className="px-6 py-3 text-center">Qty</th>
              <th className="px-6 py-3 text-center">Days</th>
            </tr>
          </thead>

          <tbody>
            {items.map((i, index) => (
              <tr key={index} className="border-t">
                <td className="px-6 py-4">{i.product_name}</td>
                <td className="px-6 py-4 text-center">{i.quantity_sent}</td>
                <td className="px-6 py-4 text-center">{i.rental_days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

<div className="mt-10">
<br/>
  {/* HEADER */}
  <div className="flex items-start justify-between gap-4 mb-6">

  <div className="min-w-0">
    <h2 className="text-2xl font-semibold tracking-tight">
      Delivery Challan Preview
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Review the challan before printing or downloading.
    </p>
  </div>

  <div className="flex items-center gap-2 flex-shrink-0">

    <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
      A4 Format
    </div>

    <div className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
      Dispatch Copy
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

<div
  style={{
    width: "210mm",
    minHeight: "auto",
    padding: "10mm",
    fontFamily: "Arial",
    boxSizing: "border-box"
  }}
>
<div style={{ display: "flex", flexDirection: "column" }}></div>
    {/* HEADER */}
    <div style={{ border: "1px solid black", padding: "15px" }}>

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
            src="/Premier-Rentals/logo.jpg"
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

<div style={{
  border: "1px solid black",
  borderTop: "none",
  display: "flex",
  justifyContent: "space-between",
  padding: "10px"
}}>

  {/* LEFT */}
  <div>
    <b>To</b>
    <div style={{ marginTop: "5px" }}>
      <div>{challan.customer_name}</div>
      <div>{challan.customer_phone}</div>
    </div>
  </div>

  {/* RIGHT */}
  <div style={{ textAlign: "right", lineHeight: "1.6" }}>
    <div><b>Challan No:</b> DC-{id}</div>
    <div><b>Date:</b> {new Date().toLocaleDateString("en-GB")}</div>
  </div>

</div>

    {/* TABLE */}
   <table style={{ width: "100%", borderCollapse: "collapse" ,borderTop: "none"}}>
  <thead>
    <tr>
      <th style={{ ...th, width: "10%" }}>S.No</th>
      <th style={{ ...th, width: "65%", textAlign: "center" }}>
        PARTICULARS
      </th>
      <th style={{ ...th, width: "25%", textAlign: "center" }}>
        Qty
      </th>
    </tr>
  </thead>

  <tbody>
    {items.map((i, index) => (
      <tr key={index}>
        {/* S.NO */}
        <td style={{ ...td, textAlign: "center" }}>
          {String(index + 1).padStart(2, "0")}
        </td>

        {/* ITEM NAME */}
        <td style={{
          ...td,
          height: "28px",              // 👈 spacing like paper
          verticalAlign: "middle"
        }}>
          {i.product_name}
        </td>

        {/* QTY */}
        <td style={{
          ...td,
          textAlign: "center",
          fontWeight: "bold"
        }}>
          {i.quantity_sent}
        </td>
      </tr>
    ))}



  </tbody>
</table>


<div style={{
  height: `${dynamicHeight}px`,
  borderLeft: "1px solid black",
  borderRight: "1px solid black"
}} />

<div style={{
  border: "1px solid black",
  borderTop: "none",
  padding: "10px"
}}>

  <b>Terms & Conditions</b>

  <ul style={{ marginTop: "5px", paddingLeft: "15px", lineHeight: "1.6" }}>
    <li>Full Charges Collected If Articles Loss or Damages / Chipped</li>
    <li>Charges Apply Per Days Basis (24 Hrs)</li>
    <li>Goods Supplied / Received on Ground Floor Only</li>
    <li>Item Collection / Handover Responsibility Should be at your end</li>
  </ul>

  <div style={{ marginTop: "20px" }}>
    Received the above goods in good condition
  </div>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    marginTop: "40px"
  }}>

    <div>
      Receiver's Signature<br/>
      <div style={{ marginTop: "25px" }}>Name:</div>
    </div>

    <div style={{ textAlign: "right" }}>
      <b>For {store?.name?.toUpperCase()}</b><br/>
      <div style={{ marginTop: "25px" }}>Authorised Signatory</div>
    </div>

  </div>

</div>

  </div>
  
</div>
</div>
</div>
    </div>
    
  );
};