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
    color: "text-sage",
    bg: "bg-champagne"
  },
  {
    id: "master-products",
    title: "Product Master",
    icon: Package,
    color: "text-foreground",
    bg: "bg-accent"
  },
  {
    id: "master-categories",
    title: "Category Master",
    icon: PieChart,
    color: "text-foreground",
    bg: "bg-muted"
  },
  {
    id: "master-vendors",
    title: "Vendor Master",
    icon: Users,
    color: "text-foreground",
    bg: "bg-champagne"
  },
  {
    id: "reports",
    title: "Reports & Analytics",
    icon: BarChart3,
    color: "text-foreground",
    bg: "bg-accent"
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    color: "text-muted-foreground",
    bg: "bg-muted"
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
    color: 'text-sage',
    bgColor: 'bg-champagne',
    change: `${totalInvoices} invoices`,
    changeType: 'neutral'
  },
  {
    title: "Today's Revenue",
    value: `₹${todaysRevenue.toLocaleString()}`,
    icon: TrendingUp,
    color: 'text-foreground',
    bgColor: 'bg-accent',
    change: `${invoices.filter(inv =>
      new Date(inv.created_at).toDateString() === today
    ).length} invoices`,
    changeType: 'neutral'
  },
  {
    title: "Items Sold",
    value: totalItemsSold.toString(),
    icon: Package,
    color: 'text-foreground',
    bgColor: 'bg-muted',
    change: "From invoice items",
    changeType: 'neutral'
  },
  {
    title: "Pending Payments",
    value: `₹${totalPending.toLocaleString()}`,
    icon: AlertTriangle,
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    change: "Outstanding",
    changeType: totalPending > 0 ? 'decrease' : 'neutral'
  }
];

  const additionalStats = [
    {
      title: t('Active Vendors'),
      value: totalVendors.toString(),
      icon: Users,
      color: 'text-foreground',
      bgColor: 'bg-muted'
    },
    {
      title: t('Avg. Transaction'),
      value: `₹${transactions.length > 0 ? Math.round(totalSales / transactions.length) : 0}`,
      icon: Target,
      color: 'text-foreground',
      bgColor: 'bg-accent'
    }
  ];

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : 
                  currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-full bg-transparent">
      <div className="space-y-6 p-4 sm:p-6 md:p-8">
        
        {/* Enhanced Header */}
     <div className="relative rounded-3xl bg-card border border-black/[0.04] p-6 md:p-8 shadow-soft">
        
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Today's overview</p>
                <h1 className="font-display text-3xl md:text-5xl font-normal mb-2 text-foreground">
                  {greeting}, {user?.name || 'User'}
                </h1>
                <p className="text-muted-foreground">
                  {t('Welcome to Grocery POS')}
                </p>

              </div>
              
              
             <div className="flex items-center space-x-6">

  {/* 🔔 Notification Bell */}
  <div className="relative z-30" ref={notifRef}>
    <button
      type="button"
      onClick={() => setShowNotifications(!showNotifications)}
      className="relative rounded-full p-1.5 hover:bg-muted"
    >
      <Bell className="h-6 w-6 text-foreground" />
      {alerts.length > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] leading-[18px] text-center rounded-full">
          {alerts.length}
        </span>
      )}
    </button>

