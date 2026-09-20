import { useState, useEffect } from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Grid, Box, Settings,
  BarChart3, Database, ChevronDown, LogOut, Store, PlusSquare,
  MinusSquare, Activity, FileText, ClipboardList, Truck, Receipt
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/components/auth/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { storeSettings } = useAppSettings();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    if (isMobile && onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const isItemActive = (item: { id: string; submenu?: { id: string }[] }) => {
    if (activeTab === item.id) return true;
    return item.submenu?.some(sub => sub.id === activeTab);
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('Dashboard') },
    { id: 'pos', icon: ShoppingCart, label: t('POS System') },
    { id: 'inventory', icon: Package, label: t('Inventory') },
    {
      id: 'masters', icon: Database, label: 'Masters', isExpandable: true,
      submenu: [
        { id: 'master-products', label: 'Product Master', icon: Box },
        { id: 'master-categories', label: 'Category Master', icon: Grid },
        { id: 'master-subcategories', label: 'Subcategory Master', icon: Grid },
        { id: 'master-vendors', label: 'Vendor Master', icon: Users },
        { id: 'master-customers', label: 'Customer Master', icon: Users }
      ]
    },
    {
      id: 'rental',
      icon: FileText,
      label: 'Rental',
      isExpandable: true,
      submenu: [
        { id: 'rental-quotations', label: 'Quotations', icon: ClipboardList },
        { id: 'delivery-challans', label: 'Delivery Challans', icon: Truck },
        { id: 'invoices', label: 'Invoices', icon: Receipt }
      ]
    },
    { id: 'ledger-list', icon: Users, label: 'Customer Ledger' },
    { id: 'reports', icon: BarChart3, label: 'Reports & Analytics' },
    { id: 'settings', icon: Settings, label: t('Settings') }
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TooltipProvider>
      <div className={`h-full ${isMobile ? '' : 'p-3 pr-0'}`}>
        {isMobile && isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileMenuClose}
          />
        )}

        <aside
          className={`
            soft-panel rounded-3xl
            transition-[width,transform] duration-300 ease-out
            ${isCollapsed ? 'w-[76px]' : 'w-72'}
            ${isMobile ? 'fixed left-3 top-3 bottom-3 z-50 rounded-3xl' : 'relative h-full'}
            ${isMobile && !isMobileMenuOpen ? '-translate-x-[120%]' : 'translate-x-0'}
            flex flex-col overflow-hidden
          `}
        >
          <div className="p-4 flex items-center justify-between">
            <div className={`flex items-center min-w-0 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-primary-foreground">
                <Store className="h-4 w-4" />
              </div>
              <div className="ml-3 min-w-0">
                <h1 className="font-display text-lg leading-none truncate text-foreground">
                  {storeSettings.name}
                </h1>
                <p className="mt-1 text-[11px] tracking-[0.18em] uppercase text-muted-foreground">
                  Workspace
                </p>
              </div>
            </div>

            {!isMobile && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-accent text-muted-foreground"
              >
                {isCollapsed ? <PlusSquare className="h-4 w-4" /> : <MinusSquare className="h-4 w-4" />}
              </button>
            )}
          </div>

          {!isCollapsed && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/70 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={displayUser.avatar} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{displayUser.name}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0 font-normal">
                    {displayUser.role}
                  </Badge>
                </div>
              </div>
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="mt-3 w-full h-10 px-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto no-scrollbar">
            {filteredMenuItems.map(item => {
              const active = isItemActive(item);
              return (
                <div key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          item.isExpandable ? toggleMenu(item.id) : handleTabChange(item.id);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm transition-colors ${
                          active && !item.isExpandable
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!isCollapsed && <span className="font-medium">{item.label}</span>}
                        </div>
                        {item.isExpandable && !isCollapsed && (
                          <ChevronDown className={`h-4 w-4 transition-transform ${expandedMenus[item.id] || active ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>

                  {item.isExpandable && (expandedMenus[item.id] || active) && !isCollapsed && (
                    <div className="mt-1 ml-4 pl-3 border-l border-border space-y-0.5">
                      {item.submenu?.map(subItem => (
                        <button
                          key={subItem.id}
                          onClick={() => handleTabChange(subItem.id)}
                          className={`w-full flex items-center gap-2 py-2 px-2 rounded-xl text-sm ${
                            activeTab === subItem.id
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          {subItem.icon && <subItem.icon className="h-3.5 w-3.5" />}
                          <span>{subItem.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border/70">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start gap-3'} px-3 py-2.5 rounded-2xl text-sm text-destructive hover:bg-destructive/10`}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Logout</span>}
            </button>
            {!isCollapsed && (
              <div className="mt-2 px-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>v1.0.0</span>
                <span className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[hsl(var(--sage))]" />
                  Online
                </span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
};
