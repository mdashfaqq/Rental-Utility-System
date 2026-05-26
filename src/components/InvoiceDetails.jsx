import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { FILE_BASE_URL } from "@/services/api";
import html2pdf from "html2pdf.js";
import { Link } from "react-router-dom";
export const InvoiceDetails = ({
  id,
  onBack,
  setActiveTab,
  setSelectedQuotationId,
  setSelectedChallanId
}) => {
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [breakageItems, setBreakageItems] = useState([]);
const printRef = useRef();
  const [existingPaid, setExistingPaid] = useState(0);
  const [newPayment, setNewPayment] = useState("");
  const [saving, setSaving] = useState(false);
const [taxSettings, setTaxSettings] = useState({
  gstRate: 18,
  gstEnabled: true
});
const cell = {
  border: "1px solid black",
  padding: "6px"
};
  const [error, setError] = useState(null);
const [payments, setPayments] = useState([]);


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
    `Invoice-${invoice?.id || "document"}.pdf`,
    { type: "application/pdf" }
  );

  try {

    await navigator.share({
      title: "Invoice",
      text: `Invoice for ${invoice?.customer_name}`,
      files: [file]
    });

  } catch (err) {

    console.error(err);

  }
};
  const [rentalSettings, setRentalSettings] = useState({
    lateFee: 50
  });