{showNotifications && (
  <div className="absolute left-0 sm:left-auto sm:right-0 top-11 z-[80] w-[min(20rem,calc(100vw-2.5rem))] bg-card rounded-2xl shadow-soft border overflow-hidden">
    <div className="p-3 border-b font-semibold text-foreground flex justify-between">
      <span>Notifications</span>
      <span className="text-xs text-muted-foreground">{alerts.length}</span>
    </div>

    <div className="max-h-80 overflow-y-auto no-scrollbar">
      {alerts.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground text-center">
          No alerts
        </div>
      ) : (
        alerts.slice(0, 6).map((alert, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-3 hover:bg-muted/60 border-b last:border-b-0 text-sm"
          >
            <div className="mt-0.5 shrink-0">
              {alert.type === "error" && (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              {alert.type === "warning" && (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              {alert.type === "success" && (
                <CheckCircle2 className="h-4 w-4 text-sage" />
              )}
            </div>

            <p className="min-w-0 flex-1 text-foreground leading-snug break-words">
              {alert.message}
            </p>

            {alert.product ? (
              <button
                onClick={() => handleStockIn(alert.product)}
                className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium"
              >
                Fix
              </button>
            ) : alert.message.includes("Sales") ? (
              <button
                onClick={() => onTabChange("reports")}
                className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium"
              >
                View
              </button>
            ) : null}
          </div>
        ))
      )}
    </div>

    <div className="p-2 text-center border-t">
      <button
        onClick={() => onTabChange("inventory")}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        View all alerts
      </button>
    </div>
  </div>
)}
  </div>

  {/* 📅 Date */}
  <div className="text-center">
    <div className="flex items-center text-muted-foreground mb-1">
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
    <div className="flex items-center text-muted-foreground mb-1">
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
        </div>

        {/* Enhanced Stats Cards */}
<div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 xl:grid xl:grid-cols-4 xl:overflow-visible">
  {statsCards.map((stat, index) => (
    <Card
      key={index}
      className="min-w-[78%] sm:min-w-[46%] xl:min-w-0 snap-start"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          
          <div className={`p-3 rounded-xl ${stat.bgColor} shadow-sm flex-shrink-0`}>
            <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
          </div>

          <div
            className={`flex items-center text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
              stat.changeType === 'increase'
                ? 'text-foreground bg-champagne'
                : stat.changeType === 'decrease'
                ? 'text-foreground bg-muted'
                : 'text-muted-foreground bg-muted'
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
          <p className="text-sm font-medium text-muted-foreground mb-1 truncate">
            {stat.title}
          </p>

          <p className="text-2xl sm:text-3xl font-semibold text-foreground break-words">
            {stat.value}
          </p>
        </div>
      </CardContent>
    </Card>
  ))}
</div>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
  {QUICK_ACTIONS.map((action) => (
    <button
      key={action.id}
      onClick={() => onTabChange(action.id)}
      className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 py-3 rounded-xl
                 border border-border bg-card
                 hover:bg-muted/60
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
      <span className="text-xs sm:text-sm font-medium text-foreground truncate text-center sm:text-left">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          
          {/* Recent Transactions - Enhanced */}
<Card className="lg:col-span-2 h-[500px] lg:h-[650px] flex flex-col overflow-hidden">

            <CardHeader className="bg-muted/40 rounded-t-2xl border-b border-border/60 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl font-display font-normal">
                  <Activity className="h-5 w-5 text-sage mr-3" />
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
  className="p-2 hover:bg-muted rounded-lg transition-colors"
>
<RefreshCw
  className={`h-4 w-4 text-muted-foreground ${
    loading ? "animate-spin" : ""
  }`}
/>
</button>
                </div>
              </div>
            </CardHeader>
<CardContent className="p-0 flex-1 min-h-0 overflow-y-auto no-scrollbar">

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
    className="cursor-pointer flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors border-b border-border/60 last:border-b-0 min-w-0"
  >
    <div className="flex items-center gap-3 min-w-0 flex-1">
      
      {/* ICON */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center shrink-0">
        <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
      </div>

      {/* DETAILS */}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground truncate">
          Invoice #{inv.id}
        </p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
          <span className="truncate">{inv.customer_name || "Walk-in"}</span>
          <span className="shrink-0">•</span>
          <span className="capitalize text-foreground shrink-0">
            {inv.status}
          </span>
          <span className="shrink-0 hidden sm:inline">•</span>
          <span className="truncate hidden sm:inline">
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
    <div className="text-right shrink-0">
      <p className="font-bold text-foreground text-lg">
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
      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
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
      <Card className="h-[320px] flex flex-col overflow-hidden">
  <CardHeader className="bg-muted/40 rounded-t-2xl">
    <CardTitle className="flex items-center text-lg font-display font-normal">
      <AlertTriangle className="h-5 w-5 text-foreground mr-2" />
      {t('Stock Alerts')}
      
      <span className="ml-auto bg-accent text-foreground text-xs font-medium px-2 py-1 rounded-full">
        {lowStockProducts.length + outOfStockProducts.length}
      </span>
    </CardTitle>
  </CardHeader>

  <CardContent className="p-0 flex-1 overflow-hidden">
    <div className="overflow-y-auto no-scrollbar h-full min-h-0">
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
            <div className="w-3 h-3 rounded-full bg-champagne border border-border"></div>

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
            <p className="font-medium text-sm text-foreground">
              {product.stock === 0
                ? 'Out of Stock'
                : `${product.stock} left`}
            </p>
          </div>
        </div>
      ))}

      {(lowStockProducts.length + outOfStockProducts.length) === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />

          <p className="text-gray-600 text-sm">
            All products are well stocked
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
            {/* Recent Activity */}
            <Card className="overflow-hidden flex flex-col max-h-[320px]">
              <CardHeader className="bg-muted/40 rounded-t-2xl shrink-0">
                <CardTitle className="flex items-center text-lg font-display font-normal">
                  <Bell className="h-5 w-5 text-foreground mr-2" />
                  {t('Recent Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
                <div className="max-h-64 overflow-y-auto no-scrollbar">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-accent">

  {activity.type === 'sale' && (
    <Receipt className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'payment' && (
    <CreditCard className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'stock' && (
    <AlertTriangle className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'return' && (
    <RotateCcw className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'damage' && (
    <ShieldAlert className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'missing' && (
    <PackageX className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'quotation' && (
    <FileText className="h-4 w-4 text-foreground" />
  )}

  {activity.type === 'customer' && (
    <UserPlus className="h-4 w-4 text-foreground" />
  )}

</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.amount && (
                            <span className="text-xs font-semibold text-foreground">{activity.amount}</span>
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
          <Card>
            <CardHeader className="bg-muted/40 rounded-t-2xl">
              <CardTitle className="flex items-center text-xl font-display font-normal">
                <Star className="h-6 w-6 text-foreground mr-3" />
                {t('Top Rented Products')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 truncate">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-1 sm:mb-2 truncate">{product.category}</p>
                      <p className="text-sm sm:text-lg font-bold text-foreground">₹{product.price}</p>
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
