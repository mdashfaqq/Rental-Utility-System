import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { CartItem, useData } from '@/contexts/DataContext';
import { ProductViewSwitcher } from '@/components/ProductViewSwitcher';
import {
  Search, Scan, Plus, Minus, Trash2, CreditCard, Banknote, Printer, Package,
  RefreshCw, ShoppingCart, QrCode, CheckCircle2, Clock, LogOut, X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import 'react-toastify/dist/ReactToastify.css';
import AddCustomerModal from '@/components/AddCustomerModal';
import storeLogo from '@/assets/logo.png';
import { useAuth } from '@/components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/api';


export const POSInterface = ({
  setActiveTab,
  setSelectedQuotationId,
    setSelectedChallanId
}) => {
  const { t } = useLanguage();
  const {
    products, cart,updateRentalDates, addToCart, removeFromCart, updateCartQuantity, clearCart,
    addTransaction, categories, scanProduct,fetchData 
  } = useData();
  const { logout } = useAuth();
  const navigate = useNavigate();
const [lastCreated, setLastCreated] = useState(null);
const [loadingType, setLoadingType] = useState(null);
const [setCart] = useState([]);
const [showSuccess, setShowSuccess] = useState(false);
const [cartSheetOpen, setCartSheetOpen] = useState(false);
const { user } = useAuth();
const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
const displayUser = {
  name: user?.username || (user as any)?.full_name || 'User',
  role: user?.role || 'Staff'
};
const getItemTotal = (item: CartItem) => {
  const price = Number(item.price);
  const qty = Number(item.quantity);
    const days = item.rentalDays || 1;
    return price * qty * days;
};
  type Customer = {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
const convertToChallan = async (id) => {
  try {
    const res = await fetch(`${API_BASE_URL}/convert-to-challan.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    const data = await res.json();

    if (data.success) {
      setLastCreated({
        id: data.id,
        type: "challan"
      });
      
    }

  } catch (err) {
    console.error(err);
  }
};
type OrderMode = 'sale' | 'quotation' | 'challan' | 'invoice';

const [orderMode, setOrderMode] = useState<OrderMode>('sale');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [mode, setMode] = useState<'sale' | 'quotation' | 'challan' | 'invoice'>('sale');
const [transactionId, setTransactionId] = useState<number | null>(null);
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState('amount');
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Custom product row state
  const [showCustomProduct, setShowCustomProduct] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    itemCode: '',
    price: '',
    quantity: 1,
    unit: 'pcs'
  });

  const barcodeRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtering existing products for search/category
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory && product.stock > 0;
  });

  const calculateDays = (start?: string, end?: string) => {
  if (!start || !end) return 1;

  const s = new Date(start);
  const e = new Date(end);

  const diff = Math.ceil(
    (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diff > 0 ? diff : 1;
};


  // Cart calculations
  const [gstRate, setGstRate] = useState(0);
  const [gstEnabled, setGstEnabled] = useState(true);
const subtotal = cart.reduce(
  (sum, item) =>
    sum + (item.price * item.quantity),
  0
);

const tax = gstEnabled
  ? subtotal * gstRate
  : 0;

const grandTotal = subtotal + tax;

const discountValue =
  Number(discount || 0);

const discountAmount =
  discountType === "percentage"
    ? (grandTotal * discountValue) / 100
    : discountValue;

const finalDiscount = Math.min(
  discountAmount,
  grandTotal
);

let total =
  grandTotal - finalDiscount;

if (orderMode === 'quotation') {
  total = subtotal - finalDiscount;
}

if (orderMode === 'challan') {
  total = 0;
}
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);


  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });


  // Barcode Scan/Product Add Logic
const handleScan = () => {
  const code = barcodeInput.trim();

  if (!code) return;

  const product = scanProduct(code);

  if (product) {

    if (orderMode !== 'quotation' && product.stock <= 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock`,
        variant: 'destructive',
        duration: 3000
      });

      setBarcodeInput('');
      barcodeRef.current?.focus();

      return;
    }

    addToCart(product);

    toast({
      title: 'Product Added',
      description: `${product.name} added to cart`,
      duration: 1500
    });

    setBarcodeInput('');

    // Keep scanner active
    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 50);

  } else {

    toast({
      title: 'Product Not Found',
      description: 'No product found with this barcode.',
      variant: 'destructive',
      duration: 3000
    });

    setBarcodeInput('');

    setTimeout(() => {
      barcodeRef.current?.focus();
    }, 50);
  }
};
  const buildPrintCustomer = () => ({
    // prefer selectedCustomer.name if it’s non-empty, else fallback to the input field, else "Walk-in"
    name: (selectedCustomer?.name?.trim() || customerName?.trim() || 'Walk-in Customer'),
    phone: (selectedCustomer?.phone || customerPhone || ''),
    email: (selectedCustomer?.email || newCustomerData.email || ''),
    address: (selectedCustomer?.address || newCustomerData.address || ''),
  });

  

  // Quick add from existing products (for the ProductViewSwitcher)
  const handleQuickAdd = (product, customQuantity) => {
    if (orderMode !== 'quotation' && product.stock <= 0) {
      toast({ title: 'Out of Stock', description: `${product.name} is currently out of stock`, variant: 'destructive', duration: 3000 });
      return;
    }
    const quantity = customQuantity || product.minQuantity || 1;
    const cartItem = cart.find(item => item.id === product.id);
    if (cartItem && cartItem.quantity + quantity > product.stock) {
      toast({ title: 'Insufficient Stock', description: `Only ${product.stock} items available`, variant: 'destructive', duration: 3000 });
      return;
    }
    addToCart(product, quantity);
    toast({ title: 'Added to Cart', description: `${quantity}${product.unit} ${product.name}`, duration: 3000 });
  };

