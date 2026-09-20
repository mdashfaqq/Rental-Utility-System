import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { API_BASE_URL, settingsApi } from '@/services/api';
import { useEffect } from 'react'; 
import { IndianRupee } from "lucide-react";
import React from "react";
import * as XLSX from "xlsx-js-style";
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  FileText,
  Download,
  Filter,
  AlertTriangle
} from 'lucide-react';


export const Reports = () => {
  const { t } = useLanguage();
  const { transactions, products, categories, vendors } = useData();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [inventoryDateFrom, setInventoryDateFrom] = useState('');
  const [inventoryDateTo, setInventoryDateTo] = useState('');
  const [financialDateFrom, setFinancialDateFrom] = useState('');
  const [financialDateTo, setFinancialDateTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [customerDateFrom, setCustomerDateFrom] = useState("");
const [customerDateTo, setCustomerDateTo] = useState("");
const [settings, setSettings] = useState<any>({});
const [invoices, setInvoices] = useState<any[]>([]);
const [customerSearch, setCustomerSearch] = useState("");
const [movements, setMovements] = useState<any[]>([]);
console.log(
  "RENDER MOVEMENTS",
  movements
);
const [payments, setPayments] = useState<any[]>([]);
const [customerYearlyReport, setCustomerYearlyReport] = useState<any[]>([]);
const [monthlyLedgerData, setMonthlyLedgerData] =
  useState<any[]>([]);
const currentMonth =
  String(new Date().getMonth() + 1);

const [selectedMonth, setSelectedMonth] =
  useState(currentMonth);
const resetFilters = () => {
  // SALES
  setDateFrom('');
  setDateTo('');
  setAppliedFrom('');
  setAppliedTo('');

  // INVENTORY
  setInventoryDateFrom('');
  setInventoryDateTo('');

  // FINANCIAL
  setFinancialDateFrom('');
  setFinancialDateTo('');

  // CUSTOMER
  setCustomerSearch('');
  setCustomerDateFrom('');
  setCustomerDateTo('');

  // DROPDOWNS
  setSelectedCategory('all');
  setSelectedVendor('all');

  setFilteredProducts(products);
};


const fetchCustomerYearlyReport = async () => {
  try {

    const res = await fetch(
      `${API_BASE_URL}/get-customer-yearly-report.php`
    );

    const data = await res.json();

    if (data.success) {
      setCustomerYearlyReport(data.data || []);
    }

  } catch (err) {
    console.error(
      "Failed to load customer yearly report",
      err
    );
  }
};
useEffect(() => {
  fetchCustomerYearlyReport();
}, []);

const filteredMonthlyLedgerData =
  monthlyLedgerData.filter((row: any) => {

    if (selectedMonth === "all")
      return true;

    return (
      String(row.invoice_month) ===
      selectedMonth
    );
  });
const fetchMonthlyLedgerData = async () => {

  try {

    const res = await fetch(
      `${API_BASE_URL}/get-invoices.php`
    );

    const data = await res.json();

    if (data.success) {

      setMonthlyLedgerData(
        data.data || []
      );

    } else {


    }

  } catch (error) {

    console.error(error);

  
  }
};

useEffect(() => {

  fetchMonthlyLedgerData();

}, []);

const filteredYearlyReport = useMemo(() => {

  return customerYearlyReport.filter((r: any) => {

    const search =
      customerSearch.toLowerCase();

    return (
      (r.customer_name || "")
        .toLowerCase()
        .includes(search)

      ||

      (r.customer_phone || "")
        .toLowerCase()
        .includes(search)
    );
  });

}, [
  customerYearlyReport,
  customerSearch
]);



const fetchPayments = async () => {
  try {

const res = await fetch(
  `${API_BASE_URL}/payments.php`
);

    const data = await res.json();

    console.log(data);

    if (data.success) {
      setPayments(data.payments || []);
    }

  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchPayments();
}, []);


console.log("PAYMENTS STATE:", payments);

const fetchMovements = async () => {

  try {

    console.log("FETCH START");

    const response = await fetch(
      `${API_BASE_URL}/stock_movements.php`
    );

    console.log(
      "RAW RESPONSE",
      response
    );

    const text = await response.text();

    console.log(
      "RAW TEXT",
      text
    );

    const data = JSON.parse(text);

    console.log(
      "MOVEMENTS ARRAY",
      data
    );

    setMovements(data || []);

  } catch (error) {

    console.error(
      "Failed to fetch movements",
      error
    );

  }

}

useEffect(() => {


  fetchMovements();

}, []);
useEffect(() => {

  console.log(
    "MOVEMENTS UPDATED",
    movements
  );

}, [movements]);


useEffect(() => {
  fetch(`${API_BASE_URL}/settings.php?type=tax`)
    .then(res => res.json())
    .then(data => {
      console.log("RAW SETTINGS:", data);

      // ✅ directly set (NO success check, NO data.data)
      setSettings(data);
    });
}, []);

const GST = useMemo(() => {
  const rate = Number(settings?.gstRate);

  if (!rate) return null; // 👈 important
 console.log("REAL GST:", rate);
  return rate / 100;
}, [settings]);



const taxData = useMemo(() => {
  const rate = Number(settings?.gstRate) || 0;
  const gst = rate / 100;

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0),
    0
  );

const totalTax = invoices.reduce(
  (sum, inv) => sum + Number(inv.gst_amount || 0),
  0
);


  return {
    gst,
    totalTax,
    cgst: totalTax / 2,
    sgst: totalTax / 2
  };
}, [settings, invoices]);

const isInRange = (
  date: string | Date,
  from?: string,
  to?: string
) => {

  const d = new Date(
    typeof date === "string"
      ? date.replace(" ", "T")
      : date
  ).getTime();

  const f = from
    ? new Date(from).setHours(0, 0, 0, 0)
    : 0;

  const t = to
    ? new Date(to).setHours(
        23,
        59,
        59,
        999
      )
    : Infinity;

  return d >= f && d <= t;
};


useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-invoices.php`);
      const data = await res.json();

      console.log("INVOICES:", data); // debug
      console.log(
  "GST Values:",
  data.data.map(i => i.gst_amount)
);

      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Invoice fetch error:", err);
    }
  };

  fetchInvoices();
}, []);

const [appliedFrom, setAppliedFrom] = useState("");
const [appliedTo, setAppliedTo] = useState("");
const [loading, setLoading] = useState(false);
const salesReport = useMemo(() => {
  return invoices.filter((invoice) => {
if (!invoice.created_at) return false;

const invoiceDate = new Date(invoice.created_at);

    if (appliedFrom) {
      const from = new Date(appliedFrom);
      from.setHours(0, 0, 0, 0);

      if (invoiceDate < from) {
        return false;
      }
    }

    if (appliedTo) {
      const to = new Date(appliedTo);
      to.setHours(23, 59, 59, 999);

      if (invoiceDate > to) {
        return false;
      }
    }

    return true;
  });
}, [invoices, appliedFrom, appliedTo]);


const applyFilter = () => {
  setLoading(true);

  setTimeout(() => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
    setLoading(false);
  }, 300); // simulate real API delay


};


console.log(transactions[0]);
  // Calculate key metrics
  const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
const totalInvoices = invoices.length;

const totalRevenue = invoices.reduce(
  (sum, inv) => sum + Number(inv.total_amount || 0),
  0
);

const avgInvoiceValue = totalRevenue / Math.max(totalInvoices, 1);
const outstandingBalance = invoices.reduce(
  (sum, inv) =>
    sum +
    (
      Number(inv.total_amount || 0) -
      Number(inv.paid_amount || 0)
    ),
  0
);

useEffect(() => {
  let filtered = [...products];

  // Category filter
  if (selectedCategory !== "all") {
    filtered = filtered.filter(
      (p) => p.category === selectedCategory
    );
  }

  // Vendor filter
  if (selectedVendor !== "all") {
    filtered = filtered.filter(
      (p) => p.vendor === selectedVendor
    );
  }

  setFilteredProducts(filtered);
}, [selectedCategory, selectedVendor, products]);

useEffect(() => {

  const fetchProducts = async () => {

    try {

      const res = await fetch(
        `${API_BASE_URL}/products.php?from=${inventoryDateFrom}&to=${inventoryDateTo}`
      );

      const data = await res.json();

      setFilteredProducts(data);
      

    } catch (err) {

      console.error(err);

    }

  };

  fetchProducts();
  console.log(
`${API_BASE_URL}/products.php?from=${inventoryDateFrom}&to=${inventoryDateTo}`
);

}, [
  inventoryDateFrom,
  inventoryDateTo
]);

  const generateSalesReport = () => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
      const fromDate = dateFrom || '2020-01-01';
      const toDate = dateTo || '2030-12-31';
      return transactionDate >= fromDate && transactionDate <= toDate;
    });

    return filteredTransactions;
  };

  
  const exportSalesCSV = () => {
  if (!salesReport.length) return;

  const csv = [
    ["Date", "Transaction ID", "Items", "Payment", "Amount"],
    ...salesReport.map((t) => [
      new Date(t.timestamp).toLocaleDateString("en-IN"),
      t.id,
      t.items?.length || 0,
      t.paymentMethod,
      t.total,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sales-report.csv";
  a.click();
};




const exportCustomerYearlyExcel = () => {

  if (!customerYearlyReport.length) return;

  const data = [

    [
      "Customer",
      "FY",

      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",

      "Total",
      "Received",
      "Balance"
    ],

...customerYearlyReport.flatMap((r: any, index: number) => {

  const previousCustomer =
    index > 0
      ? customerYearlyReport[index - 1].customer_name
      : null;

  const isNewCustomer =
    previousCustomer !== r.customer_name;

  const rows = [];

  // ADD GAP ROW
if (isNewCustomer && index !== 0) {

  rows.push([
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    " "
  ]);
}

  // MAIN DATA ROW
  rows.push([

    r.customer_name,
    r.financial_year,

    r.apr || 0,
    r.may || 0,
    r.jun || 0,
    r.jul || 0,
    r.aug || 0,
    r.sep || 0,
    r.oct || 0,
    r.nov || 0,
    r.dec || 0,
    r.jan || 0,
    r.feb || 0,
    r.mar || 0,

    r.total || 0,
    r.received || 0,
    r.balance || 0,

  ]);

  return rows;
}),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const range = XLSX.utils.decode_range(ws["!ref"] || "");

  // COLUMN WIDTHS
  ws["!cols"] = [
    { wch: 25 },
    { wch: 12 },

    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },

    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  // STYLING
  for (let R = range.s.r; R <= range.e.r; ++R) {

    for (let C = range.s.c; C <= range.e.c; ++C) {

      const cellAddress =
        XLSX.utils.encode_cell({ r: R, c: C });

      if (!ws[cellAddress]) continue;

      // BASE STYLE
      ws[cellAddress].s = {

        border: {
          top: { style: "thin", color: { rgb: "D1D5DB" } },
          bottom: { style: "thin", color: { rgb: "D1D5DB" } },
          left: { style: "thin", color: { rgb: "D1D5DB" } },
          right: { style: "thin", color: { rgb: "D1D5DB" } },
        },

        alignment: {
          vertical: "center",
          horizontal: C >= 2 ? "right" : "left",
        },

        font: {
          name: "Calibri",
          sz: 11,
        }
      };

      // HEADER ROW
// CUSTOMER GAP ROW
if (R > 0) {

  const firstCell =
    XLSX.utils.encode_cell({ r: R, c: 0 });

  const firstValue =
    ws[firstCell]?.v;

  if (firstValue === " ") {

    ws[cellAddress].s = {

      fill: {
        fgColor: { rgb: "E2E8F0" }
      },

      border: {
        top: { style: "thin", color: { rgb: "E2E8F0" } },
        bottom: { style: "thin", color: { rgb: "E2E8F0" } },
        left: { style: "thin", color: { rgb: "E2E8F0" } },
        right: { style: "thin", color: { rgb: "E2E8F0" } },
      }
    };
  }
}

      // TOTAL COLUMN
      if (C === 14) {

        ws[cellAddress].s.fill = {
          fgColor: { rgb: "E3F2FD" }
        };

        ws[cellAddress].s.font = {
          bold: true
        };
      }

      // RECEIVED COLUMN
      if (C === 15) {

        ws[cellAddress].s.fill = {
          fgColor: { rgb: "E8F5E9" }
        };

        ws[cellAddress].s.font = {
          bold: true,
          color: { rgb: "2E7D32" }
        };
      }

      // BALANCE COLUMN
      if (C === 16) {

        ws[cellAddress].s.fill = {
          fgColor: { rgb: "FFEBEE" }
        };

        ws[cellAddress].s.font = {
          bold: true,
          color: { rgb: "C62828" }
        };
      }
    }
  }

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Customer Yearly Report"
  );

  XLSX.writeFile(
    wb,
    "customer-yearly-report.xlsx"
  );
};


const exportMonthlyLedgerExcel = () => {

  if (!monthlyLedgerData.length) return;

  const gstPercentage =
    Number(settings?.gstPercentage || 18);

  const wb = XLSX.utils.book_new();

  // =====================================
  // GROUP DATA BY MONTH + YEAR
  // =====================================

  const groupedData: any = {};

  monthlyLedgerData.forEach((row: any) => {

    const date =
      new Date(row.invoice_date);

    const month =
      date.toLocaleString("default", {
        month: "short"
      });

    const year =
      date.getFullYear();

    const sheetName =
      `${month} ${year}`;

    if (!groupedData[sheetName]) {
      groupedData[sheetName] = [];
    }

    groupedData[sheetName].push(row);
  });

  // =====================================
  // CREATE EACH SHEET
  // =====================================

  Object.keys(groupedData).forEach(
    (sheetName) => {

      const rows =
        groupedData[sheetName];

      const data = [

        // TITLE
        [
          "",
          "",
          "",
          "PREMIER PARTY RENTAL"
        ],

        // SUBTITLE
        [
          "",
          "",
          "",
          `STATEMENT OF ACCOUNTS FOR ${sheetName.toUpperCase()}`
        ],

        // SECTION
        [
          "",
          "",
          "",
          "HIRE BILLS"
        ],

        [],

        // HEADER
[
  "S.No",
  "Invoice Date",
  "Invoice No",
  "DC Date",
  "DC No",
  "Hotel Name",

  "Subtotal",
  "Discount",
  "Taxable",
  "GST",

  "Transport",
  "Transport GST",

  "Grand Total"
],

        // DATA
...rows.map(
  (r: any, index: number) => {

    const subtotal =
      Number(r.subtotal || 0);

    const discount =
      Number(r.discount_amount || 0);

    const taxable =
      subtotal - discount;

    const gstAmount =
      Number(r.gst_amount || 0);

    const gstPercentage =
      Number(r.gst_percentage || 0);

    const transport =
      Number(
        r.transport_charge || 0
      );

    const transportGST =
      (transport * gstPercentage) / 100;

    return [

      index + 1,

      r.invoice_date || "",

      r.invoice_no_formatted ||
        `INV-${r.id}`,

      r.start_date || "",

      r.dc_no_formatted ||
        `DC-${r.challan_id}`,

      r.customer_name || "",

      subtotal,

      discount,

      taxable,

      `${gstAmount.toFixed(2)} (${gstPercentage}%)`,

      transport,

      transportGST,

      Number(
        r.total_amount || 0
      ),

    ];
  }
)
      ];

      const ws =
        XLSX.utils.aoa_to_sheet(data);

      // =====================================
      // MERGE TITLE CELLS
      // =====================================

      ws["!merges"] = [

        {
          s: { r: 0, c: 3 },
          e: { r: 0, c: 8 }
        },

        {
          s: { r: 1, c: 3 },
          e: { r: 1, c: 8 }
        },

        {
          s: { r: 2, c: 3 },
          e: { r: 2, c: 8 }
        }

      ];

      // =====================================
      // COLUMN WIDTHS
      // =====================================

ws["!cols"] = [

  { wch: 8 },
  { wch: 16 },
  { wch: 18 },
  { wch: 16 },
  { wch: 14 },
  { wch: 38 },

  { wch: 15 },
  { wch: 15 },
  { wch: 15 },
  { wch: 18 },

  { wch: 15 },
  { wch: 18 },

  { wch: 18 }

];

      // =====================================
      // STYLING
      // =====================================

      const range =
        XLSX.utils.decode_range(
          ws["!ref"] || ""
        );

      for (
        let R = range.s.r;
        R <= range.e.r;
        ++R
      ) {

        for (
          let C = range.s.c;
          C <= range.e.c;
          ++C
        ) {

          const cell =
            XLSX.utils.encode_cell({
              r: R,
              c: C
            });

          if (!ws[cell]) continue;

          ws[cell].s = {

            font: {
              name: "Calibri",
              sz: 11,
            },

            alignment: {
              vertical: "center",
              horizontal:
                C >= 6
                  ? "right"
                  : "left",
            },

            border: {
              top: {
                style: "thin",
                color: {
                  rgb: "D1D5DB"
                }
              },

              bottom: {
                style: "thin",
                color: {
                  rgb: "D1D5DB"
                }
              },

              left: {
                style: "thin",
                color: {
                  rgb: "D1D5DB"
                }
              },

              right: {
                style: "thin",
                color: {
                  rgb: "D1D5DB"
                }
              },
            }
          };

          // TITLE
          if (R === 0) {

            ws[cell].s.font = {
              bold: true,
              sz: 18,
              color: {
                rgb: "7C2D12"
              }
            };

            ws[cell].s.alignment = {
              horizontal: "center"
            };
          }

          // SUBTITLE
          if (R === 1 || R === 2) {

            ws[cell].s.font = {
              bold: true,
              sz: 13,
            };

            ws[cell].s.alignment = {
              horizontal: "center"
            };
          }

          // HEADER
// HEADER
if (R === 4) {

  // DARK BLUE SECTION
  if (C >= 0 && C <= 5) {

    ws[cell].s.fill = {
      fgColor: {
        rgb: "1F3C88"
      }
    };

    ws[cell].s.font = {
      bold: true,
      color: {
        rgb: "FFFFFF"
      },
      sz: 11
    };
  }

  // LIGHT BLUE SECTION
  if (C >= 6 && C <= 9) {

    ws[cell].s.fill = {
      fgColor: {
        rgb: "BDD7EE"
      }
    };

    ws[cell].s.font = {
      bold: true,
      color: {
        rgb: "000000"
      },
      sz: 11
    };
  }

  // LIGHT PURPLE SECTION
  if (C === 10 || C === 11) {

    ws[cell].s.fill = {
      fgColor: {
        rgb: "D9D2E9"
      }
    };

    ws[cell].s.font = {
      bold: true,
      color: {
        rgb: "000000"
      },
      sz: 11
    };
  }

  // GRAND TOTAL
if (R === 4 && C === 12) {

    ws[cell].s.fill = {
      fgColor: {
        rgb: "1F3C88"
      }
    };
ws[cell].s.font = {
  bold: true,
  color: {
    rgb: "FFFFFF"
  },
  sz: 11
};
  }

  ws[cell].s.alignment = {
    horizontal: "center",
    vertical: "center"
  };
}

          // BLUE SECTION
// BLUE SECTION
if (R > 4 && (C >= 6 && C <= 9)) {

  ws[cell].s.fill = {
    fgColor: {
      rgb: "DCEAF7"
    }
  };
}

// PURPLE SECTION
if (R > 4 && (C === 10 || C === 11)){

  ws[cell].s.fill = {
    fgColor: {
      rgb: "EEE3F8"
    }
  };
}


          // TOTAL
if (R > 4 && C === 12) {

  ws[cell].s.font = {
    bold: true
  };
}
        }
      }

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        sheetName
      );
    }
  );

  XLSX.writeFile(
    wb,
    "monthly-ledger-report.xlsx"
  );
};

const [lowStockLimit, setLowStockLimit] = useState(10);

const [mediumStockLimit, setMediumStockLimit] = useState(30);
useEffect(() => {
  const fetchStockSettings = async () => {
    try {

      const res =
        await settingsApi.getSystemSettings();

      console.log(
        "SYSTEM SETTINGS:",
        res.data
      );

      setLowStockLimit(
        Number(
          res.data?.lowStockAlert || 10
        )
      );

      setMediumStockLimit(
        Number(
          res.data?.mediumStockAlert || 30
        )
      );

    } catch (err) {

      console.error(
        "Stock settings error",
        err
      );

    }
  };

  fetchStockSettings();

}, []);

const getStockStatus = (stock: number) => {
  if (stock <= lowStockLimit) {
    return { text: 'Low', color: 'text-red-600 bg-red-100' };
  }

  if (stock <= mediumStockLimit) {
    return { text: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
  }

  return { text: 'Good', color: 'text-green-600 bg-green-100' };
};

const customerReport = useMemo(() => {
  const map = new Map();

  invoices.forEach((inv: any) => {
    const key = inv.customer_name || "Walk-in";

if (!map.has(key)) {
  map.set(key, {
    id: key,
    name: inv.customer_name,
    phone: inv.customer_phone,
gstin: inv.gstin,
    // IMPORTANT
    created_at: inv.created_at,

    total: 0,
    paid: 0,
    balance: 0,
    visits: 0,
  });
}

    const c = map.get(key);

    c.total += Number(inv.total_amount || 0);
    c.paid += Number(inv.paid_amount || 0);
    c.balance += Number(inv.total_amount || 0) - Number(inv.paid_amount || 0);
    c.visits += 1;
  });

  return Array.from(map.values());
}, [invoices]);


const filteredCustomerReport = useMemo(() => {
  let filtered = [...customerReport];

  // CUSTOMER SEARCH
  if (customerSearch.trim()) {
    const search = customerSearch.toLowerCase();

    filtered = filtered.filter(c =>
      (c.name || "").toLowerCase().includes(search) ||
      (c.phone || "").toLowerCase().includes(search)
    );
  }

  // FROM DATE
  if (customerDateFrom) {
    filtered = filtered.filter(c => {
      const date = new Date(c.created_at || c.date);
      return date >= new Date(customerDateFrom);
    });
  }

  // TO DATE
  if (customerDateTo) {
    filtered = filtered.filter(c => {
      const date = new Date(c.created_at || c.date);

      const to = new Date(customerDateTo);
      to.setHours(23, 59, 59, 999);

      return date <= to;
    });
  }

  return filtered;

}, [
  customerReport,
  customerSearch,
  customerDateFrom,
  customerDateTo
]);
console.log("CURRENT MOVEMENTS STATE", movements);


const inventoryReport = useMemo(() => {

  return products

    .filter((product) => {

      if (
        selectedCategory !== "all" &&
        String(product.category) !== selectedCategory
      ) {
        return false;
      }

      if (
        selectedVendor !== "all" &&
        String(product.vendor) !== selectedVendor
      ) {
        return false;
      }

      return true;

    })

    .map((product) => {

      const inward =
        Number(product.inwardMovement || 0);

      const outward =
        Number(product.outwardMovement || 0);

      const closingStock =
        Number(product.stock || 0);

    const openingStock =
  closingStock -
  inward +
  outward;

      const stockValue =
        closingStock *
        Number(
          product.unitPrice ||
          product.price ||
          0
        );

      let status = "Good";

      if (closingStock <= 0) {
        status = "Out of Stock";
      } else if (
        closingStock <=
        Number(product.minStock || 10)
      ) {
        status = "Low Stock";
      }
console.log("PRODUCTS FULL", products);
      return {

        id: product.id,

        name: product.name,

        category:
          product.category || "-",

        unit:
          product.unit || "pcs",

        unitPrice:
          Number(
            product.unitPrice ||
            product.price ||
            0
          ),

        openingStock,

inwardMovement:
  Number(product.inwardMovement || 0),

outwardMovement:
  Number(product.outwardMovement || 0),

        closingStock,

        stockValue,

        minStock:
          product.minStock || 10,

        status,

      };

    });

}, [
  products,
  selectedCategory,
  selectedVendor,
  inventoryDateFrom,
  inventoryDateTo,
]);
const exportInventoryCSV = () => {

  if (!inventoryReport.length) return;

  const csv = [

    [
      "Product",
      "Opening",
      "Purchased",
      "Rented",
      "Available",
      "Unit Price",
      "Stock Value",
      "Status"
    ],

    ...inventoryReport.map((p) => [

      p.name,

      p.openingStock,

      p.inwardMovement,

      p.outwardMovement,

      p.closingStock,

      p.unitPrice,

      p.stockValue,

      p.status,

    ]),

  ]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob(
    [csv],
    { type: "text/csv" }
  );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "inventory-report.csv";

  a.click();

};

const totalItemsSold = invoices.reduce((sum, inv) => {
  if (!inv.items) return sum;

  const qty = inv.items.reduce(
    (q: number, item: any) =>
      q + Number(item.quantity_sent || 0),
    0
  );

  return sum + qty;
}, 0);

const topProducts: any[] = Object.values(

  invoices
    .flatMap((inv: any) => inv.items || [])

    .reduce((acc: any, item: any) => {

      const id = item.product_id;

      if (!acc[id]) {

        const price =
          Number(item.price || 0);

        acc[id] = {
          id,

          name:
            item.product_name ||
            "Unknown Product",

          category: "Rental Product",

          soldCount: 0,

          revenue: 0,

          price
        };
      }

      // ✅ YOUR REAL FIELD
      const quantity =
        Number(item.quantity_sent || 0);

      const price =
        Number(item.price || 0);

      acc[id].soldCount += quantity;

      acc[id].revenue +=
        quantity * price;

      return acc;

    }, {})
)
.sort((a: any, b: any) => b.soldCount - a.soldCount)

console.log(topProducts);

const productMap = Object.fromEntries(
  products.map((p: any) => [p.id, p.category])
);

const revenueByCategory = Object.entries(

  invoices
    .flatMap((inv: any) => inv.items || [])

    .reduce((acc: any, item: any) => {

      const category =
        productMap[item.product_id] ||
        "Others";

      if (!acc[category]) {
        acc[category] = 0;
      }

      const quantity =
        Number(item.quantity_sent || 0);

      const price =
        Number(item.price || 0);

      const revenue =
        quantity * price;

      acc[category] += revenue;

      return acc;

    }, {})
)
.sort((a: any, b: any) => b[1] - a[1]);

  const generateInventoryReport = () => {
    const filteredProducts = products.filter(p => {
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      const vendorMatch = selectedVendor === 'all' || p.vendor === selectedVendor;
      return categoryMatch && vendorMatch;
    });

    // Calculate stock movements for each product
    return filteredProducts.map(product => {
      // Get transactions within the date range
      const fromDate = inventoryDateFrom || '2020-01-01';
      const toDate = inventoryDateTo || '2030-12-31';
      
      const productTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
        return transactionDate >= fromDate && transactionDate <= toDate &&
               t.items.some(item => item.id === product.id);
      });

      // Calculate outward movement (sold quantity)
      const outwardMovement = productTransactions.reduce((sum, t) => {
        const productItem = t.items.find(item => item.id === product.id);
        return sum + (productItem?.quantity || 0);
      }, 0);

      // For demo purposes, simulate opening stock and inward movement
      // In real implementation, this would come from stock movement records
      const openingStock = product.stock + outwardMovement; // Assuming current stock + sold = opening
      const inwardMovement = Math.floor(Math.random() * 50); // Simulated inward movement
      const closingStock = product.stock; // Current stock as closing stock

      return {
        ...product,
        openingStock,
        inwardMovement,
        outwardMovement,
        closingStock
      };
    });
  };



const totalCollected = invoices.reduce(
  (sum, inv) => sum + Number(inv.paid_amount || 0),
  0
);

const totalPending = totalRevenue - totalCollected;
const totalLateFees = invoices.reduce(
  (sum, inv) => sum + Number(inv.late_fee || 0),
  0
);
const statusStats = invoices.reduce((acc: any, inv: any) => {
  acc[inv.status] = (acc[inv.status] || 0) + 1;
  return acc;
}, {});
  
  const generateFinancialData = () => {
    const fromDate = financialDateFrom || '2020-01-01';
    const toDate = financialDateTo || '2030-12-31';
    
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.timestamp).toISOString().split('T')[0];
      return transactionDate >= fromDate && transactionDate <= toDate;
    });

    const periodSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const periodTax = periodSales * 0.18;
    const periodNetRevenue = periodSales * 0.82;
    
    // Calculate inventory value for balance sheet
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.stock * p.unitPrice), 0);
    
    return {
      sales: periodSales,
      tax: periodTax,
      netRevenue: periodNetRevenue,
      inventoryValue: totalInventoryValue,
      transactions: filteredTransactions
    };
  };

  const exportCustomerCSV = () => {
  if (!customerReport.length) return;

  const headers = [
    "Customer",
    "GST No",
    "Sub Total",
    "GST",
    "Transport",
    "Transport GST",
    "Total"
  ];

  const rows = customerReport.map((c: any) => {
    const subTotal = Number(c.total || 0);
    const transport = Number(c.transport || 0);
    const gst = GST || 0;

    return [
      c.name,
      c.gst || "-",
      subTotal.toFixed(2),
      (subTotal * gst).toFixed(2),
      transport.toFixed(2),
      (transport * gst).toFixed(2),
      (
        subTotal +
        subTotal * gst +
        transport +
        transport * gst
      ).toFixed(2)
    ];
  });

  const csvContent =
    [headers, ...rows].map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "customer-report.csv";
  a.click();
};
const exportReport = (type: string) => {
  let csv = "";

  if (type === "Inventory") {
    const data = inventoryReport; // already computed

    if (!data.length) {
      alert("No inventory data");
      return;
    }

    const headers = [
      "Product",
      "Opening",
      "Outward",
      "Closing",
      "Unit Price",
      "Stock Value"
    ];

    const rows = data.map((p: any) => [
      p.name,
      p.openingStock,
      p.outwardMovement,
      p.closingStock,
      p.unitPrice,
      (p.closingStock * p.unitPrice).toFixed(2)
    ]);

    csv = [headers, ...rows]
      .map(r => r.join(","))
      .join("\n");
  }

  if (!csv) {
    alert("Nothing to export");
    return;
  }

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${type}-report.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
// const exportTaxReport = () => {
//   if (!selectedMonth) {
//     alert("Select month first");
//     return;
//   }

//   const [year, month] = selectedMonth.split("-");

//   const filtered = invoices.filter((inv: any) => {
//     const date = new Date(inv.created_at);
//     return (
//       date.getFullYear() === Number(year) &&
//       date.getMonth() + 1 === Number(month)
//     );
//   });

//   if (!filtered.length) {
//     alert("No data for selected month");
//     return;
//   }

//   const totalRevenue = filtered.reduce(
//     (sum, inv) => sum + Number(inv.total_amount || 0),
//     0
//   );

//   const totalTax = totalRevenue * (GST || 0);
//   const cgst = totalTax / 2;
//   const sgst = totalTax / 2;

//   const csv = [
//     ["Month", selectedMonth],
//     [],
//     ["Metric", "Amount"],
//     ["Total Revenue", totalRevenue],
//     ["GST Rate", (GST * 100) + "%"],
//     ["Total Tax", totalTax],
//     ["CGST", cgst],
//     ["SGST", sgst]
//   ]
//     .map(r => r.join(","))
//     .join("\n");

//   const blob = new Blob([csv], { type: "text/csv" });
//   const url = URL.createObjectURL(blob);

//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `gst-report-${selectedMonth}.csv`;
//   a.click();

//   URL.revokeObjectURL(url);
// };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-transparent min-h-full">
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <h1 className="font-display text-2xl sm:text-3xl font-normal text-foreground">Reports & Analytics</h1>
        <div className="flex gap-2">
          {/* <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button> */}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-semibold">₹{totalRevenue.toFixed(2)}</p>
              </div>
              <IndianRupee className="h-8 w-8 text-sage" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-semibold">{totalInvoices}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-semibold">₹{avgInvoiceValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
<p className="text-sm text-muted-foreground">Total Products</p>
<p className="text-2xl font-semibold">{totalItemsSold}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="sales" className="space-y-6">
        <div className="overflow-x-auto pb-2">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-7">
            <TabsTrigger value="sales" className="whitespace-nowrap">Sales</TabsTrigger>
            <TabsTrigger value="inventory" className="whitespace-nowrap">Inventory</TabsTrigger>
            <TabsTrigger value="products" className="whitespace-nowrap">Products</TabsTrigger>
            <TabsTrigger value="financial" className="whitespace-nowrap">Financial</TabsTrigger>
            <TabsTrigger value="customer" className="whitespace-nowrap">Customer</TabsTrigger>
            {/* <TabsTrigger value="tax">Tax Reports</TabsTrigger> */}
            <TabsTrigger value="customer-yearly-report" className="whitespace-nowrap">Yearly</TabsTrigger>
            <TabsTrigger value="monthlyLedger" className="whitespace-nowrap">Ledger</TabsTrigger>
          </TabsList>
        </div>

      <TabsContent value="sales">
  <Card>
    <CardHeader>
<CardTitle className="flex items-center justify-between flex-col sm:flex-row gap-4">
  <div className="flex items-center">
    <BarChart3 className="h-5 w-5 mr-2" />
    Sales Reports
  </div>

  <Button onClick={resetFilters} variant="outline" size="sm">
    <Filter className="h-4 w-4" />
    <span className="hidden md:inline ml-2">Reset Filters</span>
  </Button>
</CardTitle>
      
    </CardHeader>

    <CardContent className="space-y-4">
      
      {/* FILTER STATE */}
      {/* IMPORTANT: keep separate temp + applied state */}
      
      {/* FILTER UI */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <Label>From Date</Label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div>
          <Label>To Date</Label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="flex items-end">
          <Button className="w-full" onClick={() => applyFilter()}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filter
          </Button>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => exportSalesCSV()}
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Export</span>
          </Button>
        </div>
      </div>



      {/* TABLE */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading report...
        </div>
      ) : salesReport.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No sales found for selected date range
        </div>
      ) : (
        <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-center'>Date</TableHead>
                <TableHead className='text-center'>Transaction ID</TableHead>
                <TableHead className='text-center'>Customer</TableHead>
                <TableHead className='text-center'>Items</TableHead>
                <TableHead className='text-center'>Amount</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {salesReport.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className='text-center'>
                    {new Date(t.created_at).toLocaleDateString("en-IN")}
                  </TableCell>

                  <TableCell className="font-medium text-center">
                    #{t.id}
                  </TableCell>
  <TableCell className="text-center">
    {t.customer_name || "Walk-in"}
  </TableCell>
                  <TableCell className="text-center">
                    {t.items?.length || 0}
                  </TableCell>


                  <TableCell className="font-semibold text-center">
               ₹{Number(t.total_amount || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 p-3">
          {salesReport.map((t) => (
            <div key={t.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">#{t.id}</p>
                  <p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <span className="font-semibold text-green-600 text-sm">₹{Number(t.total_amount || 0).toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                <div><span className="text-gray-500">Customer:</span> {t.customer_name || "Walk-in"}</div>
                <div><span className="text-gray-500">Items:</span> {t.items?.length || 0}</div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </CardContent>
  </Card>
</TabsContent>

        <TabsContent value="inventory">
<Card className="overflow-hidden">

  {/* HEADER */}
  <CardHeader className="bg-muted/40 border-b">
    
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      
      <CardTitle className="flex items-center text-xl font-display font-normal">
        <Package className="h-6 w-6 mr-3" />
        Inventory Health Report
      </CardTitle>

      <div className="flex gap-2">
        <Button
          onClick={resetFilters}
          variant="outline"
          size="sm"
        >
          Reset Filters
        </Button>

        {/* <Button
          onClick={() => exportInventoryCSV()}
          size="sm"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button> */}
      </div>

    </div>

  </CardHeader>

  <CardContent className="p-6 space-y-6">

    {/* SUMMARY CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

      {/* TOTAL VALUE */}
      <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5">
        <p className="text-sm text-amber-800 font-medium">
          Inventory Value
        </p>

        <h2 className="text-2xl font-bold text-amber-800 mt-2">
          ₹{
            inventoryReport
              .reduce(
                (sum, p) =>
                  sum +
                  (
                    Number(p.closingStock || 0) *
                    Number(p.unitPrice || 0)
                  ),
                0
              )
              .toFixed(2)
          }
        </h2>

        <p className="text-xs text-amber-600 mt-1">
          Current stock valuation
        </p>
      </div>

      {/* LOW STOCK */}
    <div className="rounded-2xl bg-orange-50 border border-orange-200 p-5">

  <div className="flex items-start justify-between">

    <div>

      <p className="text-sm text-orange-800 font-medium">
        Low Stock Items
      </p>

      <h2 className="text-3xl font-bold text-orange-800 mt-2">
        {
          inventoryReport.filter(
            p =>
              getStockStatus(
                Number(p.closingStock || 0)
              ).text === "Low"
          ).length
        }
      </h2>

      <p className="text-xs text-orange-600 mt-1">
        Requires replenishment
      </p>

    </div>

    <div className="p-3 rounded-xl bg-orange-100">
      <AlertTriangle className="h-6 w-6 text-orange-700" />
    </div>

  </div>

</div>

      {/* OUT OF STOCK */}
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5">
        <p className="text-sm text-rose-800 font-medium">
          Out of Stock
        </p>

        <h2 className="text-2xl font-bold text-rose-800 mt-2">
          {
            inventoryReport.filter(
              p => Number(p.closingStock) <= 0
            ).length
          }
        </h2>

        <p className="text-xs text-rose-600 mt-1">
          Immediate attention needed
        </p>
      </div>

      {/* TOTAL ITEMS */}
      <div className="rounded-2xl bg-stone-100 border border-stone-200 p-5">
        <p className="text-sm text-stone-700 font-medium">
          Total Assets
        </p>

        <h2 className="text-2xl font-bold text-stone-700 mt-2">
          {
            inventoryReport.reduce(
              (sum, p) =>
                sum + Number(p.closingStock || 0),
              0
            )
          }
        </h2>

        <p className="text-xs text-stone-500 mt-1">
          Available inventory units
        </p>
      </div>

    </div>

    {/* FILTERS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-gray-50 border">

      {/* <div>
        <Label>From Date</Label>

        <Input
          type="date"
          value={inventoryDateFrom}
          onChange={(e) =>
            setInventoryDateFrom(e.target.value)
          }
        />
      </div>

      <div>
        <Label>To Date</Label>

        <Input
          type="date"
          value={inventoryDateTo}
          onChange={(e) =>
            setInventoryDateTo(e.target.value)
          }
        />
      </div> */}

      <div>
        <Label>Category</Label>

        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Categories
            </SelectItem>

            {categories.map((cat) => (
              <SelectItem
                key={cat.id}
                value={cat.name}
              >
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Vendor</Label>

        <Select
          value={selectedVendor}
          onValueChange={setSelectedVendor}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">
              All Vendors
            </SelectItem>

            {vendors.map((vendor) => (
              <SelectItem
                key={vendor.id}
                value={vendor.name}
              >
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          className="w-full"
          variant="outline"
           onClick={() => exportInventoryCSV()}
        >
          <Download className="h-4 w-4" />
          <span className="hidden md:inline ml-2">Export</span>
        </Button>
      </div>

    </div>

    {/* TABLE */}
    {inventoryReport.length === 0 ? (

      <div className="text-center py-16 text-gray-500">
        No inventory data found
      </div>

) : (

  <div className="rounded-2xl border overflow-hidden">

    {/* Desktop Table View */}
    <div className="hidden md:block max-h-[650px] overflow-auto">
      <Table>

        <TableHeader className="sticky top-0 bg-white z-10 border-b">

          <TableRow className="bg-gray-50">

            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Opening</TableHead>
            <TableHead>Purchased</TableHead>
            <TableHead>Rented</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Stock Value</TableHead>
            <TableHead>Status</TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {inventoryReport.map((p) => {

            const utilization =
              (
                (
                  Number(p.outwardMovement || 0) /
                  Math.max(
                    (
                      Number(p.openingStock || 0) +
                      Number(p.inwardMovement || 0)
                    ),
                    1
                  )
                ) * 100
              ).toFixed(1);

            return (

              <TableRow
                key={p.id}
                className="hover:bg-gray-50 transition-colors"
              >

                <TableCell className="font-semibold">
                  {p.name}
                </TableCell>

                <TableCell>
                  {p.category}
                </TableCell>

                <TableCell>
                  {p.openingStock} {p.unit}
                </TableCell>

                <TableCell className="text-green-600 font-medium">
                  +{p.inwardMovement}
                </TableCell>

                <TableCell className="text-red-600 font-medium">
                  -{p.outwardMovement}
                </TableCell>

                <TableCell className="font-semibold">
                  {p.closingStock} {p.unit}
                </TableCell>

                {/* UTILIZATION */}
                <TableCell>

                  <div className="space-y-1">

                    <div className="flex justify-between text-xs">
                      <span>
                        {utilization}%
                      </span>
                    </div>

                    <div className="w-24 bg-gray-200 rounded-full h-2">

                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            Number(utilization),
                            100
                          )}%`
                        }}
                      />

                    </div>

                  </div>

                </TableCell>

                <TableCell>
                  ₹{Number(p.unitPrice).toFixed(2)}
                </TableCell>

                <TableCell className="font-semibold text-blue-700">
                  ₹{
                    (
                      Number(p.closingStock || 0) *
                      Number(p.unitPrice || 0)
                    ).toFixed(2)
                  }
                </TableCell>

                {/* STATUS */}
                <TableCell>

                  {(() => {

                    const status =
                      getStockStatus(
                        Number(p.closingStock || 0)
                      );

                    return (

                      <span
                        className={`
                          px-3 py-1
                          rounded-full
                          text-xs
                          font-medium
                          ${status.color}
                        `}
                      >
                        {status.text}
                      </span>

                    );

                  })()}

                </TableCell>

              </TableRow>

            );

          })}

        </TableBody>

      </Table>

    </div>

    {/* Mobile Card View */}
    <div className="md:hidden space-y-3 p-3">
      {inventoryReport.map((p) => {
        const utilization = (
          (
            Number(p.outwardMovement || 0) /
            Math.max(
              (
                Number(p.openingStock || 0) +
                Number(p.inwardMovement || 0)
              ),
              1
            )
          ) * 100
        ).toFixed(1);
        const status = getStockStatus(Number(p.closingStock || 0));
        return (
          <div key={p.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.category}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${status.color}`}>
                {status.text}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
              <div><span className="text-gray-500">Opening:</span> {p.openingStock} {p.unit}</div>
              <div><span className="text-gray-500">Purchased:</span> <span className="text-green-600">+{p.inwardMovement}</span></div>
              <div><span className="text-gray-500">Rented:</span> <span className="text-red-600">-{p.outwardMovement}</span></div>
              <div><span className="text-gray-500">Available:</span> <span className="font-medium">{p.closingStock} {p.unit}</span></div>
              <div><span className="text-gray-500">Unit Price:</span> ₹{Number(p.unitPrice).toFixed(2)}</div>
              <div><span className="text-gray-500">Stock Value:</span> <span className="text-blue-700 font-medium">₹{(Number(p.closingStock || 0) * Number(p.unitPrice || 0)).toFixed(2)}</span></div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Utilization:</span>
                <span>{utilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(Number(utilization), 100)}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
      )}
    </CardContent>
  </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Card>
  <CardHeader>
    <CardTitle>Top Selling Products</CardTitle>
  </CardHeader>

<CardContent className="space-y-3 max-h-[420px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

  {topProducts.length === 0 ? (
    <p className="text-sm text-gray-500">
      No sales data available
    </p>
  ) : (
    topProducts.map((p: any, index: number) => (
      <div
        key={index}
        className="flex items-center justify-between border-b pb-2 last:border-none"
      >
        <div>
          <p className="font-medium text-gray-800">
            {p.name}
          </p>

          <p className="text-xs text-gray-500">
            {p.soldCount} units sold
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-green-600">
            ₹{p.revenue.toFixed(0)}
          </p>
        </div>
      </div>
    ))
  )}

</CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle>Low Stock Alert</CardTitle>
<p className="text-sm text-gray-500">
  {
    products.filter(
      (p: any) =>
        Number(p.stock || 0) <= lowStockLimit
    ).length
  } products
</p>
  </CardHeader>
<CardContent className="space-y-3 max-h-[420px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

  {products.filter((p: any) =>
    Number(p.stock || 0) <= lowStockLimit
  ).length === 0 ? (

    <p className="text-sm text-gray-500">
      No low stock items
    </p>

  ) : (

    products
      .filter((p: any) =>
        Number(p.stock || 0) <= lowStockLimit
      )
      .map((p: any, index: number) => (

        <div
          key={index}
          className="flex justify-between border-b pb-2 last:border-none"
        >
          <div>
            <p className="font-medium">
              {p.name}
            </p>

            <p className="text-xs text-gray-500">
              Stock: {p.stock}
            </p>
          </div>

          <p className="text-red-600 font-semibold">
            Low
          </p>
        </div>

      ))

  )}

</CardContent>
</Card>
<Card>
  <CardHeader>
    <CardTitle>Revenue by Category</CardTitle>
    <p className="text-sm text-gray-500">
      Performance analysis
    </p>
  </CardHeader>

<CardContent className="space-y-3 max-h-[415px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
    {revenueByCategory.length === 0 ? (
      <p className="text-sm text-gray-500">No data available</p>
    ) : (
      revenueByCategory.map(
        ([category, revenue]: any, index: number) => (
<div
  key={index}
  className="flex justify-between border-b pb-2 last:border-none"
>
  <div>
    <p className="font-medium">
      {category}
    </p>
  </div>

  <p className="text-green-600 font-semibold">
    ₹{Number(revenue).toFixed(0)}
  </p>
</div>
        )
      )
    )}
  </CardContent>
</Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

<TabsContent value="financial">
  <div className="space-y-6">

    {/* TOP KPI SECTION */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground font-medium">
            Total Sales
          </p>

          <h2 className="text-3xl font-semibold mt-2">
            ₹{totalRevenue.toFixed(2)}
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            Overall business revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm text-muted-foreground font-medium">
            Total Tax
          </p>

          <h2 className="text-3xl font-semibold mt-2">
            ₹{taxData.totalTax.toFixed(2)}
          </h2>

          <p className="text-xs text-muted-foreground mt-1">
            GST collected from sales
          </p>
        </CardContent>
      </Card>

<Card>
  <CardContent className="p-5">
    <p className="text-sm text-muted-foreground font-medium">
      Net Revenue
    </p>

    <h2 className="text-3xl font-semibold mt-2">
      ₹{(totalRevenue - taxData.totalTax).toFixed(2)}
    </h2>

    <p className="text-xs text-muted-foreground mt-1">
      Revenue after tax deduction
    </p>
  </CardContent>
</Card>

<Card>
  <CardContent className="p-5">
    <p className="text-sm text-muted-foreground font-medium">
      Outstanding Balance
    </p>

    <h2 className="text-3xl font-semibold mt-2">
      ₹{outstandingBalance.toFixed(2)}
    </h2>

    <p className="text-xs text-muted-foreground mt-1">
      Pending customer payments
    </p>
  </CardContent>
</Card>

    </div>

    {/* SECOND ROW */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* PERFORMANCE */}
      <Card className="border-0 shadow-lg rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Performance Insights
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
            <span className="text-sm text-gray-600">
              Highest Sale
            </span>

            <span className="font-bold text-green-700 text-lg">
              ₹{
  invoices.length
    ? Math.max(...invoices.map(i => Number(i.total_amount) || 0)).toFixed(2)
    : "0.00"
}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
            <span className="text-sm text-gray-600">
              Lowest Sale
            </span>

            <span className="font-bold text-red-600 text-lg">
              ₹{
  invoices.length
    ? Math.min(...invoices.map(i => Number(i.total_amount) || 0)).toFixed(2)
    : "0.00"
}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
            <span className="text-sm text-gray-600">
              Total Transactions
            </span>

            <span className="font-bold text-blue-700 text-lg">
              {invoices.length}
            </span>
          </div>

        </CardContent>
      </Card>

      {/* PAYMENT BREAKDOWN */}
<Card className="border-0 shadow-lg rounded-2xl">
  <CardHeader className="pb-2">
    <CardTitle className="text-lg">
      Payment Methods
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3">

    {payments.length === 0 ? (

      <div className="text-center text-sm text-gray-500 py-6">
        No payment data available
      </div>

    ) : (

      Object.entries(
        payments.reduce((acc: any, payment: any) => {

          const method =
            payment.payment_method || "Unknown";

          acc[method] =
            (acc[method] || 0) +
            Number(payment.amount || 0);

          return acc;

        }, {})
      ).map(([method, amount]: any) => (

        <div
          key={method}
          className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
        >
          <div>
            <p className="capitalize font-medium text-gray-700">
              {method}
            </p>

            <p className="text-xs text-gray-500">
              Payment collection
            </p>
          </div>

          <p className="font-bold text-gray-800">
            ₹{Number(amount).toFixed(2)}
          </p>
        </div>

      ))

    )}

  </CardContent>
</Card>

    </div>

    {/* REVENUE SECTION */}
    <Card className="overflow-hidden">

      <div className="bg-muted/50 p-5 border-b">
        <h2 className="font-display text-2xl">
          Revenue Overview
        </h2>

        <p className="text-muted-foreground text-sm mt-1">
          Collection and pending analytics
        </p>
      </div>

      <CardContent className="p-6">

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-green-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Total Revenue
            </p>

            <h3 className="text-2xl font-bold text-green-700 mt-2">
              ₹{totalRevenue.toFixed(2)}
            </h3>
          </div>

          <div className="bg-blue-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Collected
            </p>

            <h3 className="text-2xl font-bold text-blue-700 mt-2">
              ₹{totalCollected.toFixed(2)}
            </h3>
          </div>

          <div className="bg-red-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <h3 className="text-2xl font-bold text-red-600 mt-2">
              ₹{totalPending.toFixed(2)}
            </h3>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Late Fees
            </p>

            <h3 className="text-2xl font-bold text-yellow-700 mt-2">
              ₹{totalLateFees.toFixed(2)}
            </h3>
          </div>

        </div>

      </CardContent>
    </Card>

  </div>
</TabsContent>

<TabsContent value="customer">
<Card>
  <CardHeader>
    <CardTitle className="flex items-center justify-between">
      <span>Customer Analytics Report</span>

      <Button onClick={resetFilters} variant="outline" size="sm">
        Reset Filters
      </Button>
    </CardTitle>
  </CardHeader>
    <CardContent className="space-y-4">

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<div>
  <Label>From Date</Label>
  <Input
    type="date"
    value={customerDateFrom}
    onChange={(e) => setCustomerDateFrom(e.target.value)}
  />
</div>

<div>
  <Label>To Date</Label>
  <Input
    type="date"
    value={customerDateTo}
    onChange={(e) => setCustomerDateTo(e.target.value)}
  />
</div>

<div>
  <Label>Customer</Label>

  <div className="relative">
    <Input
      placeholder="Search customer..."
      value={customerSearch}
      onChange={(e) => setCustomerSearch(e.target.value)}
      className="pr-10"
    />

    {customerSearch && (
      <button
        type="button"
        onClick={() => setCustomerSearch('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
      >
        ✕
      </button>
    )}
  </div>
</div>
        <div className="flex items-end">
       <Button className="w-full" onClick={exportCustomerCSV}>
  <Download className="h-4 w-4" />
  <span className="hidden md:inline ml-2">Export CSV</span>
</Button>
        </div>
      </div>

      {/* TABLE */}
   {/* Desktop Table View */}
   <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>GST No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">GST</TableHead>
              <TableHead className="text-right">Transport</TableHead>
              <TableHead className="text-right">Transport GST</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>

  <TableBody>

  {filteredCustomerReport.length === 0 ? (

    <TableRow>
      <TableCell
        colSpan={8}
        className="text-center py-12 text-gray-500"
      >
        No matching customers found
      </TableCell>
    </TableRow>

  ) : (

    filteredCustomerReport.map((c, index) => {
      const subtotal = Number(c.total || 0);
      const transport = Number(c.transport || 0);
      const gstRate = GST || 0;

      const gstAmount = subtotal * gstRate;
      const transportGST = transport * gstRate;

      const finalTotal =
        subtotal +
        gstAmount +
        transport +
        transportGST;

      return (
        <TableRow key={c.id}>
          <TableCell>{index + 1}</TableCell>
          <TableCell>{c.gstin || "-"}</TableCell>
          <TableCell className="font-medium">
            {c.name}
          </TableCell>

          <TableCell className="text-right">
            ₹{subtotal.toFixed(2)}
          </TableCell>

          <TableCell className="text-right">
            ₹{gstAmount.toFixed(2)}
          </TableCell>

          <TableCell className="text-right">
            ₹{transport.toFixed(2)}
          </TableCell>

          <TableCell className="text-right">
            ₹{transportGST.toFixed(2)}
          </TableCell>

          <TableCell className="text-right font-semibold">
            ₹{finalTotal.toFixed(2)}
          </TableCell>
        </TableRow>
      );
    })

  )}

</TableBody>


          {/* FOOTER TOTAL */}
    {filteredCustomerReport.length > 0 && (
  <tfoot className="bg-gray-50 font-semibold">
    <tr>
      <td colSpan={3} className="text-right px-4 py-2">
        Total
      </td>

      {(() => {
        const gstRate = GST || 0;

        const totals = filteredCustomerReport.reduce(
          (acc, c) => {
            const subtotal = Number(c.total || 0);
            const transport = Number(c.transport || 0);

            acc.subtotal += subtotal;
            acc.gst += subtotal * gstRate;
            acc.transport += transport;
            acc.transportGST += transport * gstRate;
            acc.final +=
              subtotal +
              subtotal * gstRate +
              transport +
              transport * gstRate;

            return acc;
          },
          {
            subtotal: 0,
            gst: 0,
            transport: 0,
            transportGST: 0,
            final: 0,
          }
        );

        return (
          <>
            <td className="text-right px-4 py-2">
              ₹{totals.subtotal.toFixed(2)}
            </td>

            <td className="text-right px-4 py-2">
              ₹{totals.gst.toFixed(2)}
            </td>

            <td className="text-right px-4 py-2">
              ₹{totals.transport.toFixed(2)}
            </td>

            <td className="text-right px-4 py-2">
              ₹{totals.transportGST.toFixed(2)}
            </td>

            <td className="text-right px-4 py-2">
              ₹{totals.final.toFixed(2)}
            </td>
          </>
        );
      })()}
    </tr>
  </tfoot>
)}
        </Table>
</div>

{/* Mobile Card View */}
<div className="md:hidden space-y-3 p-3">
  {filteredCustomerReport.length === 0 ? (
    <div className="text-center py-12 text-gray-500">
      No matching customers found
    </div>
  ) : (
    filteredCustomerReport.map((c, index) => {
      const subtotal = Number(c.total || 0);
      const transport = Number(c.transport || 0);
      const gstRate = GST || 0;
      const gstAmount = subtotal * gstRate;
      const transportGST = transport * gstRate;
      const finalTotal = subtotal + gstAmount + transport + transportGST;

      return (
        <div key={c.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">#{index + 1} {c.name}</p>
              <p className="text-xs text-gray-500">{c.gstin || "-"}</p>
            </div>
            <span className="font-semibold text-green-600 text-sm">₹{finalTotal.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-gray-500">Subtotal:</span> ₹{subtotal.toFixed(2)}</div>
            <div><span className="text-gray-500">GST:</span> ₹{gstAmount.toFixed(2)}</div>
            <div><span className="text-gray-500">Transport:</span> ₹{transport.toFixed(2)}</div>
            <div><span className="text-gray-500">Transport GST:</span> ₹{transportGST.toFixed(2)}</div>
          </div>
        </div>
      );
    })
  )}
  
  {/* Mobile Total */}
  {filteredCustomerReport.length > 0 && (() => {
    const gstRate = GST || 0;
    const totals = filteredCustomerReport.reduce(
      (acc, c) => {
        const subtotal = Number(c.total || 0);
        const transport = Number(c.transport || 0);
        acc.subtotal += subtotal;
        acc.gst += subtotal * gstRate;
        acc.transport += transport;
        acc.transportGST += transport * gstRate;
        acc.final += subtotal + subtotal * gstRate + transport + transport * gstRate;
        return acc;
      },
      { subtotal: 0, gst: 0, transport: 0, transportGST: 0, final: 0 }
    );
    return (
      <div className="bg-gray-100 rounded-lg p-3 mt-4">
        <p className="font-semibold text-sm text-center">Total: ₹{totals.final.toFixed(2)}</p>
      </div>
    );
  })()}
</div>
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="customer-yearly-report" className="space-y-4">

 <Card>

  <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

    <div>
      <CardTitle>
        Customer Yearly Report
      </CardTitle>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

  <div className="relative">
    <Input
      placeholder="Search customer..."
      value={customerSearch}
      onChange={(e) => setCustomerSearch(e.target.value)}
      className="pr-10"
    />

    {customerSearch && (
      <button
        type="button"
        onClick={() => setCustomerSearch('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
      >
        ✕
      </button>
    )}
  </div>

      <Button
        onClick={exportCustomerYearlyExcel }
        size="sm"
        className="w-full sm:w-auto px-4"
      >
        <Download className="h-4 w-4" />
        <span className="hidden md:inline ml-2">Export Excel</span>
      </Button>

    </div>

  </CardHeader>

  <CardContent>

    {/* Desktop Table View */}
    <div className="hidden md:block border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
              <TableHead className="min-w-[220px]">
                Customer
              </TableHead>
              <TableHead>FY</TableHead>
              <TableHead className="text-right">Apr</TableHead>
              <TableHead className="text-right">May</TableHead>
              <TableHead className="text-right">Jun</TableHead>
              <TableHead className="text-right">Jul</TableHead>
              <TableHead className="text-right">Aug</TableHead>
              <TableHead className="text-right">Sep</TableHead>
              <TableHead className="text-right">Oct</TableHead>
              <TableHead className="text-right">Nov</TableHead>
              <TableHead className="text-right">Dec</TableHead>
              <TableHead className="text-right">Jan</TableHead>
              <TableHead className="text-right">Feb</TableHead>
              <TableHead className="text-right">Mar</TableHead>
              <TableHead className="text-right font-bold">Total</TableHead>
              <TableHead className="text-right text-green-600">Received</TableHead>
              <TableHead className="text-right text-red-600">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredYearlyReport.length === 0 ? (
            <TableRow>
              <TableCell colSpan={17} className="text-center py-10 text-gray-500">
                No report data found
              </TableCell>
            </TableRow>
          ) : (
            filteredYearlyReport.map((row: any, index: number) => {
              const previousCustomer = index > 0 ? filteredYearlyReport[index - 1].customer_name : null;
              const isNewCustomer = previousCustomer !== row.customer_name;
              return (
                <React.Fragment key={index}>
                  {isNewCustomer && index !== 0 && (
                    <TableRow>
                      <TableCell colSpan={17} className="h-3 bg-slate-100 border-0 p-0" />
                    </TableRow>
                  )}
                  <TableRow className={`hover:bg-slate-50 ${isNewCustomer ? 'bg-slate-50/50' : ''}`}>
                    <TableCell className="font-semibold whitespace-nowrap">{row.customer_name}</TableCell>
                    <TableCell className="font-medium">{row.financial_year}</TableCell>
                    <TableCell className="text-right">₹{Number(row.apr || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.may || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.jun || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.jul || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.aug || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.sep || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.oct || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.nov || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.dec || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.jan || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.feb || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{Number(row.mar || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">₹{Number(row.total || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600 font-semibold">₹{Number(row.received || 0).toFixed(2)}</TableCell>
                    <TableCell className={`text-right font-bold ${Number(row.balance) > 0 ? "text-red-600" : "text-green-600"}`}>
                      ₹{Number(row.balance || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>

    {/* Mobile Card View */}
    <div className="md:hidden space-y-3 p-3">
      {filteredYearlyReport.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No report data found</div>
      ) : (
        filteredYearlyReport.map((row: any, index: number) => {
          const previousCustomer = index > 0 ? filteredYearlyReport[index - 1].customer_name : null;
          const isNewCustomer = previousCustomer !== row.customer_name;
          return (
            <div key={index} className={`${isNewCustomer && index !== 0 ? 'mt-4' : ''}`}>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{row.customer_name}</p>
                    <p className="text-xs text-gray-500">FY: {row.financial_year}</p>
                  </div>
                  <span className={`font-semibold text-sm ${Number(row.balance) > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₹{Number(row.balance || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                  <div><span className="text-gray-500">Apr:</span> ₹{Number(row.apr || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">May:</span> ₹{Number(row.may || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Jun:</span> ₹{Number(row.jun || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Jul:</span> ₹{Number(row.jul || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Aug:</span> ₹{Number(row.aug || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Sep:</span> ₹{Number(row.sep || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Oct:</span> ₹{Number(row.oct || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Nov:</span> ₹{Number(row.nov || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Dec:</span> ₹{Number(row.dec || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Jan:</span> ₹{Number(row.jan || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Feb:</span> ₹{Number(row.feb || 0).toFixed(0)}</div>
                  <div><span className="text-gray-500">Mar:</span> ₹{Number(row.mar || 0).toFixed(0)}</div>
                </div>
                
                <div className="flex justify-between items-center text-xs border-t pt-2">
                  <div>
                    <span className="text-gray-500">Total:</span> <span className="font-medium">₹{Number(row.total || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Received:</span> <span className="text-green-600 font-medium">₹{Number(row.received || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>

  </CardContent>

  </Card>

</TabsContent>

<TabsContent value="monthlyLedger">

  <Card>

    {/* HEADER */}
    <CardHeader className="border-b bg-slate-50">

<div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

  {/* LEFT */}
  <div>

    <CardTitle>
      Monthly Hire Bills Report
    </CardTitle>

    <p className="text-sm text-muted-foreground mt-1">
      Invoice-wise monthly accounting ledger
    </p>

  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-3">

    {/* MONTH SELECTOR */}
    <Select
      value={selectedMonth}
      onValueChange={setSelectedMonth}
    >

      <SelectTrigger className="w-[180px] bg-white">

        <SelectValue placeholder="Select Month" />

      </SelectTrigger>

      <SelectContent>

        <SelectItem value="all">
          All Months
        </SelectItem>

        <SelectItem value="1">
          January
        </SelectItem>

        <SelectItem value="2">
          February
        </SelectItem>

        <SelectItem value="3">
          March
        </SelectItem>

        <SelectItem value="4">
          April
        </SelectItem>

        <SelectItem value="5">
          May
        </SelectItem>

        <SelectItem value="6">
          June
        </SelectItem>

        <SelectItem value="7">
          July
        </SelectItem>

        <SelectItem value="8">
          August
        </SelectItem>

        <SelectItem value="9">
          September
        </SelectItem>

        <SelectItem value="10">
          October
        </SelectItem>

        <SelectItem value="11">
          November
        </SelectItem>

        <SelectItem value="12">
          December
        </SelectItem>

      </SelectContent>

    </Select>

    {/* EXPORT */}
    <Button
      onClick={exportMonthlyLedgerExcel}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <span className="hidden md:inline">Export Excel</span>
    </Button>

  </div>

</div>

    </CardHeader>

    {/* CONTENT */}
<CardContent className="p-4">

  <div className="
    overflow-auto
    rounded-2xl
    border
    bg-white
  ">

    <Table>

      {/* HEADER */}
      <TableHeader>

        <TableRow className="
          bg-slate-100
          hover:bg-slate-100
          border-b
        ">

          <TableHead className="font-bold text-slate-700">
            S.No
          </TableHead>

          <TableHead className="font-bold text-slate-700">
            Invoice Date
          </TableHead>

          <TableHead className="font-bold text-slate-700">
            Invoice No
          </TableHead>

          <TableHead className="font-bold text-slate-700">
            DC Date
          </TableHead>

          <TableHead className="font-bold text-slate-700">
            DC No
          </TableHead>

          <TableHead className="font-bold text-slate-700 min-w-[280px]">
            Hotel Name
          </TableHead>

          <TableHead
          className="
            font-bold" >
            S.Total
          </TableHead>

          <TableHead
          className="
            font-bold" >
              Discount
          </TableHead>
          <TableHead
          className="
            font-bold" >
              Taxable
            </TableHead>
          <TableHead className="
            text-right
            font-bold
            text-slate-700
            bg-blue-50
          ">
            GST 
          </TableHead>

          <TableHead className="
            text-right
            font-bold
            text-slate-700
            bg-violet-50
          ">
            Transport
          </TableHead>

          <TableHead className="
            text-right
            font-bold
            text-slate-700
            bg-violet-50
          ">
            GST 
          </TableHead>

          <TableHead className="
            text-right
            font-bold
            text-slate-700
            bg-green-50
          ">
            G.Total
          </TableHead>

        </TableRow>

      </TableHeader>

      {/* BODY */}
      <TableBody>

        {filteredMonthlyLedgerData.length === 0 ? (

          <TableRow>

            <TableCell
              colSpan={11}
              className="
                text-center
                py-16
                text-slate-500
              "
            >
              No report data found
            </TableCell>

          </TableRow>

        ) : (

          filteredMonthlyLedgerData.map(
            (row: any, index: number) => {

              const gstPercentage =
                Number(
                  settings?.gstPercentage || 18
                );
const subtotal =
  Number(row.base_total  || 0);

const discount =
  Number(row.discount_amount || 0);

const taxable =
  subtotal - discount;
const gstAmount =
  Number(row.gst_amount || 0);

              const transport =
                Number(row.transport_charge || 0);

              const transportGST =
                (transport * gstPercentage) / 100;

              return (

                <TableRow
                  key={row.id}
                  className="
                    border-b
                    hover:bg-slate-50
                  "
                >

                  {/* S.NO */}
                  <TableCell className="font-medium">
                    {index + 1}
                  </TableCell>

                  {/* INVOICE DATE */}
                  <TableCell>
                    {row.invoice_date}
                  </TableCell>

                  {/* INVOICE NO */}
                  <TableCell className="font-semibold">
                    {row.invoice_no_formatted ||
                      `INV-${row.id}`}
                  </TableCell>

                  {/* DC DATE */}
                  <TableCell>
                    {row.start_date}
                  </TableCell>

                  {/* DC NO */}
                  <TableCell>
                    {row.dc_no_formatted ||
                      `DC-${row.challan_id}`}
                  </TableCell>

                  {/* CUSTOMER */}
                  <TableCell className="
                    font-medium
                    whitespace-nowrap
                  ">
                    {row.customer_name}
                  </TableCell>

<TableCell>
  ₹{subtotal.toFixed(2)}
</TableCell>

<TableCell className="text-red-600">
  - ₹{discount.toFixed(2)}
</TableCell>

<TableCell>
  ₹{taxable.toFixed(2)}
</TableCell>

                  {/* GST */}
<TableCell className="
  text-right
  bg-blue-50/60
">
  <div>
    ₹{
      Number(
        row.gst_amount || 0
      ).toFixed(2)
    }
  </div>

  <div className="text-xs text-gray-500">
    {row.gst_percentage || 0}%
  </div>
</TableCell>

                  {/* TRANSPORT */}
                  <TableCell className="
                    text-right
                    bg-violet-50/60
                  ">
                    ₹{transport.toFixed(2)}
                  </TableCell>

                  {/* TRANSPORT GST */}
                  <TableCell className="
                    text-right
                    bg-violet-50/60
                  ">
                    ₹{transportGST.toFixed(2)}
                  </TableCell>

                  {/* GRAND TOTAL */}
                  <TableCell className="
                    text-right
                    font-bold
                    bg-green-50/60
                    text-green-700
                  ">
                    ₹{Number(
                      row.total_amount || 0
                    ).toFixed(2)}
                  </TableCell>

                </TableRow>

              );
            }
          )

        )}

      </TableBody>

    </Table>

  </div>

</CardContent>

  </Card>

</TabsContent>
      </Tabs>
    </div>
  );
};
