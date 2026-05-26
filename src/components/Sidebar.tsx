import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Grid, Box, Settings,
  BarChart3, Database, ChevronDown, ChevronRight, LogOut, Store, PlusSquare,
  MinusSquare, Activity, Eye 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/components/auth/AuthContext';
import { FileText, ClipboardList, Truck, Receipt } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(0);
  const { t } = useLanguage();
  const { storeSettings } = useAppSettings();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayUser = {
    name: user?.username || (user as any)?.full_name || 'User',
    email: user?.email || '',
    avatar: (user as any)?.avatar || '',
    role: user?.role || 'Staff'
  };
  const initials = (displayUser.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Error during logout');
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard'), badge: null, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'pos', icon: ShoppingCart, label: t('POS System'), color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'inventory', icon: Package, label: t('Inventory'), badge: notifications > 0 ? notifications.toString() : null, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    // { id: 'prescriptions', icon: Eye, label: 'Glass Prescription', color: 'text-rose-600', bgColor: 'bg-rose-100' },
       {
      id: 'masters', icon: Database, label: 'Masters', isExpandable: true, color: 'text-indigo-600', bgColor: 'bg-indigo-100',
      submenu: [
        { id: 'master-products', label: 'Product Master', icon: Box, color: 'text-orange-600' },
        { id: 'master-categories', label: 'Category Master', icon: Grid, color: 'text-pink-600' },
        {id: 'master-subcategories', label: 'Subcategory Master', icon: Grid, color: 'text-pink-600' },
        { id: 'master-vendors', label: 'Vendor Master', icon: Users, color: 'text-teal-600' },
          { id: 'master-customers', label: 'Customer Master', icon: Users, color: 'text-blue-600' }
      ]
    }, 
{
  id: 'rental',
  icon: FileText, // better than Database (documents module)
  label: 'Rental',
  isExpandable: true,
  color: 'text-indigo-600',
  bgColor: 'bg-indigo-100',

  submenu: [
    {
      id: 'rental-quotations',
      label: 'Quotations',
      icon: ClipboardList,
      color: 'text-blue-600',
      path: '/quotation-list' // 👈 add path for direct navigation, 
    },
    {
      id: 'delivery-challans',
      label: 'Delivery Challans',
      icon: Truck,
      color: 'text-orange-600',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: Receipt,
      color: 'text-green-600'
    }
  ]
},
{
  id: 'ledger-list',
  icon: Users,
  label: 'Customer Ledger',
  color: 'text-indigo-600',
  bgColor: 'bg-indigo-100'
},
    { id: 'reports', icon: BarChart3, label: 'Reports & Analytics', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'settings', icon: Settings, label: t('Settings'), color: 'text-gray-600', bgColor: 'bg-gray-100' }
  ];

  const quickActions = [
    { id: 'new-sale', icon: PlusSquare, label: 'New Sale', color: 'text-green-600' },
    // { id: 'prescriptions', icon: Eye, label: 'Prescription', color: 'text-rose-600' },
    { id: 'add-product', icon: Package, label: 'Add Product', color: 'text-blue-600' },
    { id: 'view-reports', icon: BarChart3, label: 'Reports', color: 'text-purple-600' },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className="h-full">
        <div className={`
  bg-gradient-to-b
  from-white via-gray-50 to-gray-100
  shadow-2xl
  transition-[width]
  duration-300
  ease-in-out
  ${isCollapsed ? 'w-20' : 'w-72'}
  h-full
  flex
  flex-col
  border-r
  border-gray-200
  overflow-hidden
`}>
          
{/* Header: Logo + Collapse */}
<div className="p-4 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white">

  {/* LEFT */}
<div
  className={`
    flex items-center
    overflow-hidden
    flex-1 min-w-0
    transition-all duration-300
    ${isCollapsed ? 'w-0 opacity-0' : 'opacity-100'}
  `}
>

  {/* LOGO */}
  <div
    className="
      flex items-center justify-center
      w-10 h-10 min-w-[40px]
      rounded-2xl
      bg-white/10
      backdrop-blur-md
      border border-white/10
      shadow-sm
    "
  >
    <Store className="h-5 w-5 text-white" />
  </div>

  {/* TEXT */}
  <div className="ml-3 min-w-0">

    <h1
      className="
        text-sm font-semibold
        text-white
        truncate
        tracking-tight
        leading-none
      "
    >
      {storeSettings.name}
    </h1>

    <p
      className="
        mt-1
        text-[11px]
        text-white/60
        truncate
        font-medium
      "
    >
      POS Workspace
    </p>

  </div>

</div>

  {/* BUTTON */}
  <button
    onClick={() => setIsCollapsed(!isCollapsed)}
    className="
      ml-2
      min-w-[36px]
      h-9
      w-9
      flex
      items-center
      justify-center
      rounded-lg
      hover:bg-white/20
      transition
      flex-shrink-0
    "
  >
    {isCollapsed
      ? <PlusSquare className="h-4 w-4" />
      : <MinusSquare className="h-4 w-4" />
    }
  </button>

</div>

          {/* User Profile */}
<div
  className={`
    overflow-hidden
    transition-all
    duration-300
    border-b border-gray-200
    bg-gradient-to-r from-gray-50 to-blue-50
    ${isCollapsed ? 'max-h-0 opacity-0 p-0' : 'max-h-40 opacity-100 p-4'}
  `}
>
  <div className="flex items-center space-x-3">
    <Avatar className="ring-2 ring-blue-200">
      <AvatarImage src={displayUser.avatar} />
      <AvatarFallback className="bg-zinc-900 text-white">
        {initials}
      </AvatarFallback>
    </Avatar>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">
        {displayUser.name}
      </p>

<Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 text-xs px-2 py-0">
  {displayUser.role}
</Badge>
    </div>
  </div>
</div>

          {/* Search */}
<div
  className={`
    overflow-hidden
    transition-all
    duration-300
    border-b border-gray-200
    ${isCollapsed ? 'max-h-0 opacity-0 p-0' : 'max-h-32 opacity-100 p-4'}
  `}
>
  <input
    type="text"
    placeholder="Search menu items..."
    value={searchQuery}
    onChange={e => setSearchQuery(e.target.value)}
    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none"
  />
</div>
          
          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                {quickActions.map(action => (
                  <Tooltip key={action.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
  switch (action.id) {
    case 'new-sale':
      onTabChange('pos');
      break;
    case 'add-product':
      onTabChange('master-products');
      break;
    case 'view-reports':
      onTabChange('reports');
      break;
    default:
      onTabChange(action.id);
  }
}}
                        className="p-3 bg-white rounded-lg hover:bg-gray-100 border border-gray-200 group w-full flex items-center justify-center"
                        title={action.label}
                      >
                        <action.icon className={`h-5 w-5 ${action.color}`} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {filteredMenuItems.map(item => (
              <div key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        item.isExpandable ? toggleMenu(item.id) : onTabChange(item.id);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl group ${
                        activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow transform scale-105'
                          : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200'
                      }`}
                    >
                      <div className={`
  flex items-center w-full
  ${isCollapsed ? 'justify-center' : 'space-x-3'}
`}>
                        <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-white/20' : item.bgColor}`}>
                          <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : item.color}`} />
                        </div>
                        {!isCollapsed && (
<div
  className={`
    overflow-hidden
    whitespace-nowrap
    transition-all
    duration-300
    ${isCollapsed
      ? 'w-0 opacity-0'
      : 'w-auto opacity-100'}
  `}
>
  {item.label}
</div>
                        )}
                      </div>
                      {item.isExpandable && !isCollapsed && (
                        <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedMenus[item.id] ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
                {/* Submenu */}
                {item.isExpandable && expandedMenus[item.id] && !isCollapsed && (
                  <div className="mt-2 ml-7 space-y-1">
                    {item.submenu?.map(subItem => (
                      <button
                        key={subItem.id}
                        onClick={() => onTabChange(subItem.id)}
                        className={`w-full flex items-center space-x-2 py-2 px-3 rounded-lg text-sm ${
                          activeTab === subItem.id
                            ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-500'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {subItem.icon && <subItem.icon className={`h-4 w-4 ${subItem.color || 'text-gray-500'}`} />}
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center ${!isCollapsed && 'justify-start'} space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700`}
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && <span className="font-medium">Logout</span>}
                </button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              )}
            </Tooltip>
            {!isCollapsed && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
                <span>Version 1.0.0</span>
                <span className="flex items-center space-x-1">
                  <Activity className="h-3 w-3 text-green-500" /><span>Online</span>
                </span>
              </div>
            )}
          </div>

        </div>
      </div>
    </TooltipProvider>
  );
};