useEffect(() => {
  const fetchGST = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings.php?type=tax`);
      const data = await res.json();

      console.log("FULL API response:", data);

      // ✅ YOUR API IS OBJECT → direct access
      const gstValue = data?.gstRate;

      if (gstValue) {
        setGstRate(Number(gstValue) / 100); // 20 → 0.2
      } else {
        console.warn("GST not found, fallback to 18%");
        setGstRate(0.18);
      }

    } catch (err) {
      console.error('Failed to load GST settings', err);
      setGstRate(0.18); // fallback
    }
  };

  fetchGST();
}, []);
const getCartTotal = () => {
  return cart.reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);
};
const generateChallan = async () => {


  if (discountAmount > subtotal) {

  toast({
    title: "Invalid Discount",
    description:
      "Discount value should not be greater than the Total Value.",
    variant: "destructive"
  });

  return;
}

  if (!cart || cart.length === 0) {
    toast({
      title: "Cart is Empty",
      description: "Please add items to the cart",
      variant: "destructive"
    });
    return;
  }

      if (!selectedCustomer?.phone?.trim()) {
    toast({
      title: "Phone Number Required",
      description: "Please enter customer phone number.",
      variant: "destructive"
    });

    return;
  }
  
    const startDate = cart[0]?.rentalStartDate;
  const endDate = cart[0]?.rentalEndDate;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be greater than end date.",
        variant: "destructive"
      });

      return;
    }
  }

  const payload = {
    customer_name: selectedCustomer?.name || "Walk-in",
    customer_phone: selectedCustomer?.phone || "",
    start_date: cart[0]?.rentalStartDate || null,
    end_date: cart[0]?.rentalEndDate || null,

    items: cart.map(item => ({
      product_id: Number(item.id),
      product_name: item.name,
      quantity_sent: Number(item.quantity || 0), // ✅ important
      rental_days: Number(item.rentalDays || 1)
    }))
  };

  
  try {
    const res = await fetch(`${API_BASE_URL}/delivery-challan.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    

    // 🔥 Safe JSON parsing
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON:", text);
      throw new Error("Server response invalid");
    }

    console.log("CHALLAN RESPONSE:", data);

    if (!data.success) {
      throw new Error(data.message || "Failed to generate challan");
    }
    const newChallanId = Number(data.challan_id);

    toast({
      title: "Challan Generated",
      description: `ID: ${data.challan_id}`
    });

    setSelectedChallanId(newChallanId);

setTimeout(() => {
  setActiveTab("delivery-challan-details");
}, 0);
    await fetchData(); // refresh list
    clearCart();
    setDiscount(0);
setDiscountType("percentage");

  } catch (err) {
    console.error(err);

    toast({
      title: "Error",
      description: err.message || "Something went wrong",
      variant: "destructive"
    });
  }
};

// const handleConvert = async (doc) => {
//   if (!doc) return;

//   let nextType = "";

//   // 🔁 Decide next step
//   if (doc.type === "quotation") {
//     nextType = "challan";
//   } 
//   else if (doc.type === "challan") {
//     // 👉 if rental flow exists
//     nextType = "return"; // or "invoice" if not using return step
//   } 
//   else if (doc.type === "return") {
//     nextType = "invoice";
//   } 
//   else {
//     alert("Already final document");
//     return;
//   }

//   try {
//     const res = await fetch(`${API_BASE_URL}/convert-transaction.php`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         id: doc.id,
//         from_type: doc.type,
//         to_type: nextType
//       })
//     });

//     const data = await res.json();

//     if (data.success) {
//       // ✅ Update UI (this is IMPORTANT)
//       setLastCreated({
//         id: data.id,
//         type: nextType
//       });

//       // optional toast
//       // toast.success(`${nextType} created`);
//     } else {
//       alert(data.message || "Conversion failed");
//     }

//   } catch (err) {
//     console.error(err);
//     alert("Server error");
//   }
// };

// const handleGenerate = async (type) => {
//   let url = "";

//   if (type === "quotation") url = "/quotations.php";
//   else if (type === "challan") url = "/delivery-challan.php";
//   else if (type === "invoice") url = "/create-invoice.php";

//   const payload = {
//     customer_name: selectedCustomer?.name || "Walk-in",
//     customer_phone: selectedCustomer?.phone || "",
//     start_date: cart[0]?.rentalStartDate,
//     end_date: cart[0]?.rentalEndDate,
//     total_amount: getCartTotal(),
//     items: cart.map(item => ({
//       product_id: item.id,
//       product_name: item.name,
//       quantity_sent: item.quantity,
//       price: item.price,
//       rental_days: item.rentalDays || 1,
//       total: getItemTotal(item)
//     }))
//   };

//   try {
//     setLoadingType(type);

//     const res = await fetch(`${API_BASE_URL}${url}`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify(payload)
//     });

//     const data = await res.json();
//     console.log("API RESPONSE:", data);

//     if (!data.success) {
//       throw new Error(data.message || "Failed to create");
//     }

//     // ✅ SUCCESS FLOW
//     toast({
//   title: `${type} created`,
//   description: "Created successfully",
// });

