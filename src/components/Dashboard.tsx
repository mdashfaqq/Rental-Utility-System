import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import { StockMovementModal } from '@/components/modals/StockMovementModal';
import { API_BASE_URL } from '@/services/api';
import { settingsApi } from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import {
  IndianRupee,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Users,
  User as UserIcon,
  Calendar,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Eye,
  Filter,
  RefreshCw,
  Bell,
  CheckCircle2,
  XCircle,
  Percent,
  Target,
  TrendingDown,
  Plus,
  Settings,
  FileText,

  // 🔥 Recent Activity Icons
  Receipt,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  PackageX,
  UserPlus

} from 'lucide-react';
import { useState } from 'react';
import { useEffect, useRef } from "react";

interface DashboardProps {
  onTabChange: (tab: string) => void;
  setSelectedInvoiceId: (id: any) => void;
}


export const Dashboard = ({
  onTabChange,
  setSelectedInvoiceId
}: DashboardProps) => {
  const { user } = useUser();
  const { t } = useLanguage();
  const { products, transactions, vendors, categories } = useData();
  const [loading, setLoading] = useState(false);
  type AlertType = {
  type: "error" | "warning" | "success";
  message: string;
  product?: any; // 🔥 important
};
const [stockDialogOpen, setStockDialogOpen] =
  useState(false);

const [selectedProduct, setSelectedProduct] =
  useState(null);

const [movementType, setMovementType] =
  useState<"in" | "out">("in");
const [settings, setSettings] = useState<any>(null);
const notifRef = useRef<HTMLDivElement>(null);
const [statusFilter, setStatusFilter] = useState("");
const [recentActivity, setRecentActivity] =
  useState([]);
  const fetchRecentActivity = async () => {

  const res = await fetch(
    `${API_BASE_URL}/recent-activity.php`
  );

  const data = await res.json();

  if (data.success) {
    setRecentActivity(data.activities);
  }
};
const fetchInvoices = async () => {

  try {

    setLoading(true);

    const res = await fetch(
      `${API_BASE_URL}/get-invoices.php`
    );

    const data = await res.json();

    if (data.success) {
      setInvoices(data.data || []);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      setShowNotifications(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
const [showNotifications, setShowNotifications] = useState(false);
const [isStockModalOpen, setIsStockModalOpen] = useState(false);

const [stockType, setStockType] = useState<'in' | 'out'>('in');
const handleStockIn = (product: any) => {
  setSelectedProduct(product);
  setStockType('in');
  setIsStockModalOpen(true);
};
const [invoices, setInvoices] = useState<any[]>([]);
useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-invoices.php`);
      const data = await res.json();

      if (data.success) {
        setInvoices(data.data);
      }
    } catch (err) {
      console.error("Invoice fetch error:", err);
    }
  };

  fetchInvoices();
}, []);
const displayedTransactions = [...transactions]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  .slice(0, 5);
const sortedTransactions = [...transactions].sort(
  (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
);
const QUICK_ACTIONS = [
  {
    id: "pos",
    title: "POS System",
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-100"
  },
  {
    id: "master-products",
    title: "Product Master",
    icon: Package,
    color: "text-orange-600",
    bg: "bg-orange-100"
  },
  {
    id: "master-categories",
    title: "Category Master",
    icon: PieChart,
    color: "text-pink-600",
    bg: "bg-pink-100"
  },
  {
    id: "master-vendors",
    title: "Vendor Master",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100"
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: BarChart3,
    color: "text-yellow-600",
    bg: "bg-yellow-100"
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    color: "text-gray-600",
    bg: "bg-gray-100"
  }
];

const [lowStockLimit, setLowStockLimit] = useState(10);

useEffect(() => {
  const fetchStockSettings = async () => {
    try {
      const res = await settingsApi.getSystemSettings();

      setLowStockLimit(
        Number(res.data?.lowStockAlert || 10)
      );

    } catch (err) {
      console.error("Stock settings error", err);
    }
  };

  fetchStockSettings();
}, []);

useEffect(() => {
  fetchRecentActivity();
}, []);

const [activeCards, setActiveCards] = useState<string[]>([]);

const handleRemoveCard = (id: string) => {
  setActiveCards(prev => prev.filter(card => card !== id));
};
  // Enhanced calculations
  const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  
  const todaysSales = transactions
    .filter(transaction => {
      const today = new Date();
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate.toDateString() === today.toDateString();
    })
    .reduce((sum, transaction) => sum + transaction.total, 0);

  const yesterdaysSales = transactions
    .filter(transaction => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate.toDateString() === yesterday.toDateString();
    })
    .reduce((sum, transaction) => sum + transaction.total, 0);

  const weeklyGrowth = yesterdaysSales > 0 ? ((todaysSales - yesterdaysSales) / yesterdaysSales * 100) : 0;
  
const lowStockThreshold = settings?.lowStockThreshold || 20;

const outOfStockProducts = products.filter(
  product => product.stock === 0
);

const lowStockProducts = products.filter(
  product =>
    product.stock > 0 &&
    product.stock < lowStockLimit
);
  const totalVendors = vendors.length;
  const totalCategories = categories.length;
const productSalesMap: Record<string, number> = {};

invoices.forEach(inv => {

  inv.items?.forEach(item => {

    const id = String(item.product_id);

    if (!productSalesMap[id]) {
      productSalesMap[id] = 0;
    }

    productSalesMap[id] += Number(
      item.quantity_sent || 0
    );

  });

});

const productsWithSales = products.map(product => ({
  ...product,
  soldCount: productSalesMap[String(product.id)] || 0
}));

const alerts: AlertType[] = [];

// Stock alerts
// Stock alerts (FIXED)
outOfStockProducts.forEach(product => {
  alerts.push({
    type: "error",
    message: `${product.name} is out of stock`,
    product
  });
});

lowStockProducts.forEach(product => {
  alerts.push({
    type: "warning",
    message: `${product.name} is low on stock`,
    product
  });
});

// Sales alert
if (weeklyGrowth < 0) {
  alerts.push({
    type: "warning",
    message: "Sales are decreasing compared to yesterday"
  });
}

// Good performance
if (weeklyGrowth > 10) {
  alerts.push({
    type: "success",
    message: "Sales are growing fast 🚀"
  });
}

// ✅ Get top selling products
const topProducts = productsWithSales
  .sort((a, b) => b.soldCount - a.soldCount)
  .slice(0, 5);


// ✅ Revenue from invoices
const totalRevenue = invoices.reduce(
  (sum, inv) => sum + Number(inv.total_amount || 0),
  0
);

// ✅ Today's revenue
const today = new Date().toDateString();

const todaysRevenue = invoices
  .filter(inv => new Date(inv.created_at).toDateString() === today)
  .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

// ✅ Total invoices
const totalInvoices = invoices.length;

// ✅ Items sold
const totalItemsSold = invoices.reduce((sum, inv) => {
  if (!inv.items) return sum;

  return (
    sum +
    inv.items.reduce(
      (q: number, item: any) =>
        q + Number(item.quantity_sent || 0),
      0
    )
  );
}, 0);

// ✅ Pending amount
const totalPending = invoices.reduce(
  (sum, inv) =>
    sum +
    (Number(inv.total_amount || 0) -
      Number(inv.paid_amount || 0)),
  0
);
const statsCards = [
  {
    title: "Total Revenue",
    value: `₹${totalRevenue.toLocaleString()}`,
    icon: IndianRupee,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    change: `${totalInvoices} invoices`,
    changeType: 'neutral'
  },
  {
    title: "Today's Revenue",
    value: `₹${todaysRevenue.toLocaleString()}`,
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    change: `${invoices.filter(inv =>
      new Date(inv.created_at).toDateString() === today
    ).length} invoices`,
    changeType: 'neutral'
  },
  {
    title: "Items Sold",
    value: totalItemsSold.toString(),
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    change: "From invoice items",
    changeType: 'neutral'
  },
  {
    title: "Pending Payments",
    value: `₹${totalPending.toLocaleString()}`,
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    change: "Outstanding",
    changeType: totalPending > 0 ? 'decrease' : 'neutral'
  }
];

  const additionalStats = [
    {
      title: t('Active Vendors'),
      value: totalVendors.toString(),
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: t('Avg. Transaction'),
      value: `₹${transactions.length > 0 ? Math.round(totalSales / transactions.length) : 0}`,
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : 
                  currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="space-y-8 p-6 md:p-8 transition-all duration-300">
        
        {/* Enhanced Header */}
     <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
        
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  {greeting}, {user?.name || 'User'}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  {t('Welcome to Grocery POS')} - Your business dashboard
                </p>

              </div>
              
              
             <div className="flex items-center space-x-6">

  {/* 🔔 Notification Bell */}
  <div className="relative" ref={notifRef}>
    <button onClick={() => setShowNotifications(!showNotifications)}>
      <Bell className="h-6 w-6 text-white cursor-pointer" />
    </button>

    {/* Badge */}
    {alerts.length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
        {alerts.length}
      </span>
    )}

    {/* Dropdown */}
{showNotifications && (
  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">

    {/* Header */}
    <div className="p-3 border-b font-semibold text-gray-700 flex justify-between">
      <span>Notifications</span>
      <span className="text-xs text-gray-400">{alerts.length}</span>
    </div>

    {/* List */}
    <div className="max-h-80 overflow-y-auto">

      {alerts.length === 0 ? (
        <div className="p-4 text-sm text-gray-500 text-center">
          No alerts 🎉
        </div>
      ) : (
        alerts.slice(0, 6).map((alert, index) => (
          <div
            key={index}
            className="flex items-start justify-between p-3 hover:bg-gray-50 border-b text-sm"
          >
            <div className="flex items-start space-x-2">

              {alert.type === "error" && (
                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
              )}
              {alert.type === "warning" && (
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              )}
              {alert.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
              )}

              <span className="text-gray-700">{alert.message}</span>
            </div>

            {/* Actions */}
            {alert.product ? (
              <button
                onClick={() => handleStockIn(alert.product)}
                className="text-xs text-blue-600 hover:underline"
              >
                Fix
              </button>
            ) : alert.message.includes("Sales") ? (
              <button
                onClick={() => onTabChange("reports")}
                className="text-xs text-blue-600 hover:underline"
              >
                View
              </button>
            ) : null}
          </div>
        ))
      )}
    </div>

    {/* Footer */}
    <div className="p-2 text-center border-t">
      <button
        onClick={() => onTabChange("inventory")}
        className="text-xs text-blue-600 hover:underline"
      >
        View all alerts
      </button>
    </div>

  </div>
)}
  </div>

  {/* 📅 Date */}
  <div className="text-center">
    <div className="flex items-center text-blue-100 mb-1">
      <Calendar className="h-4 w-4 mr-2" />
      <span className="text-sm">Today</span>
    </div>
    <div className="text-xl font-semibold">
      {new Date().toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric'
      })}
    </div>
  </div>

  {/* ⏰ Time */}
  <div className="text-center">
    <div className="flex items-center text-blue-100 mb-1">
      <Clock className="h-4 w-4 mr-2" />
      <span className="text-sm">Time</span>
    </div>
    <div className="text-xl font-semibold">
      {currentTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}
    </div>
  </div>

</div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Enhanced Stats Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
  {statsCards.map((stat, index) => (
    <Card
      key={index}
      className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          
          <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm flex-shrink-0`}>
            <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
          </div>

          <div
            className={`flex items-center text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
              stat.changeType === 'increase'
                ? 'text-green-700 bg-green-100'
                : stat.changeType === 'decrease'
                ? 'text-red-700 bg-red-100'
                : 'text-gray-600 bg-gray-100'
            }`}
          >
            {stat.changeType === 'increase' && (
              <ArrowUp className="h-3 w-3 mr-1" />
            )}

            {stat.changeType === 'decrease' && (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}

            {stat.change}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
            {stat.title}
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
            {stat.value}
          </p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
  {QUICK_ACTIONS.map((action) => (
    <button
      key={action.id}
      onClick={() => onTabChange(action.id)}
      className="flex items-center gap-3 px-3 py-3 rounded-xl
                 border border-gray-200 bg-white
                 hover:bg-gray-50 hover:border-gray-300
                 hover:shadow-md active:scale-95
                 transition-all duration-200
                 min-w-0"
    >
      {/* Icon */}
      <div
        className={`p-2 rounded-lg ${action.bg} flex-shrink-0`}
      >
        <action.icon
          className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color}`}
        />
      </div>

      {/* Label */}
      <span className="text-sm font-medium text-gray-700 truncate">
        {action.title}
      </span>
    </button>
  ))}
</div>
        {/* Enhanced Quick Actions */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600 text-xl">{t('POS System')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">Start a new transaction</p>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <span className="text-blue-700 font-semibold text-sm">Ready to use</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600 text-xl">{t('Inventory')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">Manage your products</p>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <span className="text-green-700 font-semibold text-sm">{products.length} Products</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-600 text-xl">{t('Vendors')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">Manage suppliers</p>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <span className="text-purple-700 font-semibold text-sm">{totalVendors} Active</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group border-0 shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <CardHeader className="text-center pb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-orange-600 text-xl">{t('Reports')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center mb-4">View analytics</p>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <span className="text-orange-700 font-semibold text-sm">View Insights</span>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          
          {/* Recent Transactions - Enhanced */}
<Card className="lg:col-span-2 border-0 shadow-lg h-[650px]">

            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  <Activity className="h-6 w-6 text-blue-600 mr-3" />
                  {t('Recent Transactions')}
                </CardTitle>
                <div className="flex space-x-2">
<select
  value={statusFilter}
  onChange={(e) =>
    setStatusFilter(e.target.value)
  }
  className="
    text-sm
    border
    rounded-lg
    px-2
    py-1
    bg-white
  "
>
  <option value="">All</option>
  <option value="paid">Paid</option>
  <option value="partial">Partial</option>
  <option value="pending">Pending</option>
</select>
<button
  onClick={() => {
    setStatusFilter("");
    fetchInvoices();
  }}
  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
>
<RefreshCw
  className={`h-4 w-4 text-gray-600 ${
    loading ? "animate-spin" : ""
  }`}
/>
</button>
                </div>
              </div>
            </CardHeader>
<CardContent className="p-0 h-[550px] overflow-y-auto">

             {invoices
  .filter(inv =>
    statusFilter
      ? inv.status === statusFilter
      : true
  )
  .slice(0, 20).map((inv: any, index: number) => (
<div
  key={inv.id}
  onClick={() => {
    setSelectedInvoiceId(inv.id);
    onTabChange("invoice-details");
  }}
    className={`

  cursor-pointer

  flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
      index !==
invoices
  .filter(inv =>
    statusFilter
      ? inv.status === statusFilter
      : true
  )
  .slice(0, 6).length - 1 ? 'border-b border-gray-100' : ''
    }`}
  >
    <div className="flex items-center space-x-4">
      
      {/* ICON */}
      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
        <FileText className="h-6 w-6 text-blue-600" />
      </div>

      {/* DETAILS */}
      <div>
        <p className="font-semibold text-gray-900">
          Invoice #{inv.id}
        </p>

        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <span>{inv.customer_name || "Walk-in"}</span>
          <span>•</span>
          <span className={`capitalize ${
            inv.status === "paid"
              ? "text-green-600"
              : inv.status === "partial"
              ? "text-yellow-600"
              : "text-red-600"
          }`}>
            {inv.status}
          </span>
          <span>•</span>
          <span>
{new Date(
  inv.created_at.replace(' ', 'T')
).toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit"
})}
          </span>
        </div>
      </div>
    </div>

    {/* AMOUNT */}
    <div className="text-right">
      <p className="font-bold text-blue-600 text-lg">
        ₹{Number(inv.total_amount || 0).toFixed(2)}
      </p>
      <p className="text-xs text-gray-500">
        Paid: ₹{Number(inv.paid_amount || 0)}
      </p>
    </div>
  </div>
))}
  {loading && (
  <div className="flex items-center justify-center h-full py-12">
    <div className="text-center">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-500">Loading transactions...</p>
    </div>
  </div>
)}
                {!loading && invoices.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                    <p className="text-sm text-gray-400">Start your first sale to see data here</p>
                  </div>
                )}
 
            </CardContent>
          </Card>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Stock Alerts - Enhanced */}
      <Card className="border-0 shadow-lg h-[320px] flex flex-col">
  <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
    <CardTitle className="flex items-center text-lg">
      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
      {t('Stock Alerts')}
      
      <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
        {lowStockProducts.length + outOfStockProducts.length}
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0 flex-1 overflow-hidden">
    <div className="overflow-y-auto pr-2 h-full">
      {[...outOfStockProducts, ...lowStockProducts].map((product) => (
<div
  key={product.id}
  onClick={() => {

    setSelectedProduct(product);

setStockType("in");
    setIsStockModalOpen(true);
  }}
  className="
    cursor-pointer
    flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0
  "
>
          <div className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                product.stock === 0 ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            ></div>

            <div>
              <p className="font-medium text-gray-900 text-sm">
                {product.name}
              </p>

              <p className="text-xs text-gray-600">
                {product.category}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p
              className={`font-bold text-sm ${
                product.stock === 0
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              {product.stock === 0
                ? 'Out of Stock'
                : `${product.stock} left`}
            </p>
          </div>
        </div>
      ))}

      {(lowStockProducts.length + outOfStockProducts.length) === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />

          <p className="text-gray-600 text-sm">
            All products are well stocked
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center text-lg">
                  <Bell className="h-5 w-5 text-blue-600 mr-2" />
                  {t('Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
  activity.type === 'sale'
    ? 'bg-green-100'

    : activity.type === 'payment'
    ? 'bg-emerald-100'

    : activity.type === 'stock'
    ? 'bg-red-100'

    : activity.type === 'return'
    ? 'bg-cyan-100'

    : activity.type === 'damage'
    ? 'bg-orange-100'

    : activity.type === 'missing'
    ? 'bg-yellow-100'

    : activity.type === 'quotation'
    ? 'bg-indigo-100'

    : activity.type === 'customer'
    ? 'bg-pink-100'

    : 'bg-blue-100'
}`}>

  {activity.type === 'sale' && (
    <Receipt className="h-4 w-4 text-green-600" />
  )}

  {activity.type === 'payment' && (
    <CreditCard className="h-4 w-4 text-emerald-600" />
  )}

  {activity.type === 'stock' && (
    <AlertTriangle className="h-4 w-4 text-red-600" />
  )}

  {activity.type === 'return' && (
    <RotateCcw className="h-4 w-4 text-cyan-600" />
  )}

  {activity.type === 'damage' && (
    <ShieldAlert className="h-4 w-4 text-orange-600" />
  )}

  {activity.type === 'missing' && (
    <PackageX className="h-4 w-4 text-yellow-600" />
  )}

  {activity.type === 'quotation' && (
    <FileText className="h-4 w-4 text-indigo-600" />
  )}

  {activity.type === 'customer' && (
    <UserPlus className="h-4 w-4 text-pink-600" />
  )}

</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.amount && (
                            <span className="text-xs font-semibold text-green-600">{activity.amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Products Section */}
        {topProducts.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center text-xl">
                <Star className="h-6 w-6 text-purple-600 mr-3" />
                {t('Top Rented Products')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Package className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{product.category}</p>
                      <p className="text-lg font-bold text-purple-600">₹{product.price}</p>
                      <p className="text-xs text-gray-500">{product.soldCount || 0} Rented</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        
<StockMovementModal
  isOpen={isStockModalOpen}
  onClose={() => setIsStockModalOpen(false)}
  product={selectedProduct}
  movementType={stockType}
/>
      </div>
    </div>
  );
};
