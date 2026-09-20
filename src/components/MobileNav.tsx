import { useState } from 'react';
import {
  LayoutDashboard, ShoppingCart, Receipt, MoreHorizontal, Package,
  Users, Grid, Box, Settings, BarChart3, ClipboardList, Truck, Database, X
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const dockItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'pos', label: 'POS', icon: ShoppingCart },
  { id: 'invoices', label: 'Bills', icon: Receipt },
  { id: 'more', label: 'More', icon: MoreHorizontal },
];

const moreGroups = [
  {
    title: 'Masters',
    items: [
      { id: 'master-products', label: 'Products', icon: Box },
      { id: 'master-categories', label: 'Categories', icon: Grid },
      { id: 'master-subcategories', label: 'Subcategories', icon: Database },
      { id: 'master-vendors', label: 'Vendors', icon: Users },
      { id: 'master-customers', label: 'Customers', icon: Users },
    ],
  },
  {
    title: 'Rental',
    items: [
      { id: 'rental-quotations', label: 'Quotations', icon: ClipboardList },
      { id: 'delivery-challans', label: 'Challans', icon: Truck },
      { id: 'invoices', label: 'Invoices', icon: Receipt },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { id: 'inventory', label: 'Inventory', icon: Package },
      { id: 'ledger-list', label: 'Customer Ledger', icon: Users },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const MobileNav = ({ activeTab, onTabChange }: MobileNavProps) => {
  const [moreOpen, setMoreOpen] = useState(false);
  const dockActive = ['dashboard', 'pos', 'invoices'].includes(activeTab) ? activeTab : 'more';

  return (
    <>
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-card px-5 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] shadow-soft max-h-[78vh] overflow-y-auto">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Navigate</h2>
              <button onClick={() => setMoreOpen(false)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            {moreGroups.map(group => (
              <div key={group.title} className="mb-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{group.title}</p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setMoreOpen(false);
                      }}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm ${
                        activeTab === item.id ? 'bg-accent border-transparent' : 'bg-muted/50 border-transparent'
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed inset-x-3 bottom-3 z-50">
        <div
          className="soft-panel rounded-full px-2 py-2 flex items-center justify-around"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
        >
          {dockItems.map(item => {
            const isActive = item.id === 'more' ? dockActive === 'more' || moreOpen : dockActive === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'more') {
                    setMoreOpen(open => !open);
                    return;
                  }
                  setMoreOpen(false);
                  onTabChange(item.id);
                }}
                className={`flex flex-col items-center min-w-[64px] rounded-full px-3 py-1.5 transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
