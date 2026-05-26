// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Switch } from '@/components/ui/switch';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { settingsApi } from '@/services/api';
// import { 
//   Settings as SettingsIcon,
//   Building2,
//   Users,
//   Receipt,
//   Printer,
//   Database,
//   Shield,
//   Bell,
//   Palette,
//   Download
// } from 'lucide-react';
// import { toast } from '@/hooks/use-toast';

// export const Settings = () => {
//   const { t, language, setLanguage } = useLanguage();
//   const [loading, setLoading] = useState(false);
//   const [storeDetails, setStoreDetails] = useState({
//     name: 'Grocery Store',
//     address: '123 Main Street, City, State 12345',
//     phone: '+91 9876543210',
//     email: 'store@example.com',
//     gstNumber: '22AAAAA0000A1Z5',
//     licenseNumber: 'LIC123456789'
//   });

//   const [taxSettings, setTaxSettings] = useState({
//     gstRate: 18,
//     cgstRate: 9,
//     sgstRate: 9,
//     enableTax: true,
//     taxIncluded: false
//   });

//   const [printSettings, setPrintSettings] = useState({
//     defaultPrinter: 'thermal',
//     paperSize: '80mm',
//     autoPrint: true,
//     printLogo: true,
//     printGst: true
//   });

//   const [systemSettings, setSystemSettings] = useState({
//     currency: 'inr',
//     dateFormat: 'dd/mm/yyyy',
//     lowStockAlert: 10,
//     enableNotifications: true
//   });

//   const [securitySettings, setSecuritySettings] = useState({
//     requireLogin: true,
//     autoLogout: true,
//     sessionTimeout: 30,
//     enableAuditLog: true,
//     passwordPolicy: 'medium'
//   });

//   const [users] = useState([
//     { id: '1', name: 'Admin User', email: 'admin@store.com', role: 'admin', status: 'active' },
//     { id: '2', name: 'Cashier 1', email: 'cashier1@store.com', role: 'cashier', status: 'active' },
//     { id: '3', name: 'Manager', email: 'manager@store.com', role: 'manager', status: 'active' }
//   ]);

//   useEffect(() => {
//     loadSettings();
//   }, []);

//   const loadSettings = async () => {
//     setLoading(true);
//     try {
//       const [store, tax, print, system, security] = await Promise.all([
//         settingsApi.getStoreSettings(),
//         settingsApi.getTaxSettings(),
//         settingsApi.getPrintSettings(),
//         settingsApi.getSystemSettings(),
//         settingsApi.getSecuritySettings()
//       ]);

//       if (store.data && Object.keys(store.data).length > 0) {
//         setStoreDetails(prev => ({ ...prev, ...store.data }));
//       }
//       if (tax.data && Object.keys(tax.data).length > 0) {
//         setTaxSettings(prev => ({ ...prev, ...tax.data }));
//       }
//       if (print.data && Object.keys(print.data).length > 0) {
//         setPrintSettings(prev => ({ ...prev, ...print.data }));
//       }
//       if (system.data && Object.keys(system.data).length > 0) {
//         setSystemSettings(prev => ({ ...prev, ...system.data }));
//       }
//       if (security.data && Object.keys(security.data).length > 0) {
//         setSecuritySettings(prev => ({ ...prev, ...security.data }));
//       }
//     } catch (error) {
//       console.error('Error loading settings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveStore = async () => {
//     setLoading(true);
//     try {
//       await settingsApi.updateStoreSettings(storeDetails);
//       toast({
//         title: t('success'),
//         description: 'Store details saved successfully.',
//       });
//     } catch (error) {
//       console.error('Error saving store settings:', error);
//       toast({
//         title: t('error'),
//         description: 'Failed to save store details.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveTax = async () => {
//     setLoading(true);
//     try {
//       await settingsApi.updateTaxSettings(taxSettings);
//       toast({
//         title: t('success'),
//         description: 'Tax settings saved successfully.',
//       });
//     } catch (error) {
//       console.error('Error saving tax settings:', error);
//       toast({
//         title: t('error'),
//         description: 'Failed to save tax settings.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSavePrint = async () => {
//     setLoading(true);
//     try {
//       await settingsApi.updatePrintSettings(printSettings);
//       toast({
//         title: t('success'),
//         description: 'Print settings saved successfully.',
//       });
//     } catch (error) {
//       console.error('Error saving print settings:', error);
//       toast({
//         title: t('error'),
//         description: 'Failed to save print settings.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveSystem = async () => {
//     setLoading(true);
//     try {
//       await settingsApi.updateSystemSettings(systemSettings);
//       toast({
//         title: t('success'),
//         description: 'System settings saved successfully.',
//       });
//     } catch (error) {
//       console.error('Error saving system settings:', error);
//       toast({
//         title: t('error'),
//         description: 'Failed to save system settings.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveSecurity = async () => {
//     setLoading(true);
//     try {
//       await settingsApi.updateSecuritySettings(securitySettings);
//       toast({
//         title: t('success'),
//         description: 'Security settings saved successfully.',
//       });
//     } catch (error) {
//       console.error('Error saving security settings:', error);
//       toast({
//         title: t('error'),
//         description: 'Failed to save security settings.',
//         variant: 'destructive',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-900 flex items-center">
//           <SettingsIcon className="h-8 w-8 mr-3" />
//           {t('settings')}
//         </h1>
//         <div className="flex gap-2">
//           <Select value={language} onValueChange={setLanguage}>
//             <SelectTrigger className="w-40">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="en">English</SelectItem>
//               <SelectItem value="ta">தமிழ்</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>