const downloadPDF = async () => {
  const element = document.getElementById("print-section");

  // 🔥 WAIT for all images to load
  const images = element.getElementsByTagName("img");

  await Promise.all(
    Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();

      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );

  const opt = {
    margin: 0,
    filename: `invoice_${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    }
  };

  html2pdf().set(opt).from(element).save();
};




  const [store, setStore] = useState(null);
  const numberToWords = (num) => {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convertBelowThousand = (n) => {
    let str = "";

    if (n > 99) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n > 19) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str.trim();
  };

  if (num === 0) return "Zero";

  let result = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  if (crore) result += convertBelowThousand(crore) + " Crore ";
  if (lakh) result += convertBelowThousand(lakh) + " Lakh ";
  if (thousand) result += convertBelowThousand(thousand) + " Thousand ";
  if (hundred) result += convertBelowThousand(hundred);

  return result.trim();
};


const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

const td = {
  padding: "3px 2px",
  textAlign: "center",
  borderRight: "1px solid black"
};

const th = {
  padding: "6px 4px",
  fontWeight: "bold",
  // header bottom line
};

const innerCell = {
  borderTop: "1px solid black",
  borderRight: "1px solid black",
  borderBottom: "1px solid black",
  borderLeft: "none"   // 🔥 prevents double left line
};

const printTh = {
  padding: "8px 6px",
  fontWeight: "bold",
  textAlign: "center",
  borderRight: "1px solid black",
  borderBottom: "1px solid black"
};

const printTd = {
  padding: "6px 4px",
  textAlign: "center",
  borderRight: "1px solid black"
};


const getPrintThStyle = (extra = {}) => ({
  padding: "2px 4px",
  fontWeight: "bold",
  textAlign: "center",
  borderRight: "1px solid black",
  borderBottom: "1px solid black",
  fontSize: "12px",
  lineHeight: "1.1",
  ...extra
});

const getPrintTdStyle = (extra = {}) => ({
  padding: "2px 4px",
  textAlign: "center",
  borderRight: "1px solid black",
  borderBottom: "1px solid black",
  fontSize: "12px",
  lineHeight: "1.1",
  ...extra
});
useEffect(() => {
  const fetchSettings = async () => {
    try {
      // 🔹 STORE
      const storeRes = await fetch(`${API_BASE_URL}/settings.php?type=store`);
      const storeData = await storeRes.json();

      if (storeData) {
        setStore(storeData);
      }

      // 🔹 TAX (GST)
      const taxRes = await fetch(`${API_BASE_URL}/settings.php?type=tax`);
      const taxData = await taxRes.json();

let gstRate = 18;

if (Array.isArray(taxData)) {
  const row = taxData.find(i => i.key === "gstRate");
  gstRate = Number(row?.value || 18);
} else {
  gstRate = Number(taxData.gstRate || taxData.taxRate || 18);
}

let gstEnabled = true;

if (Array.isArray(taxData)) {

  const enabledRow =
    taxData.find(i => i.key === "gstEnabled");

  gstEnabled =
    enabledRow?.value === "1";
}

setTaxSettings({
  gstRate,
  gstEnabled
});

console.log("GST RATE:", gstRate);

    } catch (err) {
      console.error(err);
    }
  };

  fetchSettings();
}, []);

  // 🔥 FETCH DATA
  useEffect(() => {
    if (!id) {
      setError("Invalid invoice ID");
      return;
    }
  console.log("🔥 OPENING INVOICE ID:", id);
const fetchData = async () => {
  try {

    setError(null);

    // 🔹 Rental settings
    const settingsRes = await fetch(
      `${API_BASE_URL}/settings.php?type=rental`
    );

    const settingsData =
      await settingsRes.json();

    setRentalSettings({
      lateFee: Number(
        settingsData.late_fee_per_day || 50
      )
    });

    // 🔹 Invoice data
    const res = await fetch(
      `${API_BASE_URL}/get-invoice.php?id=${id}`
    );

    const data = await res.json();

    console.log("INVOICE API:", data);

    if (!data.success) {
      throw new Error(
        data.error ||
        data.message ||
        "Failed to load invoice"
      );
    }

    setInvoice(data.invoice);

    setItems(data.items || []);

    setBreakageItems(
      data.breakage_items || []
    );

    setExistingPaid(
      Number(data.invoice.paid_amount || 0)
    );

    // 🔥 PAYMENT HISTORY
const payRes = await fetch(
  `${API_BASE_URL}/invoice-payments.php?invoice_id=${id}`
);

    const payData =
      await payRes.json();

    setPayments(
      payData.payments || []
    );

  } catch (err) {

    console.error(err);

    setError(err.message);
  }
};
    fetchData();
  }, [id]);

  // 🔴 ERROR STATE
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        ❌ {error}
      </div>
    );
  }

  // ⏳ LOADING STATE
  if (!invoice) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading invoice...
      </div>
    );
  }
  

const baseTotal = items.reduce((sum, i) => {

  const qty =
    Number(i.quantity_sent || 0);

  const damaged =
    Number(i.damaged_qty || 0);

  const missing =
    Number(i.missing_qty || 0);

  const price =
    Number(i.price || 0);

  const fee =
    Number(i.damage_fee || 0);

  // ✅ rental applies to ALL rented qty
  
  const rental =
    qty * price;

  // ✅ damaged charges
  const breakage =
    damaged * fee;

  // ✅ missing replacement
const unitPrice =
  Number(i.unitPrice || 0);

const missingCost =
  missing * unitPrice;

  return (
    sum +
    rental +
    breakage +
    missingCost
  );

}, 0);



  const lateDays = (() => {
    const today = new Date();
    const end = new Date(invoice.end_date + "T00:00:00");

    const diff =
      (new Date(today.toDateString()) - new Date(end.toDateString())) /
      (1000 * 60 * 60 * 24);

    return diff > 0 ? diff : 0;
  })();

  const lateFee = lateDays * rentalSettings.lateFee;
const calculatedTotal =
  baseTotal ;
const gstEnabled =
  Number(invoice?.gst_enabled) === 1;
  // ✅ GST CALCULATION (SAFE POSITION)
const gstRate = taxSettings.gstRate || 18;

const subTotal = calculatedTotal;


const gstAmount =
  gstEnabled
    ? (subTotal * gstRate) / 100
    : 0;

const beforeDiscount =
  subTotal + gstAmount;

// ✅ saved DB total
const savedTotal =
  Number(invoice?.total_amount || 0);

// ✅ derive discount
const discount =
  beforeDiscount - savedTotal;

// ✅ final total
const grandTotal =
  savedTotal > 0
    ? savedTotal
    : beforeDiscount;
    console.log({
  beforeDiscount,
  savedTotal,
  discount,
  grandTotal
});

const amountInWords =
  "Rupees " +
  numberToWords(Math.round(grandTotal)) +
  " Only";

  const totalPaid = existingPaid + Number(newPayment || 0);
  const balance = Math.max(0, grandTotal - totalPaid);

  const paymentStatus =
    totalPaid === 0
      ? "pending"
      : totalPaid < grandTotal
      ? "partial"
      : "paid";

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* BACK */}
      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Back to Invoice
      </button>

      {/* HEADER */}
<div className="bg-white p-6 rounded-xl shadow mb-6 flex justify-between items-center">
{/* LEFT */}
<div>

  {/* TITLE */}
  <h1 className="text-2xl font-semibold">
    Invoice #{id}
  </h1>

  {/* DATE */}
  <p className="text-gray-500 mt-1">
    {invoice.start_date} → {invoice.end_date}
  </p>

{/* CUSTOMER */}
<div className="mt-4">
  <div className="text-2xl font-semibold text-gray-900 leading-tight">
    {invoice.customer_name}
  </div>

  {invoice.customer_phone && (
    <div className="mt-1 text-base text-gray-500">
      {invoice.customer_phone}
    </div>
  )}
</div>

  {/* FLOW */}
  <div className="mt-4">

    <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
      Document Flow
    </div>

    <div className="flex flex-wrap items-center gap-2 text-sm">

      {/* QUOTATION */}
      {invoice?.quotation_id && (
        <>
          <button
            onClick={() => {
              setSelectedQuotationId(invoice.quotation_id);
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
            "
          >
            QT-{invoice.quotation_id}
          </button>

          <span className="text-gray-400">→</span>
        </>
      )}

      {/* CHALLAN */}
      {invoice?.challan_id && (
        <>
          <button
            onClick={() => {
              setSelectedChallanId(invoice.challan_id);
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
            "
          >
            DC-{invoice.challan_id}
          </button>

          <span className="text-gray-400">→</span>
        </>
      )}

      {/* CURRENT INVOICE */}
{/* CURRENT INVOICE */}
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
  INV-{invoice.id}
</div>
    </div>
  </div>
</div>



  {/* RIGHT ACTIONS */}
  <div className="flex gap-2">

<Button
    style={{
    background: "#16a34a",
    color: "white",
    padding: "9px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }}
  onClick={() => {
    setTimeout(() => {
      window.print();
    }, 500); // 🔥 allow image to load
  }}
>
  Print
</Button>

<button
  onClick={downloadPDF}
  style={{
    background: "#16a34a",
    color: "white",
    padding: "9px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer"
  }}
>
  Download Invoice
</button>
<Button
  className="bg-blue-600 hover:bg-blue-700"
  onClick={handleSharePDF}
>
  Share PDF
</Button>
  </div>


</div>



{/* ITEMS */}
<div className="bg-white rounded-xl shadow mb-6 overflow-hidden">

  <table className="w-full text-sm">

    <thead className="bg-gray-50">
      <tr>

        <th style={{ ...th, borderLeft: "none" }}>
          S.No
        </th>

        <th style={{ ...th, textAlign: "left" }}>
          Item
        </th>

        <th style={th}>
          Qty Details
        </th>

        <th style={th}>
          Rental
        </th>

        <th style={th}>
          Damage
        </th>

        <th style={th}>
          Missing
        </th>

        <th style={{ ...th, borderRight: "none" }}>
          Total
        </th>

      </tr>
    </thead>

    <tbody>

      {items.map((i, idx) => {

        const qty =
          Number(i.quantity_sent || 0);

        const good =
          Number(i.good_qty || 0);

        const damaged =
          Number(i.damaged_qty || 0);

        const missing =
          Number(i.missing_qty || 0);

        const rentalPrice =
          Number(i.price || 0);

        const damageFee =
          Number(i.damage_fee || 0);

        const unitPrice =
          Number(i.unitPrice || 0);

        // rental applies to all rented qty
        const rental =
          qty * rentalPrice;

        // damaged charges
        const breakage =
          damaged * damageFee;

        // missing replacement
        const missingCost =
          missing * unitPrice;

        // final row total
        const rowTotal =
          rental +
          breakage +
          missingCost;

        return (

          <tr
            key={idx}
            className="border-t"
          >

            {/* SERIAL */}
            <td className="p-3 text-center">
              {idx + 1}
            </td>

            {/* ITEM */}
            <td className="p-3 font-medium">
              {i.product_name}
            </td>

            {/* QTY DETAILS */}
            <td className="p-3 text-center">

              <span className="block text-gray-700">
                Rented: {qty}
              </span>

              {good > 0 && (
                <span className="block text-green-600">
                  Good: {good}
                </span>
              )}

              {damaged > 0 && (
                <span className="block text-yellow-600">
                  Damaged: {damaged}
                </span>
              )}

              {missing > 0 && (
                <span className="block text-red-600">
                  Missing: {missing}
                </span>
              )}

            </td>

            {/* RENTAL */}
            <td className="p-3 text-center">

              <div>
                ₹{rentalPrice.toFixed(2)}
              </div>

              <div className="text-xs text-gray-500">
                {qty} × ₹{rentalPrice.toFixed(2)}
              </div>

              <div className="font-medium mt-1">
                ₹{rental.toFixed(2)}
              </div>

            </td>

            {/* DAMAGE */}
            <td className="p-3 text-center">

              {damaged > 0 ? (
                <>
                  <div className="text-yellow-600">
                    ₹{damageFee.toFixed(2)}
                  </div>

                  <div className="text-xs text-gray-500">
                    {damaged} × ₹{damageFee.toFixed(2)}
                  </div>

                  <div className="font-medium mt-1">
                    ₹{breakage.toFixed(2)}
                  </div>
                </>
              ) : (
                "-"
              )}

            </td>

            {/* MISSING */}
            <td className="p-3 text-center">

              {missing > 0 ? (
                <>
                  <div className="text-red-600">
                    ₹{unitPrice.toFixed(2)}
                  </div>

                  <div className="text-xs text-gray-500">
                    {missing} × ₹{unitPrice.toFixed(2)}
                  </div>

                  <div className="font-medium mt-1">
                    ₹{missingCost.toFixed(2)}
                  </div>
                </>
              ) : (
                "-"
              )}

            </td>

            {/* TOTAL */}
            <td className="p-3 text-center font-semibold">

              ₹{rowTotal.toFixed(2)}

            </td>

          </tr>
        );
      })}

    </tbody>

  </table>

</div>

      {/* CHARGES */}
<div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">

  {/* HEADER */}
  <div className="flex items-start justify-between mb-6">

    <div>
      <h2 className="text-[17px] font-semibold text-gray-800 tracking-tight">
        Charges Summary
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Complete invoice breakdown
      </p>
    </div>

    <div className="text-right">
      <p className="text-xs uppercase tracking-wide text-gray-400">
        Total
      </p>

      <h3 className="text-2xl font-bold text-gray-900">
        ₹{grandTotal.toFixed(2)}
      </h3>
    </div>

  </div>

  {/* CHARGE LIST */}
  <div className="space-y-2.5">

    {/* BASE TOTAL */}
    <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 bg-gray-50/70">

      <span className="text-sm text-gray-600">
        Base Total
      </span>

      <span className="text-sm font-semibold text-gray-800">
        ₹{baseTotal.toFixed(2)}
      </span>

    </div>

    {/* LATE FEE */}
    {/* <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 bg-gray-50/70">

      <span className="text-sm text-gray-600">
        Late Fee
      </span>

      <span className="text-sm font-semibold text-orange-600">
        ₹{lateFee.toFixed(2)}
      </span>

    </div> */}

    {/* GST */}
    {Number(invoice?.gst_enabled) === 1 && (
      <div className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 bg-gray-50/70">

        <span className="text-sm text-gray-600">
          GST ({Number(invoice?.gst_percentage || 0)}%)
        </span>

        <span className="text-sm font-semibold text-sky-600">
        ₹{
  Number(
    invoice?.gst_amount || 0
  ).toFixed(2)
}
        </span>

      </div>
    )}

    {/* DISCOUNT */}
    {Number(invoice?.discount_amount || 0) > 0 && (

      <div className="flex items-center justify-between rounded-xl border border-emerald-100 px-4 py-3 bg-emerald-50/60">

        <span className="text-sm text-emerald-700">
          Discount Applied
        </span>

        <span className="text-sm font-bold text-emerald-700">
          - ₹{
            Number(
              invoice?.discount_amount || 0
            ).toFixed(2)
          }
        </span>

      </div>
    )}

  </div>

  {/* FOOTER TOTAL */}
  <div className="mt-5 pt-4 border-t border-dashed border-gray-200">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-gray-500">
          Grand Total
        </p>

        <h3 className="text-3xl font-bold tracking-tight text-gray-900 mt-1">
          ₹{grandTotal.toFixed(2)}
        </h3>
      </div>

      <div
        className={`
          px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide
          ${
            paymentStatus === "paid"
              ? "bg-green-100 text-green-700"
              : paymentStatus === "partial"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }
        `}
      >
        {paymentStatus.toUpperCase()}
      </div>

    </div>

  </div>

</div>

{payments.length > 0 && (

  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">

    {/* HEADER */}
    <div className="flex items-center justify-between px-6 py-5 border-b bg-gradient-to-r from-green-50 to-emerald-50">

      <div>

        <h2 className="text-lg font-semibold text-gray-900">
          Payment History
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Invoice payment transactions & status
        </p>

      </div>

      <div
        className={`
          px-4 py-2 rounded-full text-xs font-semibold

          ${
            paymentStatus === "paid"
              ? "bg-green-100 text-green-700"

              : paymentStatus === "partial"
              ? "bg-yellow-100 text-yellow-700"

              : "bg-red-100 text-red-700"
          }
        `}
      >
        {paymentStatus.toUpperCase()}
      </div>

    </div>

    {/* SUMMARY */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50 border-b">

      {/* TOTAL */}
      <div className="bg-white rounded-xl p-4 border">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          Total Amount
        </p>

        <h3 className="text-2xl font-bold text-blue-600 mt-2">
          ₹{grandTotal.toFixed(2)}
        </h3>

      </div>

      {/* PAID */}
      <div className="bg-white rounded-xl p-4 border">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          Paid Amount
        </p>

        <h3 className="text-2xl font-bold text-green-600 mt-2">
          ₹{existingPaid.toFixed(2)}
        </h3>

      </div>

      {/* BALANCE */}
      <div className="bg-white rounded-xl p-4 border">

        <p className="text-xs uppercase tracking-wide text-gray-500">
          Balance
        </p>

        <h3 className="text-2xl font-bold text-red-600 mt-2">
          ₹{balance.toFixed(2)}
        </h3>

      </div>

    </div>

    {/* PAYMENTS */}
    <div className="divide-y">

      {payments.map((p) => (

        <div
          key={p.id}
          className="
            flex items-center justify-between
            px-6 py-4
            hover:bg-gray-50
            transition-colors
          "
        >

          {/* LEFT */}
          <div>

            <p className="font-medium text-gray-900 capitalize">
              {p.payment_method}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {new Date(
                p.created_at
              ).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>

          </div>

          {/* RIGHT */}
          <div className="text-right">

            <p className="text-lg font-bold text-green-600">
              ₹{Number(
                p.allocated_amount || p.amount
              ).toFixed(2)}
            </p>

            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Payment
            </p>

          </div>

        </div>

      ))}

    </div>

  </div>

)}
      {/* PAYMENT */}
      {/* <div className="bg-white p-6 rounded-xl shadow space-y-4">

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p>Total</p>
            <p className="font-bold">₹{grandTotal}</p>
          </div>
          <div>
            <p>Paid</p>
            <p className="text-green-600">₹{existingPaid}</p>
          </div>
          <div>
            <p>Balance</p>
            <p className="text-red-600">₹{balance}</p>
          </div>
        </div>

        {existingPaid < grandTotal && (
          <>
            <input
              type="number"
              value={newPayment}
              onChange={(e) => setNewPayment(e.target.value)}
              className="w-full border p-3 rounded"
              placeholder="Enter payment"
            />

            <Button
              disabled={saving}
              onClick={async () => {
                if (Number(newPayment) <= 0) {
                  alert("Enter valid amount");
                  return;
                }

                setSaving(true);

                try {
                  const res = await fetch(`${API_BASE_URL}/update-payment.php`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      invoice_id: id,
                      paid_amount: Number(newPayment),
                      total_amount: grandTotal,
                      damage_fee: damageTotal,
                      late_fee: lateFee
                    })
                  });

                  const data = await res.json();

                  if (data.success) {
                    setExistingPaid(data.paid_amount);
                    setNewPayment("");
                  }

                } catch (err) {
                  console.error(err);
                }

                setSaving(false);
              }}
            >
              {saving ? "Saving..." : "Add Payment"}
            </Button>
          </>
        )}

        {existingPaid >= grandTotal && (
          <div className="text-green-600 font-medium">
            ✅ Fully Paid
          </div>
        )}
      </div> */}

      <div className="mt-10">

  {/* TOP BAR */}
  <div className="flex items-center justify-between mb-5">

    <div>
      <h2 className="text-2xl font-semibold tracking-tight">
        Invoice Preview
      </h2>

      <p className="text-sm text-gray-500 mt-1">
        Review the generated invoice before printing or downloading.
      </p>
    </div>

    <div className="flex items-center gap-2">

      <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
        A4 Format
      </div>

      <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        Ready to Print
      </div>

    </div>
  </div>

  {/* PREVIEW AREA */}
  <div className="rounded-3xl border bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-10 overflow-auto mb-5"></div>
    <div
id="print-section"
className="
  bg-white
  flex-shrink-0
  mx-auto
  border border-gray-300
  shadow-[0_25px_60px_rgba(0,0,0,0.18)]
  rounded-sm
"
  style={{
    width: "794px",
    overflow: "hidden",
    marginTop: "20px",
    marginBottom: "20px"
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

  <div style={{
  border: "2px solid black",
  padding: "15px"
}}>

  <div style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center" // 🔥 vertical center like reference
  }}>

    {/* LEFT SIDE */}
    <div style={{ width: "60%" }}>
      
<h1 style={{
  margin: 0,
fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "28px",
  fontWeight: "bold",
  letterSpacing: "1px",
  color: "#1f3d2b"
}}>
  {store?.name}
</h1>

      <p style={{ margin: "4px 0" }}>{store?.address}</p>
      <p style={{ margin: "4px 0" }}> Mobile : {store?.phone}</p>
      <p style={{ margin: "4px 0" }}>Email : {store?.email}</p>

    </div>

    {/* RIGHT SIDE */}
    <div style={{
      width: "40%",
      textAlign: "right",
      position: "relative"
    }}>

      {/* GST TOP RIGHT */}
      <div style={{
        position: "absolute",
        top: "-5px",
        right: "0",
        fontWeight: "bold"
      }}>
        GSTIN: {store?.gstNumber}
      </div>
<br/>
      {/* BIG LOGO */}
<img
src="/Premier-Rentals/logo.jpg"
  style={{
    width: "300px",
    height: "110px",
    objectFit: "stretch",
  }}
/>

    </div>

  </div>

  {/* CATEGORY STRIP */}
<div
  style={{
    borderTop: "2px solid green",
    borderBottom: "2px solid green",
    textAlign: "center",
    fontWeight: "bold",
    padding: "5px",
    marginTop: "10px",
    whiteSpace: "nowrap",
    fontSize: "12px",
  }}
>
  CROCKERY | CUTLERY | GLASS WARES | BUFFET WARES | KITCHEN WARES | COOLERS | FURNITURES
</div>

</div>

  <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    border: "2px solid black",
    tableLayout: "fixed"
  }}
>

  <colgroup>
  <col style={{ width: "7%" }} />
  <col style={{ width: "45%" }} />
  <col style={{ width: "10%" }} />
  <col style={{ width: "12%" }} />
  <col style={{ width: "10%" }} />
  <col style={{ width: "18%" }} />
</colgroup>

  <tbody>

    {/* TITLE */}
    <tr>
      <td colSpan="6" style={{
        textAlign: "center",
        fontWeight: "bold",
        borderBottom: "2px solid black",
        padding: "6px"
      }}>
        INVOICE
      </td>
    </tr>

{/* CUSTOMER + META */}
<tr>

  {/* LEFT SIDE */}
  <td
    colSpan="2"
    rowSpan="6"
    style={{
      border: "1px solid black",
      verticalAlign: "top",
      padding: "0",
      fontSize: "12px",
      lineHeight: "1.2",
      fontFamily: "Times New Roman"
    }}
  >

    {/* BILL TO */}
    <div
      style={{
        borderBottom: "1px solid black",
        fontWeight: "bold",
        padding: "5px 6px",
        fontSize: "14px"
      }}
    >
      Bill To
    </div>

    {/* CUSTOMER CONTENT */}
    <div style={{ padding: "3px 6px" }}>

      <div style={{ fontWeight: "bold" }}>
        {invoice.customer_name}
      </div>

      <div>
        {invoice.customer_address}
      </div>

      <div>
        {invoice.customer_city}
      </div>

      {invoice.contact_person && (
        <div>
          Attn: {invoice.contact_person}
        </div>
      )}

      {invoice.department && (
        <div style={{ fontWeight: "bold", marginTop: "3px" }}>
          {invoice.department}
        </div>
      )}

      {invoice.gstin && (
  <div style={{ fontWeight: "bold", marginTop: "3px" }}>
  GSTIN - {invoice?.gstin || "-"}
</div>
      )}

    </div>
  </td>

  {/* RIGHT HEADER */}
  <td
    colSpan="4"
    style={{
      border: "1px solid black",
      background: "#dbe4f0",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "14px",
      padding: "3px",
      fontFamily: "Times New Roman"
    }}
  >
   Vendor Code : {invoice.customer_code || "-"}
  </td>
</tr>

{/* ROW 1 */}
<tr>
  <td style={getPrintThStyle()}>
    Invoice Date 
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.invoice_created_date}
  </td>

  <td style={getPrintThStyle()}>
    Invoice No
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.invoice_no_formatted}
  </td>
</tr>

{/* ROW 2 */}
<tr>
  <td style={getPrintThStyle()}>
    DC Date
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.challan_created_date}
  </td>

  <td style={getPrintThStyle()}>
    DC No
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.dc_no_formatted}
  </td>
</tr>

{/* ROW 3 */}
<tr>
  <td style={getPrintThStyle()}>
    Quo Date
  </td>

  <td style={getPrintTdStyle()}> {invoice.start_date}</td>

  <td style={getPrintThStyle()} />

  <td style={getPrintTdStyle()} />
</tr>

{/* ROW 4 */}
<tr>
  <td style={getPrintThStyle()}>
    PO/WO No
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.po_number || ""}
  </td>

  <td style={getPrintThStyle()}>
    GRN NO
  </td>

  <td style={getPrintTdStyle()}>
    {invoice.grn_no || ""}
  </td>
</tr>


{/* ROW 5 */}
<tr>

  {/* LABEL */}
  <td
    style={{
      borderRight: "1px solid black",
      borderBottom: "1px solid black",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "12px",
      fontFamily: "Times New Roman",
      padding: "2px 4px",
      lineHeight: "1.1",
      verticalAlign: "middle"
    }}
  >
    Place of Delivery
  </td>


  {/* VALUE */}
  <td
    colSpan="3"
    style={{
      borderBottom: "1px solid black",
      textAlign: "center",
      fontSize: "12px",
      fontFamily: "Times New Roman",
      padding: "3px 6px",
      lineHeight: "1.15",
      verticalAlign: "middle"
    }}
  >
    {invoice.delivery_address}
  </td>

</tr>
   {/* HEADER */}
<tr>
  <td
    colSpan="7"
    style={{
      border: "1px solid black",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "14px",
      padding: "4px 0",
      fontFamily: "Times New Roman",
      letterSpacing: "0.5px",
    }}
  >
    HIRING ITEM PER DAY CHARGES
  </td>
</tr>
<tr style={{ borderTop: "1px solid black" }}>

  <th style={{ ...printTh, borderLeft: "none" }}>
    S.No
  </th>

  <th style={{
    ...printTh,
    textAlign: "left"
  }}>
    Item Description
  </th>

  <th style={printTh}>
    Qty
  </th>

  <th style={printTh}>
    Rental
  </th>

  <th style={printTh}>
    Extra Charges
  </th>

  <th style={{ ...printTh, borderRight: "none" }}>
    Total (₹)
  </th>

</tr>

{/* RENTAL ITEMS */}
{items.map((i, idx) => {

  const qty =
    Number(i.quantity_sent || 0);

  const rentalPrice =
    Number(i.price || 0);

  const rentalDays =
    Number(i.rental_days || 1);

  const rental =
    qty * rentalPrice;


  return (

    <tr key={idx}>

      {/* SERIAL */}
      <td style={{
        ...td,
        borderLeft: "none",
        textAlign: "center"
      }}>
        {idx + 1}
      </td>


      {/* ITEM */}
      <td style={{
        ...td,
        textAlign: "left",
        fontWeight: "600"
      }}>
        {i.product_name}
      </td>


      {/* QTY */}
      <td style={{
        ...td,
        textAlign: "center"
      }}>
        {qty}
      </td>


      {/* UNIT PRICE */}
      <td style={{
        ...td,
        textAlign: "center"
      }}>
        ₹{rentalPrice.toFixed(2)}
      </td>


      {/* DAYS */}
      <td style={{
        ...td,
        textAlign: "center"
      }}>
        {rentalDays}
      </td>


      {/* RATE */}
      <td style={{
        ...td,
        borderRight: "none",
        textAlign: "center",
        fontWeight: "bold"
      }}>
        ₹{rental.toFixed(2)}
      </td>

    </tr>
  );
})}


{/* BREAKAGE / MISSING TITLE */}
{breakageItems.length > 0 && (

  <tr>

    <td
      colSpan={6}
      style={{
        ...td,
        fontWeight: "700",
        textAlign: "left",
        background: "#f8fafc",
        color: "#111827",
        fontSize: "14px",
        letterSpacing: "0.3px",
        borderTop: "1px solid  black",
        borderBottom: "1px solid black"
      }}
    >
      Breakage / Missing Charges
    </td>

  </tr>
)}



{/* BREAKAGE ITEMS */}
{breakageItems.map((b, idx) => {

  const isLast =
    idx === breakageItems.length - 1;

  const isMissing =
    b.type === "missing";

  return (

    <tr
      key={idx}
      style={{
        background:
          isMissing
            ? "#fef2f2"
            : "#fffaf0",

        height: "28px"
      }}
    >

      {/* SERIAL */}
      <td style={{
        ...td,
        borderLeft: "none",
        padding: "2px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.1",

        color:
          isMissing
            ? "#dc2626"
            : "#b45309",

        fontWeight: "700",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>
        {idx + 1}
      </td>


      {/* ITEM */}
      <td style={{
        ...td,
        padding: "2px 6px",
        textAlign: "left",
        verticalAlign: "middle",
        lineHeight: "1.1",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          flexWrap: "wrap",
        }}>

          {/* PRODUCT NAME */}
          <div style={{
            fontWeight: "700",
            fontSize: "13px",

            color:
              isMissing
                ? "#dc2626"
                : "#b45309"
          }}>
            {b.product_name}
          </div>


          {/* BADGE */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",

            background:
              isMissing
                ? "#fee2e2"
                : "#fef3c7",

            color:
              isMissing
                ? "#dc2626"
                : "#b45309",

            padding: "1px 6px",
            borderRadius: "999px",
            fontSize: "9px",
            fontWeight: "700",
            lineHeight: "1"
          }}>

            {isMissing
              ? "Missing Item"
              : "Damaged Item"}

          </div>

        </div>

      </td>


      {/* QTY */}
      <td style={{
        ...td,
        padding: "2px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.1",
        fontWeight: "700",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>
        {b.qty}
      </td>


      {/* UNIT PRICE */}
      <td style={{
        ...td,
        padding: "2px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.1",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>

        <div style={{
          fontWeight: "700",
          fontSize: "13px"
        }}>
          ₹{Number(b.price).toFixed(2)}
        </div>

        <div style={{
          marginTop: "0px",
          fontSize: "9px",
          lineHeight: "1",
          color: "#9ca3af"
        }}>
          Per Item
        </div>

      </td>


      {/* DAYS */}
      <td style={{
        ...td,
        padding: "2px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.1",
        color: "#9ca3af",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>
        —
      </td>


      {/* RATE */}
      <td style={{
        ...td,
        borderRight: "none",
        padding: "2px 6px",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "1.1",

        borderBottom:
          isLast
            ? "1px solid black"
            : "1px solid #f3f4f6"
      }}>

        <div style={{
          fontWeight: "800",
          fontSize: "13px",

          color:
            isMissing
              ? "#dc2626"
              : "#b45309"
        }}>
          ₹{Number(b.total).toFixed(2)}
        </div>

      </td>

    </tr>
  );
})}

{/* 🔹 ROW → BANK + GST + GRAND TOTAL */}
{/* 🔹 ROW 1 → BANK + TOTAL */}
<tr>

  {/* LEFT → BANK */}
  <td colSpan="4" style={{ padding: 0, border: "none", verticalAlign: "top" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>

        <tr>
          <td colSpan="4" style={{
            textAlign: "center",
            fontWeight: "bold",
            padding: "4px",
            borderBottom: "1px solid black",
            borderTop:"1px solid black"
          }}>
            BANK DETAILS
          </td>
        </tr>

        <tr style={{borderRight:"none"}}>
          <td style={innerCell}>BANK NAME</td>
          <td style={innerCell}>BRANCH NAME</td>
          <td style={innerCell}>BANK A/C No</td>
          <td style={innerCell}>IFSC CODE</td>
        </tr>

        <tr>
          <td style={innerCell}>City Union Bank</td>
          <td style={innerCell}>Chromepet</td>
          <td style={innerCell}>510909010027240</td>
          <td style={innerCell}>CIUB0000432</td>
        </tr>

      </tbody>
    </table>
  </td>

  {/* RIGHT → TOTAL BLOCK */}
  <td colSpan="2" style={{ padding: 0, verticalAlign: "top" , borderLeft: "1px solid black"}}>

<table style={{
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed"
}}>
      <tbody>
<tr>
  <td style={innerCell}>Total</td>
  <td style={{ ...innerCell, textAlign: "right" }}>
    ₹ {subTotal.toFixed(2)}
  </td>
</tr>

{gstEnabled && (
  <tr>
    <td style={innerCell}>
      GST ({Number(invoice?.gst_percentage || 0)}%)
    </td>

    <td
      style={{
        ...innerCell,
        textAlign: "right"
      }}
    >
      ₹{
  Number(
    invoice?.gst_amount || 0
  ).toFixed(2)
}
    </td>
  </tr>
)}
{Number(invoice?.discount_amount || 0) > 0 && (
  <tr>
    <td style={{
      ...innerCell,
      color: "#dc2626",
      fontWeight: "bold"
    }}>
      Discount
    </td>

    <td style={{
      ...innerCell,
      textAlign: "right",
      color: "#dc2626",
      fontWeight: "bold"
    }}>
      - ₹ {
        Number(
          invoice?.discount_amount || 0
        ).toFixed(2)
      }
    </td>
  </tr>
)}
<tr>
  <td style={{
    ...innerCell,
    fontWeight: "bold",
    textAlign: "center",
    background: "#dbeafe"
  }}>
    Grand Total (roundoff)
  </td>

  <td style={{
    ...innerCell,
    textAlign: "right",
    fontWeight: "bold"
  }}>
    ₹ {grandTotal.toFixed(2)}
  </td>
</tr>

      </tbody>
    </table>

  </td>

</tr>
<tr>
  <td colSpan="6" style={{
    border: "1px solid black",
    textAlign: "center",
    fontWeight: "bold",
    padding: "4px"
  }}>
    Total Invoice amount in words
  </td>
</tr>

<tr>
  <td colSpan="6" style={{
    border: "1px solid black",
    textAlign: "center",
    fontWeight: "bold",
    padding: "4px"
  }}>
    {amountInWords}
  </td>
</tr>

<tr>
  <td colSpan="6" style={{
    border: "1px solid black",
    textAlign: "center",
    padding: "4px",
    fontSize: "12px"
  }}>
    We declare that the invoice shows the actual price of the goods described and that all particulars are true and correct
  </td>
</tr>
<tr>
  <td colSpan="3" style={{
    border: "1px solid black",
    height: "80px",
    verticalAlign: "bottom",
    padding: "6px"
  }}>
    Receiver Name & Signature<br/>
    Date -
  </td>

  <td colSpan="3" style={{
    border: "1px solid black",
    height: "80px",
    textAlign: "right",
    verticalAlign: "bottom",
    padding: "6px"
  }}>
    Authorised signatory
  </td>
</tr>
  </tbody>
</table>

  </div>
</div>

  </div>
</div>

    
  );
};