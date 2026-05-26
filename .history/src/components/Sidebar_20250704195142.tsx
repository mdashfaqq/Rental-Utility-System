import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Grid, 
  Box, 
  Settings,
  Menu,
  Globe,
  BarChart3,
  Database,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  BoxIcon
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAuth } from '@/components';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
  const { t, toggleLanguage, language } = useLanguage();
   const { storeSettings } = useAppSettings();
  //  const { logout, user } = useAuth();
   const location = useLocation();
   const navigate = useNavigate();
//   const { t, toggleLanguage, language } = useLanguage();
//   const { storeSettings } = useAppSettings();

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

    const handleLogout = () => {
    try {
      // Clear any stored authentication data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      sessionStorage.clear();
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page or refresh the app
         
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout');
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'pos', icon: ShoppingCart, label: t('pos') },
    { id: 'inventory', icon: Package, label: t('inventory') },
    {
      id: 'masters',
      icon: Database,
      label: 'Masters',
      isExpandable: true,
      submenu: [
        { id: 'master-products', label: 'Product Master',icon: BoxIcon },
        { id: 'master-categories', label: 'Category Master' },
        { id: 'master-vendors', label: 'Vendor Master' },
        { id: 'master-subcategories', label: 'Sub-Category Master' }
      ]
    },
    // { id: 'vendors', icon: Users, label: t('vendors') },
    // { id: 'categories', icon: Grid, label: t('categories') },
    // { id: 'products', icon: Box, label: t('products') },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-blue-800 truncate">{storeSettings.name}</h1>
           )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}  
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <nav className="p-2 space-y-1">
        {menuItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.isExpandable) {
                  toggleMenu(item.id);
                } else {
                  onTabChange(item.id);
                }
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-800 border-l-4 border-blue-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </div>
              {item.isExpandable && !isCollapsed && (
                expandedMenus[item.id] ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            
            {item.isExpandable && expandedMenus[item.id] && (
              <div className={`mt-1 space-y-1 ${isCollapsed ? 'ml-2' : 'ml-8'}`}>
                 {item.submenu?.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => onTabChange(subItem.id)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      activeTab === subItem.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {subItem.label}
                  </button>
                ))}

                
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4">
         <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-red-600"
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span>Logout</span>}
            </button>
      </div>
          </div>
        ))}
      </nav>

      {/* <div className="absolute bottom-4 left-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="w-full"
        >
          <Globe className="h-4 w-4 mr-2" />
          {!isCollapsed && (language === 'en' ? 'தமிழ்' : 'English')}
        </Button>
      </div> */}
    </div>
  );
};

// import React from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { 
//   LayoutDashboard, 
//   ShoppingCart, 
//   Package, 
//   Users, 
//   FileText, 
//   Settings as SettingsIcon,
//   Languages,
//   LogOut
// } from 'lucide-react';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useAppSettings } from '@/hooks/useAppSettings';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';

// export const Sidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { t, toggleLanguage, language } = useLanguage();
//   const { storeSettings } = useAppSettings();

//   const handleLogout = () => {
//     try {
//       // Clear any stored authentication data
//       localStorage.removeItem('auth_token');
//       localStorage.removeItem('user_data');
//       sessionStorage.clear();
      
//       // Show success message
//       toast.success('Logged out successfully');
      
//       // Redirect to login page or refresh the app
         
//       // Redirect to login page
//       navigate('/login');
//     } catch (error) {
//       console.error('Error during logout:', error);
//       toast.error('Error during logout');
//     }
//   };

//   const menuItems = [
//     { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
//     { icon: ShoppingCart, label: t('pos'), path: '/pos' },
//     { icon: Package, label: t('inventory'), path: '/inventory' },
//     { icon: Users, label: t('vendors'), path: '/vendors' },
//     { icon: FileText, label: t('reports'), path: '/reports' },
//     { icon: SettingsIcon, label: t('settings'), path: '/settings' },
//   ];

//   return (
//     <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
//       <div className="p-6 border-b">
//         <h1 className="text-xl font-bold text-gray-800">{storeSettings.name}</h1>
//         <p className="text-sm text-gray-500">Point of Sale System</p>
//       </div>
      
//       <nav className="flex-1 p-4">
//         <ul className="space-y-2">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             const isActive = location.pathname === item.path;
            
//             return (
//               <li key={item.path}>
//                 <Link
//                   to={item.path}
//                   className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
//                     isActive
//                       ? 'bg-blue-100 text-blue-700'
//                       : 'text-gray-600 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   <span>{item.label}</span>
//                 </Link>
//               </li>
//             );
//           })}
          
//           {/* Logout Button */}
//           <li>
//             <button
//               onClick={handleLogout}
//               className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
//             >
//               <LogOut className="h-5 w-5" />
//               <span>Logout</span>
//             </button>
//           </li>
//         </ul>
//       </nav>
      
//       {/* <div className="p-4 border-t">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={toggleLanguage}
//           className="w-full flex items-center justify-center gap-2"
//         >
//           <Languages className="h-4 w-4" />
//           {language === 'en' ? 'தமிழ்' : 'English'}
//         </Button>
//       </div> */}
//     </div>
//   );
// };