//       <Tabs defaultValue="store" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-6">
//           <TabsTrigger value="store" className="flex items-center gap-2">
//             <Building2 className="h-4 w-4" />
//             {t('storeDetails')}
//           </TabsTrigger>
//           <TabsTrigger value="users" className="flex items-center gap-2">
//             <Users className="h-4 w-4" />
//             Users
//           </TabsTrigger>
//           <TabsTrigger value="tax" className="flex items-center gap-2">
//             <Receipt className="h-4 w-4" />
//             {t('taxSettings')}
//           </TabsTrigger>
//           <TabsTrigger value="print" className="flex items-center gap-2">
//             <Printer className="h-4 w-4" />
//             {t('printSettings')}
//           </TabsTrigger>
//           <TabsTrigger value="system" className="flex items-center gap-2">
//             <Database className="h-4 w-4" />
//             {t('systemSettings')}
//           </TabsTrigger>
//           <TabsTrigger value="security" className="flex items-center gap-2">
//             <Shield className="h-4 w-4" />
//             {t('securitySettings')}
//           </TabsTrigger>
//         </TabsList>

//         {/* Store Details Tab */}
//         <TabsContent value="store">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Building2 className="h-5 w-5 mr-2" />
//                 {t('storeDetails')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="storeName">Store Name *</Label>
//                     <Input
//                       id="storeName"
//                       value={storeDetails.name}
//                       onChange={(e) => setStoreDetails({...storeDetails, name: e.target.value})}
//                       placeholder="Enter store name"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="phone">Phone Number *</Label>
//                     <Input
//                       id="phone"
//                       value={storeDetails.phone}
//                       onChange={(e) => setStoreDetails({...storeDetails, phone: e.target.value})}
//                       placeholder="Enter phone number"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="email">Email Address</Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={storeDetails.email}
//                       onChange={(e) => setStoreDetails({...storeDetails, email: e.target.value})}
//                       placeholder="Enter email address"
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="address">Store Address *</Label>
//                     <textarea
//                       id="address"
//                       className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
//                       value={storeDetails.address}
//                       onChange={(e) => setStoreDetails({...storeDetails, address: e.target.value})}
//                       placeholder="Enter complete store address"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="gstNumber">GST Number</Label>
//                     <Input
//                       id="gstNumber"
//                       value={storeDetails.gstNumber}
//                       onChange={(e) => setStoreDetails({...storeDetails, gstNumber: e.target.value})}
//                       placeholder="Enter GST number"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="licenseNumber">License Number</Label>
//                     <Input
//                       id="licenseNumber"
//                       value={storeDetails.licenseNumber}
//                       onChange={(e) => setStoreDetails({...storeDetails, licenseNumber: e.target.value})}
//                       placeholder="Enter license number"
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleSaveStore} disabled={loading}>
//                   {loading ? t('loading') : t('save')}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* User Management Tab */}
//         <TabsContent value="users">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 <span className="flex items-center">
//                   <Users className="h-5 w-5 mr-2" />
//                   User Management
//                 </span>
//                 <Button>Add New User</Button>
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Email</TableHead>
//                     <TableHead>Role</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {users.map((user) => (
//                     <TableRow key={user.id}>
//                       <TableCell className="font-medium">{user.name}</TableCell>
//                       <TableCell>{user.email}</TableCell>
//                       <TableCell>
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           user.role === 'admin' ? 'bg-red-100 text-red-800' :
//                           user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
//                           'bg-green-100 text-green-800'
//                         }`}>
//                           {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                         </span>
//                       </TableCell>
//                       <TableCell>
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
//                         </span>
//                       </TableCell>
//                       <TableCell>
//                         <div className="flex gap-2">
//                           <Button variant="outline" size="sm">Edit</Button>
//                           <Button variant="destructive" size="sm">Delete</Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Tax Settings Tab */}
//         <TabsContent value="tax">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Receipt className="h-5 w-5 mr-2" />
//                 {t('taxSettings')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <Label htmlFor="enableTax">Enable Tax Calculation</Label>
//                     <Switch
//                       id="enableTax"
//                       checked={taxSettings.enableTax}
//                       onCheckedChange={(checked) => setTaxSettings({...taxSettings, enableTax: checked})}
//                     />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Label htmlFor="taxIncluded">Tax Included in Price</Label>
//                     <Switch
//                       id="taxIncluded"
//                       checked={taxSettings.taxIncluded}
//                       onCheckedChange={(checked) => setTaxSettings({...taxSettings, taxIncluded: checked})}
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <Label htmlFor="gstRate">GST Rate (%)</Label>
//                     <Input
//                       id="gstRate"
//                       type="number"
//                       value={taxSettings.gstRate}
//                       onChange={(e) => setTaxSettings({...taxSettings, gstRate: Number(e.target.value)})}
//                       disabled={!taxSettings.enableTax}
//                     />
//                   </div>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <Label htmlFor="cgstRate">CGST Rate (%)</Label>
//                       <Input
//                         id="cgstRate"
//                         type="number"
//                         value={taxSettings.cgstRate}
//                         onChange={(e) => setTaxSettings({...taxSettings, cgstRate: Number(e.target.value)})}
//                         disabled={!taxSettings.enableTax}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="sgstRate">SGST Rate (%)</Label>
//                       <Input
//                         id="sgstRate"
//                         type="number"
//                         value={taxSettings.sgstRate}
//                         onChange={(e) => setTaxSettings({...taxSettings, sgstRate: Number(e.target.value)})}
//                         disabled={!taxSettings.enableTax}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleSaveTax} disabled={loading}>
//                   {loading ? t('loading') : t('save')}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Print Settings Tab */}
//         <TabsContent value="print">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Printer className="h-5 w-5 mr-2" />
//                 {t('printSettings')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <Label>Default Printer</Label>
//                     <Select defaultValue="thermal">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="thermal">Thermal Printer</SelectItem>
//                         <SelectItem value="inkjet">Inkjet Printer</SelectItem>
//                         <SelectItem value="laser">Laser Printer</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Paper Size</Label>
//                     <Select defaultValue="80mm">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="58mm">58mm</SelectItem>
//                         <SelectItem value="80mm">80mm</SelectItem>
//                         <SelectItem value="a4">A4</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <Label>Auto Print Receipt</Label>
//                     <Switch defaultChecked />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Label>Print Store Logo</Label>
//                     <Switch defaultChecked />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Label>Print GST Details</Label>
//                     <Switch defaultChecked />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleSavePrint} disabled={loading}>
//                   {loading ? t('loading') : t('save')}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* System Settings Tab */}
//         <TabsContent value="system">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Database className="h-5 w-5 mr-2" />
//                 {t('systemSettings')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <Label>Currency</Label>
//                     <Select defaultValue="inr">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
//                         <SelectItem value="usd">US Dollar ($)</SelectItem>
//                         <SelectItem value="eur">Euro (€)</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <Label>Date Format</Label>
//                     <Select defaultValue="dd/mm/yyyy">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
//                         <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
//                         <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <Label>Low Stock Alert</Label>
//                     <Input type="number" defaultValue="10" placeholder="Minimum quantity" />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Label>Enable Notifications</Label>
//                     <Switch defaultChecked />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleSaveSystem} disabled={loading}>
//                   {loading ? t('loading') : t('save')}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         {/* Security Settings Tab */}
//         <TabsContent value="security">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Shield className="h-5 w-5 mr-2" />
//                 {t('securitySettings')}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <Label>Require Login</Label>
//                     <Switch defaultChecked />
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Label>Auto Logout</Label>
//                     <Switch defaultChecked />
//                   </div>
//                   <div>
//                     <Label>Session Timeout (minutes)</Label>
//                     <Input type="number" defaultValue="30" />
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <Label>Enable Audit Log</Label>
//                     <Switch defaultChecked />
//                   </div>
//                   <div>
//                     <Label>Password Policy</Label>
//                     <Select defaultValue="medium">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="low">Low Security</SelectItem>
//                         <SelectItem value="medium">Medium Security</SelectItem>
//                         <SelectItem value="high">High Security</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex justify-end">
//                 <Button onClick={handleSaveSecurity} disabled={loading}>
//                   {loading ? t('loading') : t('save')}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/contexts/LanguageContext';
import { settingsApi, usersApi } from '@/services/api';
import { UserModal } from '@/components/modals/UserModal';
import { 
  Settings as SettingsIcon,
  Building2,
  Users,
  Receipt,
  Printer,
  Database,
  Shield,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const Settings = () => {
  const { t, language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [rentalSettings, setRentalSettings] = useState({
  lateFee: 50,
});
  const [storeDetails, setStoreDetails] = useState({
    name: 'Grocery Store',
    address: '123 Main Street, City, State 12345',
    phone: '+91 9876543210',
    email: 'store@example.com',
    gstNumber: '22AAAAA0000A1Z5',
    licenseNumber: 'LIC123456789'
  });

  const [taxSettings, setTaxSettings] = useState({
    gstRate: '18',
    cgstRate: '9',
    sgstRate: '9',
    enableTax: 'true',
    taxIncluded: 'false'
  });

  const [printSettings, setPrintSettings] = useState({
    defaultPrinter: 'thermal',
    paperSize: '80mm',
    autoPrint: 'true',
    printLogo: 'true',
    printGst: 'true'
  });

  const [systemSettings, setSystemSettings] = useState({
    currency: 'inr',
    dateFormat: 'dd/mm/yyyy',  
    lowStockAlert: '10',
    enableNotifications: 'true'
  });

  const [securitySettings, setSecuritySettings] = useState({
    requireLogin: 'true',
    autoLogout: 'true',
    sessionTimeout: 30,
    enableAuditLog: 'true',
    passwordPolicy: 'medium',
  });

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [store, tax, print, system, security ,rental] = await Promise.all([
        settingsApi.getStoreSettings(),
        settingsApi.getTaxSettings(),
        settingsApi.getPrintSettings(),
        settingsApi.getSystemSettings(),
        settingsApi.getSecuritySettings(),
        settingsApi.getRentalSettings()
      ]);

      if (store.data && Object.keys(store.data).length > 0) {
        setStoreDetails(prev => ({ ...prev, ...store.data }));
      }
      if (tax.data && Object.keys(tax.data).length > 0) {
        setTaxSettings(prev => ({ ...prev, ...tax.data }));
      }
      if (print.data && Object.keys(print.data).length > 0) {
        setPrintSettings(prev => ({ ...prev, ...print.data }));
      }
      if (system.data && Object.keys(system.data).length > 0) {
        setSystemSettings(prev => ({ ...prev, ...system.data }));
      }
      if (security.data && Object.keys(security.data).length > 0) {
        setSecuritySettings(prev => ({ ...prev, ...security.data }));
      }
      if (rental.data && Object.keys(rental.data).length > 0) {
  setRentalSettings({
    lateFee: Number(rental.data.late_fee_per_day || 50)
  });
}
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersApi.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSaveStore = async () => {
    setLoading(true);
    try {
      await settingsApi.updateStoreSettings(storeDetails);
      toast({
        title: t('success'),
        description: 'Store details saved successfully.',
      });
    } catch (error) {
      console.error('Error saving store settings:', error);
      toast({
        title: t('error'),
        description: 'Failed to save store details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTax = async () => {
    setLoading(true);
    try {
      await settingsApi.updateTaxSettings(taxSettings);
      toast({
        title: t('success'),
        description: 'Tax settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving tax settings:', error);
      toast({
        title: t('error'),
        description: 'Failed to save tax settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  
  const handleSaveRental = async () => {
  setLoading(true);
  try {
    await settingsApi.updateRentalSettings(rentalSettings);

    toast({
      title: t('success'),
      description: 'Rental settings saved successfully.',
    });

  } catch (error) {
    console.error('Error saving rental settings:', error);

    toast({
      title: t('error'),
      description: 'Failed to save rental settings.',
      variant: 'destructive',
    });

  } finally {
    setLoading(false);
  }
};

  const handleSavePrint = async () => {
    setLoading(true);
    try {
      await settingsApi.updatePrintSettings(printSettings);
      toast({
        title: t('success'),
        description: 'Print settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving print settings:', error);
      toast({
        title: t('error'),
        description: 'Failed to save print settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSystem = async () => {
    setLoading(true);
    try {
      await settingsApi.updateSystemSettings(systemSettings);
      toast({
        title: t('success'),
        description: 'System settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast({
        title: t('error'),
        description: 'Failed to save system settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    setLoading(true);
    try {
      await settingsApi.updateSecuritySettings(securitySettings);
      toast({
        title: t('success'),
        description: 'Security settings saved successfully.',
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      toast({
        title: t('error'),
        description: 'Failed to save security settings.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSaveUser = async (userData: any) => {
    try {
      if (userData.id) {
        await usersApi.update(userData);
        toast({
          title: t('success'),
          description: 'User updated successfully.',
        });
      } else {
        await usersApi.create(userData);
        toast({
          title: t('success'),
          description: 'User created successfully.',
        });
      }
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: t('error'),
        description: 'Failed to save user.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(userId);
        toast({
          title: t('success'),
          description: 'User deleted successfully.',
        });
        loadUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: t('error'),
          description: 'Failed to delete user.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3" />
          {t('settings')}
        </h1>
        {/* <div className="flex gap-2">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
            </SelectContent>
          </Select>
        </div> */}
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            {t('storeDetails')}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {t('Billing Settings ')}
          </TabsTrigger>
          <TabsTrigger value="print" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            {t('printSettings')}
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            {t('systemSettings')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('securitySettings')}
          </TabsTrigger>
        </TabsList>

        {/* Store Details Tab */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                {t('storeDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="storeName">Store Name *</Label>
                    <Input
                      id="storeName"
                      value={storeDetails.name}
                      onChange={(e) => setStoreDetails({...storeDetails, name: e.target.value})}
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={storeDetails.phone}
                      onChange={(e) => setStoreDetails({...storeDetails, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={storeDetails.email}
                      onChange={(e) => setStoreDetails({...storeDetails, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Store Address *</Label>
                    <textarea
                      id="address"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={storeDetails.address}
                      onChange={(e) => setStoreDetails({...storeDetails, address: e.target.value})}
                      placeholder="Enter complete store address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={storeDetails.gstNumber}
                      onChange={(e) => setStoreDetails({...storeDetails, gstNumber: e.target.value})}
                      placeholder="Enter GST number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input
                      id="licenseNumber"
                      value={storeDetails.licenseNumber}
                      onChange={(e) => setStoreDetails({...storeDetails, licenseNumber: e.target.value})}
                      placeholder="Enter license number"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveStore} disabled={loading}>
                  {loading ? t('loading') : t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Management
                </span>
                <Button onClick={() => {
                  setSelectedUser(null);
                  setUserModalOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Settings Tab */}
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="h-5 w-5 mr-2" />
                {t('taxSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableTax">Enable Tax Calculation</Label>
                    <Switch
                      id="enableTax"
                      checked={taxSettings.enableTax === 'true'}
                      onCheckedChange={(checked) => setTaxSettings({...taxSettings, enableTax: checked.toString()})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="taxIncluded">Tax Included in Price</Label>
                    <Switch
                      id="taxIncluded"
                      checked={taxSettings.taxIncluded === 'true'}
                      onCheckedChange={(checked) => setTaxSettings({...taxSettings, taxIncluded: checked.toString()})}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="gstRate">GST Rate (%)</Label>
                    <Input
                      id="gstRate"
                      type="number"
                      value={taxSettings.gstRate}
                      onChange={(e) => setTaxSettings({...taxSettings, gstRate: e.target.value})}
                      disabled={taxSettings.enableTax !== 'true'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cgstRate">CGST Rate (%)</Label>
                      <Input
                        id="cgstRate"
                        type="number"
                        value={taxSettings.cgstRate}
                        onChange={(e) => setTaxSettings({...taxSettings, cgstRate: e.target.value})}
                        disabled={taxSettings.enableTax !== 'true'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sgstRate">SGST Rate (%)</Label>
                      <Input
                        id="sgstRate"
                        type="number"
                        value={taxSettings.sgstRate}
                        onChange={(e) => setTaxSettings({...taxSettings, sgstRate: e.target.value})}
                        disabled={taxSettings.enableTax !== 'true'}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTax} disabled={loading}>
                  {loading ? t('loading') : t('save')}
                </Button>
              </div>
              <div className="border-t pt-6 mt-6 space-y-4">

  <h3 className="text-md font-semibold text-gray-700">
    Rental Settings
  </h3>

  <div>
    <Label>Late Fee (per day)</Label>
    <Input
      type="number"
      value={rentalSettings.lateFee}
      onChange={(e) =>
        setRentalSettings({
          ...rentalSettings,
          lateFee: Number(e.target.value)
        })
      }
      placeholder="Enter late fee"
    />
  </div>
<Button onClick={handleSaveRental} disabled={loading}>
  Save Rental Settings
</Button>
</div>
            </CardContent>
          </Card>
        </TabsContent>
        

        {/* Print Settings Tab */}
        <TabsContent value="print">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Printer className="h-5 w-5 mr-2" />
                {t('printSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Default Printer</Label>
                    <Select value={printSettings.defaultPrinter} onValueChange={(value) => setPrintSettings({...printSettings, defaultPrinter: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thermal">Thermal Printer</SelectItem>
                        <SelectItem value="inkjet">Inkjet Printer</SelectItem>
                        <SelectItem value="laser">Laser Printer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Paper Size</Label>
                    <Select value={printSettings.paperSize} onValueChange={(value) => setPrintSettings({...printSettings, paperSize: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="58mm">58mm</SelectItem>
                        <SelectItem value="80mm">80mm</SelectItem>
                        <SelectItem value="a4">A4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto Print Receipt</Label>
                    <Switch 
                      checked={printSettings.autoPrint === 'true'}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, autoPrint: checked.toString()})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Print Store Logo</Label>
                    <Switch 
                      checked={printSettings.printLogo === 'true'}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, printLogo: checked.toString()})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Print GST Details</Label>
                    <Switch 
                      checked={printSettings.printGst === 'true'}
                      onCheckedChange={(checked) => setPrintSettings({...printSettings, printGst: checked.toString()})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSavePrint} disabled={loading}>
                  {loading ? t('loading') : t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                {t('systemSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Currency</Label>
                    <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date Format</Label>
                    <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                        <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Low Stock Alert</Label>
                    <Input 
                      type="number" 
                      value={systemSettings.lowStockAlert} 
                      onChange={(e) => setSystemSettings({...systemSettings, lowStockAlert: e.target.value})}
                      placeholder="Minimum quantity" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Enable Notifications</Label>
                    <Switch 
                      checked={systemSettings.enableNotifications === 'true'}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableNotifications: checked.toString()})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSystem} disabled={loading}>
                  {loading ? t('loading') : t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                {t('securitySettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Require Login</Label>
                    <Switch 
                      checked={securitySettings.requireLogin === 'true'}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireLogin: checked.toString()})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto Logout</Label>
                    <Switch 
                      checked={securitySettings.autoLogout === 'true'}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, autoLogout: checked.toString()})}
                    />
                  </div>
                  <div>
                    <Label>Session Timeout (minutes)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.sessionTimeout}
                     onChange={(e) =>
  setSecuritySettings({
    ...securitySettings,
    sessionTimeout: Number(e.target.value)
  })
}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Enable Audit Log</Label>
                    <Switch 
                      checked={securitySettings.enableAuditLog === 'true'}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, enableAuditLog: checked.toString()})}
                    />
                  </div>
                  <div>
                    <Label>Password Policy</Label>
                    <Select value={securitySettings.passwordPolicy} onValueChange={(value) => setSecuritySettings({...securitySettings, passwordPolicy: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Security</SelectItem>
                        <SelectItem value="medium">Medium Security</SelectItem>
                        <SelectItem value="high">High Security</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSecurity} disabled={loading}>
                  {loading ? t('loading') : t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
      />
    </div>
  );
};