//     setLastCreated({
//       id: data.id,
//       type
//     });

//     setShowSuccess(true);

//     // 🔥 Important: clear AFTER success confirmed
//     clearCart();

//   } catch (err) {
//     console.error(err);
//     toast({
//   title: "Error",
//   description: err.message || "Something went wrong",
//   variant: "destructive",
// });
//   } finally {
//     setLoadingType(null);
//   }
// };
const saveQuotation = async () => {



  if (discountAmount > subtotal) {

  toast({
    title: "Invalid Discount",
    description:
      "Discount value should not be greater than the Total Value.",
    variant: "destructive"
  });

  return;
}
  if (!cart || cart.length === 0) {
    toast({
      title: "Cart is Empty",
      description: "Please add items to the cart",
      variant: "destructive"
    });
    return;
  }

      if (!selectedCustomer?.phone?.trim()) {
    toast({
      title: "Phone Number Required",
      description: "Please enter customer phone number.",
      variant: "destructive"
    });

    return;
  }


    const startDate = cart[0]?.rentalStartDate;
  const endDate = cart[0]?.rentalEndDate;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      toast({
        title: "Invalid Date Range",
        description: "Start date cannot be greater than end date.",
        variant: "destructive"
      });

      return;
    }
  }
const payload = {
  customer_name: selectedCustomer?.name || "Walk-in",

  customer_phone: selectedCustomer?.phone || "",

  start_date:
    cart[0]?.rentalStartDate || null,

  end_date:
    cart[0]?.rentalEndDate || null,

  // ✅ STORE BREAKDOWN
  subtotal: Number(subtotal),

  gst_amount: Number(tax),

  discount_amount:
    Number(finalDiscount),

  discount_type:
    discountType,

  discount_value:
    Number(discount || 0),

  // ✅ FINAL TOTAL
total_amount: Number(
  grandTotal - finalDiscount
),

  gst_enabled:
    gstEnabled ? 1 : 0,

  items: cart.map(item => ({
    product_id: Number(item.id),

    product_name: item.name,

    quantity:
      Number(item.quantity || 0),

    price:
      Number(item.price || 0),

    rental_days:
      Number(item.rentalDays || 1),

    total:
      Number(getItemTotal(item) || 0)
  }))
};
  try {
    const res = await fetch(`${API_BASE_URL}/quotations.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();

    // 🔥 safe JSON parsing
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Invalid JSON:", text);
      throw new Error("Server response invalid");
    }

    console.log("RESPONSE:", data);

    if (!data.success) {
      throw new Error(data.message || "Failed to save quotation");
    }

toast({
  title: "Quotation Created",
  description: `Quotation #${data.id}`
});

const newQuotationId = Number(data.id);

setSelectedQuotationId(newQuotationId);

setTimeout(() => {
  setActiveTab("quotation-details");
}, 0);

    clearCart();

  } catch (err) {
    console.error("ERROR:", err);

    toast({
      title: "Error",
      description: err.message || "Something went wrong",
      variant: "destructive"
    });
  }
};
  const handleCustomerSearch = async () => {
    if (!customerPhone.trim()) {
      toast({
        title: 'Phone Required',
        description: 'Please enter phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/get-customer-by-phone.php?phone=${encodeURIComponent(customerPhone)}`
      );
      const data = await res.json();

      if (data.success && data.customer) {
        const c = data.customer;
        setCustomerName(c.name || '');
        setCustomerPhone(c.phone || customerPhone);
        setSelectedCustomer({
          id: Number(c.id),
          name: c.name || '',
          phone: c.phone || '',
          email: c.email || '',
          address: c.address || '',
        });
        toast({ title: 'Customer Found', description: `Welcome back, ${c.name}` });
      }
else {
  const confirmAdd = window.confirm(
    'Customer not found. Do you want to add a new customer?'
  );

  if (confirmAdd) {
    setNewCustomerData(prev => ({
      ...prev,
      phone: customerPhone,
    }));

    setShowCustomerModal(true);

  } else {

    // 🔥 CLEAR PHONE FIELD
    setCustomerPhone("");

    // 🔥 OPTIONAL: clear selected customer
    setSelectedCustomer(null);

  }
}
    } catch (err) {
      console.error('Customer search error:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch customer',
        variant: 'destructive',
      });
    }
  };

  const txnCustomer = buildPrintCustomer();

  const transaction = {
    id: `TXN-${Date.now()}`,
    items: cart,
    total,
    tax,
    discount: finalDiscount,
    paymentMethod,
    customer: txnCustomer,  // ✅ full, merged customer
    timestamp: new Date().toISOString(),
  };




  // Custom product direct-to-cart add
  const handleAddCustomProductToCart = () => {
    if (!customProduct.name || !customProduct.itemCode || !customProduct.price || Number(customProduct.quantity) < 1) {
      toast({
        title: 'Fill required fields',
        description: 'Name, Item Code, Price & Quantity required',
        variant: 'destructive'
      });
      return;
    }

    if (Number(customProduct.price) <= 0) {
      toast({ title: 'Invalid Price', description: 'Price should be positive', variant: 'destructive' });
      return;
    }
    // Temp unique id for this transaction
    const id = `custom-${Date.now()}`;
    const toAdd = {
      id,
      name: customProduct.name,
      item_code: customProduct.itemCode,
      price: Number(customProduct.price),
      quantity: Number(customProduct.quantity),
      unit: customProduct.unit,
      isCustom: true
    };
    addToCart(toAdd, toAdd.quantity);
    toast({ title: 'Custom Product Added!', description: `${toAdd.name} added to cart.` });
    setShowCustomProduct(false);
    setCustomProduct({ name: '', price: '', quantity: 1, unit: 'pcs' });
  };

  // ---- distribute discount across items for print ----
  const baseSubtotal = subtotal; // sum of price*qty for all items (before any discounts)
  const hasGlobalDiscount = finalDiscount > 0;
  const perItemManualDiscount = cart.reduce((a, i) => a + Number(i.discount || 0), 0);

  // build per-line view including allocated global discount + any per-item discount
  const perLine = cart.map((item, index) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.price) || 0;
    const lineBase = price * qty;

    // allocate global discount to this line
    const lineGlobalDisc = hasGlobalDiscount
      ? (discountType === 'percentage'
        ? lineBase * (discount / 100)
        : (baseSubtotal > 0 ? (lineBase / baseSubtotal) * finalDiscount : 0))
      : 0;

    const lineManualDisc = Number(item.discount || 0);
    const lineDiscTotal = lineGlobalDisc + lineManualDisc; // total discount for this line
    const lineFinal = lineBase - lineDiscTotal;            // amount column (net)
    const discPct = lineBase > 0 ? (lineDiscTotal / lineBase) * 100 : 0;

    return {
      index,
      name: item.name,
      qty,
      price,
      unit: item.unit || '',
      lineBase,
      lineGlobalDisc,
      lineManualDisc,
      lineDiscTotal,
      lineFinal,
      discPct,
    };
  });

  const totalLineDiscount = perLine.reduce((a, l) => a + l.lineDiscTotal, 0);
  const amountAfterDiscounts = baseSubtotal - totalLineDiscount; // pre-tax, post-discount net

  console.log('🧮 Print discount allocation:', {
    baseSubtotal,
    finalDiscount,
    perItemManualDiscount,
    totalLineDiscount,
    amountAfterDiscounts,
    perLine,
  });

  // rows for the print table
  const itemsRowsHtml = perLine.map((l) => `
  <tr>
    <td>${l.index + 1}</td>
    <td>${l.name}</td>
    <td>${l.qty}</td>
    <td>₹${l.price.toFixed(2)}</td>
    <td>₹${l.lineDiscTotal.toFixed(2)} (${l.discPct.toFixed(0)}%)</td>
    <td>₹${l.lineFinal.toFixed(2)}</td>
  </tr>
`).join('');


  const handleCustomerModalClose = async () => {
    setShowCustomerModal(false);
    if (customerPhone) {
      await handleCustomerSearch(); // will set selectedCustomer
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Payment and print logic unchanged from your original:
  const handleProcessPayment = () => {
    if (orderMode === 'quotation' || orderMode === 'challan') {
  toast({ title: 'No payment required for this mode' });
  return;
}
    if (cart.length === 0) {
      toast({ title: 'Cart Empty', description: 'Please add items to cart before processing payment', variant: 'destructive' });
      return;
    }
    setIsProcessingPayment(true);
    setTimeout(() => {
      const transaction = {
        id: `TXN-${Date.now()}`,
        items: cart,
        total,
        tax,
        discount: finalDiscount,
        paymentMethod,
        customer: { name: customerName },
        timestamp: new Date().toISOString()
      };
      addTransaction(transaction);
      clearCart();
      setDiscount(0);
      setCustomerName('');
      setIsProcessingPayment(false);
      toast({ title: 'Payment Successful!', description: 'Transaction completed successfully' });
    }, 2000);
  };

  // Optional: centralize your store info
  const STORE = {
    name: "EYE PLUS OPTICS.CARE",
    address: "7/9 Santhi Complex, Velachery Main Road, Chennai",
    phone: "9941303076",
    email: "SATHISHM1990@GMAIL.COM",
    gstin: "33DIUPS6891G12D",
    placeOfSupply: "33-Tamil Nadu",
    logoUrl: storeLogo,
  };

  // (Optional) Amount-in-words for Indian numbering
  function numberToWordsIndian(num: number): string {
    if (!isFinite(num)) return "";
    num = Math.round(num);
    if (num === 0) return "Zero";

    const ones = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];
    const tens = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
      "Eighty", "Ninety",
    ];

    const two = (n: number) => {
      if (n < 20) return ones[n];
      const t = Math.floor(n / 10);
      const o = n % 10;
      return `${tens[t]}${o ? " " + ones[o] : ""}`.trim();
    };
    const three = (n: number) => {
      const h = Math.floor(n / 100);
      const r = n % 100;
      return `${h ? ones[h] + " Hundred" + (r ? " " : "") : ""}${two(r)}`.trim();
    };

    let words = "";
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundredToOne = num;

    if (crore) words += `${three(crore)} Crore `;
    if (lakh) words += `${three(lakh)} Lakh `;
    if (thousand) words += `${three(thousand)} Thousand `;
    if (hundredToOne) words += `${three(hundredToOne)} `;
    return words.trim();
  }


  const handlePrintReceipt = () => {
    if (cart.length === 0) {
      toast({ title: 'No Items to Print', description: 'Add items to cart before printing receipt', variant: 'destructive' });
      return;
    }

    // ---- debug logs (visible in devtools) ----
    console.group('🧾 Print: inputs & state');
    console.log('cart:', cart);
    console.log('selectedCustomer:', selectedCustomer);
    console.log('customerName:', customerName);
    console.log('customerPhone:', customerPhone);
    console.log('newCustomerData:', newCustomerData);
    console.log('gstEnabled:', gstEnabled);
    console.groupEnd();

    // Bill meta
    const billNumber = `BILL-${Date.now()}`;
    const dateTime = new Date().toLocaleString();

    // Build print customer (merged)
    const customer = buildPrintCustomer();
    console.log('🧾 Print customer (merged):', customer);

    // ---- distribute discount across items for print (uses current state) ----
    const baseSubtotal = cart.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
    const hasGlobalDiscount = finalDiscount > 0;

    const perLine = cart.map((item, index) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const lineBase = price * qty;

      // allocate global discount to this line
      const lineGlobalDisc = hasGlobalDiscount
        ? (discountType === 'percentage'
          ? lineBase * (Number(discount) / 100)
          : (baseSubtotal > 0 ? (lineBase / baseSubtotal) * Number(finalDiscount) : 0))
        : 0;

      const lineManualDisc = Number(item.discount || 0);
      const lineDiscTotal = lineGlobalDisc + lineManualDisc;
      const lineFinal = lineBase - lineDiscTotal;
      const discPct = lineBase > 0 ? (lineDiscTotal / lineBase) * 100 : 0;

      return {
        index,
        name: item.name,
        qty,
        price,
        unit: item.unit || '',
        lineBase,
        lineGlobalDisc,
        lineManualDisc,
        lineDiscTotal,
        lineFinal,
        discPct,
      };
    });

    const totalLineDiscount = perLine.reduce((a, l) => a + l.lineDiscTotal, 0);
    const amountAfterDiscounts = baseSubtotal - totalLineDiscount; // pre-tax, post-discount net
    const totalQty = perLine.reduce((a, l) => a + l.qty, 0);

    // ✅ compute tax on discounted base for consistency
    const computedTax = gstEnabled ? amountAfterDiscounts * gstRate : 0;

    // Round-off & payments
    const grossBeforeRound = amountAfterDiscounts + computedTax;
    const roundedGrand = Math.round(grossBeforeRound);
    const roundOff = Number((roundedGrand - grossBeforeRound).toFixed(2));
    const paidAmount = roundedGrand; // assume fully paid; wire to input if needed
    const balanceAmount = Number((roundedGrand - paidAmount).toFixed(2));

    console.log('🧮 Print discount allocation:', {
      baseSubtotal,
      finalDiscount,
      totalLineDiscount,
      amountAfterDiscounts,
      computedTax,
      grossBeforeRound,
      roundedGrand,
      roundOff,
      perLine,
    });

    const itemsRowsHtml = perLine.map((l) => `
    <tr>
      <td>${l.index + 1}</td>
      <td>${l.name}</td>
      <td>${l.qty}</td>
      <td>₹${l.price.toFixed(2)}</td>
      <td>₹${l.lineDiscTotal.toFixed(2)} (${l.discPct.toFixed(0)}%)</td>
      <td>₹${l.lineFinal.toFixed(2)}</td>
    </tr>
  `).join('');

    const gstRow = gstEnabled
      ? `<tr><td></td><td>GST (18%): ₹${computedTax.toFixed(2)}</td></tr>`
      : '';

    // show the overall discount that was applied
    const discountRow = totalLineDiscount > 0
      ? `<tr><td></td><td>Discount: ₹${totalLineDiscount.toFixed(2)}</td></tr>`
      : '';

   const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Print Document</title>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; color: #000; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 4px; border: 1px solid #ccc; vertical-align: top; }
    th { background-color: #5c1d00; color: white; }
    .section-header { background-color: #5c1d00; color: white; font-weight: bold; }
    .no-border td { border: 0 !important; }
    .tight td { padding: 2px 4px; }

    @media print {
      body { margin: 0; padding: 0; -webkit-print-color-adjust: exact !important; }
      th, .section-header { background-color: #5c1d00 !important; color: white !important; }
    }
  </style>
</head>

<body>

  <!-- 🔥 TITLE -->
  <h2 style="text-align:center;">
    ${
      orderMode === 'quotation'
        ? 'Quotation'
        : orderMode === 'challan'
        ? 'Delivery Challan'
        : 'Final Invoice'
    }
  </h2>

  <!-- STORE -->
  <table class="no-border">
    <tr>
      <td rowspan="4" width="25%">
        <img src="${STORE.logoUrl}" width="80" height="80"/>
      </td>
      <td style="text-align:right;font-weight:bold;">EYE PLUS OPTICS.CARE</td>
    </tr>
    <tr><td style="text-align:right;">Chennai</td></tr>
    <tr><td style="text-align:right;">Phone: 9941303076</td></tr>
  </table>

  <hr />

  <!-- CUSTOMER -->
  <table class="no-border">
    <tr>
      <td>
        <strong>Customer</strong><br/>
        ${customer.name || 'Walk-in'}<br/>
        ${customer.phone || ''}
      </td>

      <td style="text-align:right;">
        Date: ${dateTime}<br/>
        Ref No: ${billNumber}
      </td>
    </tr>
  </table>

  <br/>

  <!-- ITEMS -->
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Qty</th>

        ${
          orderMode !== 'challan'
            ? `<th>Price</th><th>Total</th>`
            : ''
        }
      </tr>
    </thead>

    <tbody>
      ${cart.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${item.name}</td>
          <td>${item.quantity}</td>

          ${
            orderMode !== 'challan'
              ? `
              <td>₹${Number(item.price).toFixed(2)}</td>
              <td>₹${getItemTotal(item).toFixed(2)}</td>
              `
              : ''
          }
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- TOTALS (NOT FOR CHALLAN) -->
  ${
    orderMode !== 'challan'
      ? `
      <br/>
      <table>
        <tr>
          <td>Sub Total</td>
          <td>₹${baseSubtotal.toFixed(2)}</td>
        </tr>
        ${discountRow}
        ${gstRow}
        <tr>
          <td><strong>Grand Total</strong></td>
          <td><strong>₹${roundedGrand.toFixed(2)}</strong></td>
        </tr>
      </table>
      `
      : ''
  }

  <!-- PAYMENT (ONLY INVOICE) -->
  ${
    orderMode === 'invoice'
      ? `
      <br/>
      <table>
        <tr>
          <td>Payment Method</td>
          <td>${paymentMethod}</td>
        </tr>
        <tr>
          <td>Paid</td>
          <td>₹${paidAmount.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Balance</td>
          <td>₹${balanceAmount.toFixed(2)}</td>
        </tr>
      </table>
      `
      : ''
  }

  <!-- SIGNATURE (ONLY CHALLAN) -->
  ${
    orderMode === 'challan'
      ? `
      <br/><br/>
      <div style="display:flex; justify-content:space-between;">
        <div>Customer Signature</div>
        <div>Authorized Signature</div>
      </div>
      `
      : ''
  }

  <br/>
  <p>Thank you for your business!</p>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>

</body>
</html>
`;

    const w = window.open('', '_blank');
    if (w) { w.document.open(); w.document.write(receiptHTML); w.document.close(); }
    else {
      toast({ title: 'Popup Blocked', description: 'Please allow popups for this site.', variant: 'destructive' });
    }
  };





  // --- JSX ---
  return (
    <div className="h-full w-full min-w-0 overflow-hidden bg-transparent flex flex-col">
      {/* Header */}
<div className="bg-card/90 backdrop-blur border-b border-border p-3 sm:p-4 flex-shrink-0">
  <div className="flex items-center justify-between gap-2 sm:gap-4">
    
    {/* LEFT SIDE */}
    <div className="flex-1 min-w-0">
      <h1 className="font-display text-2xl sm:text-3xl tracking-tight truncate">
        Point of Sale
      </h1>

      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2 sm:gap-4 mt-1 sm:mt-2">
        
        {/* TIME */}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
          {currentTime.toLocaleTimeString()}
        </span>
      </p>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center gap-2 sm:gap-6 text-xs sm:text-sm">
      
      {/* ITEMS */}
      <div className="text-center hidden sm:block">
        <div className="text-xl sm:text-2xl font-semibold">
          {totalItemsCount}
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Items
        </div>
      </div>

      {/* TOTAL */}
      <div className="text-center">
        <div className="text-lg sm:text-2xl font-semibold">
          ₹{total.toLocaleString()}
        </div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          Total
        </div>
      </div>

      {/* LOGOUT */}
      <Button
        variant="outline"
        size="sm"
        className="px-2 sm:px-4"
        onClick={handleLogout}
      >
        <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </div>
  </div>
</div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 min-w-0 w-full flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_24rem]">
            {/* PRODUCTS PANEL */}
            
<div className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden min-h-0 min-w-0">
                {/* Search/filter/add-controls */}
              <div className="bg-card p-3 sm:p-4 rounded-2xl border border-black/[0.04] mb-3 sm:mb-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10 sm:h-11"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48 h-10 sm:h-11">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    variant={isScanning ? "destructive" : "default"}
                    size="sm"
                    onClick={() => {
                      setIsScanning(!isScanning);
                      if (!isScanning) setTimeout(() => barcodeRef.current?.focus(), 100);
                    }}
                  >
                    <Scan className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{isScanning ? 'Cancel Scan' : 'Scan Barcode'}</span>
                    <span className="sm:hidden">{isScanning ? 'Cancel' : 'Scan'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearCart()}
                    disabled={cart.length === 0}
                  >
                    <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                  {/* <Button
                    variant="outline"
                    onClick={() => setShowCustomProduct(open => !open)}
                    className="ml-auto"
                    disabled={showCustomProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Product to Cart
                  </Button> */}
                </div>

                {isScanning && (
                  <div className="mt-4 p-4 bg-accent rounded-xl border border-transparent">
                    <div className="text-center mb-3">
                      <QrCode className="h-8 w-8 text-foreground mx-auto mb-2" />
                      <p className="text-foreground">Ready to scan barcode</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        ref={barcodeRef}
                        placeholder="Scan or enter barcode..."
                        value={barcodeInput}
                        onChange={e => setBarcodeInput(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleScan()}
                        className="flex-1"
                      />
                      <Button onClick={handleScan} disabled={!barcodeInput.trim()}>
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Inline custom product-to-cart row */}
              {showCustomProduct && (
                <div className="mb-4 p-4 border bg-muted rounded-2xl flex flex-col md:flex-row md:items-end gap-2">
                  <Input
                    placeholder="Name*"
                    value={customProduct.name}
                    onChange={e => setCustomProduct(data => ({ ...data, name: e.target.value }))}
                    className="md:w-32"
                  />
                  <Input
                    placeholder="Item Code*"
                    value={customProduct.itemCode}
                    onChange={e => setCustomProduct(data => ({ ...data, itemCode: e.target.value }))}
                    className="md:w-32"
                  />

                  <Input
                    type="number"
                    placeholder="Price*"
                    value={customProduct.price}
                    min="0"
                    onChange={e => setCustomProduct(data => ({ ...data, price: e.target.value }))}
                    className="md:w-24"
                  />
                  <Input
                    type="number"
                    placeholder="Quantity*"
                    value={customProduct.quantity}
                    min="1"
                    onChange={e => setCustomProduct(data => ({ ...data, quantity: e.target.value }))}
                    className="md:w-20"
                  />
                  <Input
                    placeholder="Unit"
                    value={customProduct.unit}
                    onChange={e => setCustomProduct(data => ({ ...data, unit: e.target.value }))}
                    className="md:w-20"
                  />
                  <div className="flex gap-1">
                    <Button type="button" size="sm" onClick={handleAddCustomProductToCart}>
                      <Plus className="h-4 w-4" /> Add
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowCustomProduct(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Products Display */}
<div className="flex-1 bg-card rounded-2xl border border-black/[0.04] overflow-hidden relative flex flex-col">
                <div className="p-3 border-b flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Products ({filteredProducts.length})</span>
                  
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                  <ProductViewSwitcher
                    products={filteredProducts}
                    onQuickAdd={handleQuickAdd}
                    defaultView="table"
                  />
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No products found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <AddCustomerModal
              show={showCustomerModal}
              onClose={handleCustomerModalClose}
              customerPhone={customerPhone}
              newCustomerData={newCustomerData}
              setNewCustomerData={setNewCustomerData}
              setCustomerName={setCustomerName}
            />



            {cartSheetOpen && (
              <button
                className="lg:hidden fixed inset-0 z-30 bg-ink/25 backdrop-blur-[2px]"
                onClick={() => setCartSheetOpen(false)}
              />
            )}

            {/* Cart and Payment Panel (Right) */}
            <div className={`
              bg-card flex flex-col overflow-hidden min-h-0 min-w-0
              lg:relative lg:w-full lg:border-l lg:h-auto lg:translate-y-0 lg:flex
              ${cartSheetOpen
                ? 'fixed inset-x-0 bottom-0 z-40 h-[78vh] rounded-t-[28px] shadow-soft border-t flex'
                : 'hidden lg:flex'}
            `}>
              {/* Header (sticky) */}
              <div className="p-3 border-b flex-shrink-0 sticky top-0 bg-card z-10">
                <div className="flex items-center justify-between">
                  <span className="flex items-center font-semibold text-base">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Cart ({cart.length})
                  </span>
                  <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setCartSheetOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    disabled={cart.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
              </div>

{/* Scrollable cart items */}
<div className="flex-1 overflow-y-auto min-h-0">
  <div className="p-3 space-y-2">
    {cart.map((item) => (
      <div
        key={item.id}
className="p-3 bg-muted/40 rounded-xl border-l-2 border-primary"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900 mb-0.5 break-words">
              {item.name}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-700">
                ₹{Number(item.price).toFixed(2)}/{item.unit}
              </span>

              <span className="text-sm font-semibold text-green-700">
                ₹{getItemTotal(item).toFixed(2)}
              </span>
            </div>

            {/* ✅ Rental Breakdown */}
          
              <div className="text-xs text-blue-600 mt-1">
                {item.price} × {item.quantity} × {item.rentalDays || 1} days
              </div>
            
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-1.5 ml-3">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                updateCartQuantity(item.id, Math.max(0, item.quantity - 1))
              }
            >
              <Minus className="h-4 w-4" />
            </Button>

            <span className="text-sm font-semibold w-9 text-center bg-white px-2 py-1 rounded border">
              {item.quantity}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() =>
                updateCartQuantity(item.id, item.quantity + 1)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ✅ RENTAL UI (INSIDE ITEM) */}
    
          <div className="mt-3 space-y-2 bg-accent/70 p-2 rounded-xl">

            {/* Start Date */}
{/* Start Date */}
<div className="flex gap-2 items-center">
  <label className="text-xs w-20">Start</label>
  <input
    type="date"
    value={item.rentalStartDate || ""}
    onChange={(e) =>
      updateRentalDates(
        item.id,
        e.target.value, // ✅ allow changing start date
        item.rentalEndDate
      )
    }
    className="border rounded px-2 py-1 text-sm w-full"
  />
</div>

            {/* End Date */}
            <div className="flex gap-2 items-center">
              <label className="text-xs w-20">End</label>
              <input
                type="date"
                value={item.rentalEndDate || ""}
                min={item.rentalStartDate}
                onChange={(e) =>
                  updateRentalDates(item.id, item.rentalStartDate, e.target.value)
                }
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>

            {/* Days */}
            <div className="text-xs text-gray-600">
              Days:{" "}
              <span className="font-semibold">
                {item.rentalDays || 1}
              </span>
            </div>
          </div>
        
      </div>
    ))}

    {/* Empty State */}
    {cart.length === 0 && (
      <div className="text-center py-10">
        <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cart is empty</p>
      </div>
    )}
  </div>
</div>

              {/* Compact checkout section */}
              {orderMode === 'challan' && (
  <div className="border-t p-3">
    <div className="bg-accent p-3 rounded-xl text-xs text-foreground">
      💡 Pricing will be calculated during final invoice
    </div>
  </div>
)}
              <div className="border-t p-3 flex-shrink-0 space-y-3">
                <div className="space-y-2 p-3 bg-green-50 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Subtotal:</span>
                    <span className="text-sm font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={gstEnabled}
                        onChange={(e) => setGstEnabled(e.target.checked)}
                      />
                    GST applicable ({(gstRate * 100).toFixed(0)}%)
                    </label>
                    <span className="text-sm font-semibold">
                      {gstEnabled ? `₹${tax.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <select
                        value={discountType}
                        onChange={e => setDiscountType(e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-white"
                      >
                        <option value="amount">₹</option>
                        <option value="percentage">%</option>
                      </select>
<Input
  type="number"
  step="1"
  min="0"
  value={discount}
  onChange={(e) =>
    setDiscount(
      Math.floor(Number(e.target.value) || 0)
    )
  }
  className="w-16 h-8 text-xs"
/>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold">Total:</span>
                      <span className="text-lg font-bold text-green-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Phone + Search */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">Customer Phone</label>
                  <div className="flex gap-2">
<Input
  type="tel"
  inputMode="numeric"
  pattern="[0-9]*"
  maxLength={10}
  value={customerPhone}
  onChange={(e) => {
    // 🔥 Allow only numbers
    const numericValue = e.target.value.replace(/\D/g, "");
    setCustomerPhone(numericValue);
  }}
  placeholder="Enter phone number"
/>
                    <Button variant="secondary" onClick={handleCustomerSearch} className="h-9 px-3">
                      <Search className="h-4 w-4 mr-1" /> Search
                    </Button>
                  </div>
                </div>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-700">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  {/* <label className="text-xs font-medium text-gray-700">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'card', 'upi'].map((method) => (
                      <Button
                        key={method}
                        variant={paymentMethod === method ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod(method)}
                        className="capitalize text-xs h-9"
                      >
                        {method === 'cash' && <Banknote className="h-4 w-4 mr-1" />}
                        {method === 'card' && <CreditCard className="h-4 w-4 mr-1" />}
                        {method}
                      </Button>
                    ))}
                  </div> */}
<div className="grid mt-4">

<Button onClick={saveQuotation}>
  Create Estimate
</Button>

{/* <Button onClick={generateChallan}>
  Rent / Give Items
</Button> */}

{showSuccess && lastCreated && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-[380px] text-center animate-in fade-in zoom-in-95">

      {/* ICON */}
      <div className="mx-auto mb-3 flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
        <span className="text-green-600 text-xl">✓</span>
      </div>

      {/* TITLE */}
      <h2 className="text-lg font-semibold text-gray-800">
        {lastCreated.type === 'quotation' && 'Estimate Created'}
        {lastCreated.type === 'challan' && 'Items Issued Successfully'}
      </h2>

      {/* SUBTEXT */}
      <p className="text-sm text-gray-500 mt-1">
        {lastCreated.type.toUpperCase()} #{lastCreated.id}
      </p>

      {/* ACTIONS */}
      <div className="mt-5 space-y-2">

        {/* VIEW */}
<Button
  className="w-full"
  variant="outline"
  onClick={() => navigate(`/quotation/${lastCreated.id}`)}
>
  View {lastCreated.type}
</Button>

        {/* CONVERT → INVOICE */}
        {lastCreated.type === 'challan' && (
          <Button
            className="w-full"
            onClick={async () => {
              try {
                setConverting(true);

                const res = await fetch(`${API_BASE_URL}/convert-challan-to-invoice.php`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ challan_id: lastCreated.id })
                });

                const data = await res.json();

                if (data.success) {
                  navigate(`/invoice/${data.invoice_id}`);
                } else {
                  alert(data.message || "Conversion failed");
                }
              } catch (err) {
                console.error(err);
                alert("Server error");
              } finally {
                setConverting(false);
              }
            }}
            disabled={converting}
          >
            {converting ? "Converting..." : "Convert to Invoice"}
          </Button>
        )}

        {/* NEW SALE */}
        <Button
          className="w-full"
          variant="ghost"
          onClick={() => {
            setShowSuccess(false);
            setLastCreated(null);
          }}
        >
          New Sale
        </Button>

      </div>
    </div>
  </div>
)}
{lastCreated && (
  <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex justify-between items-center mt-4">

    <div>
      <p className="text-sm font-medium text-green-700">
        {lastCreated.type.toUpperCase()} #{lastCreated.id} created
      </p>
    </div>

    <div className="flex gap-2">

      <Button
        size="sm"
        onClick={() => navigate(`/transactions/${lastCreated.id}`)}
      >
        View
      </Button>

      {lastCreated.type === "quotation" && (
        <Button
          size="sm"
          onClick={() => convertToChallan(lastCreated.id)}
        >
          Convert
        </Button>
      )}

    </div>

  </div>
)}
                </div>
              </div>
            </div>

            {/* End cart/pay panel */}
        </div>

        <button
          type="button"
          onClick={() => setCartSheetOpen(true)}
          className={`lg:hidden mx-3 mb-2 rounded-full bg-primary text-primary-foreground px-5 py-3 flex items-center justify-between shadow-soft ${cartSheetOpen ? 'invisible' : ''}`}
        >
          <span className="flex items-center gap-2 font-medium">
            <ShoppingCart className="h-4 w-4" />
            Cart · {cart.length} items
          </span>
          <span className="font-semibold">₹{total.toLocaleString()}</span>
        </button>
      </div>
    </div>
  );
};
