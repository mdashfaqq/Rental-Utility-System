
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useUser } from '@/contexts/UserContext';
// import { useData } from '@/contexts/DataContext';
// import {
//   DollarSign,
//   Package,
//   TrendingUp,
//   AlertTriangle,
//   ShoppingCart,
//   Users,
//   User as UserIcon,
//   Grid
// } from 'lucide-react';

// export const Dashboard = () => {
//   const { user } = useUser();
//   const { t } = useLanguage();
//   const { products, transactions, vendors, categories } = useData();

//   const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
//   const todaysSales = transactions
//     .filter(transaction => {
//       const today = new Date();
//       const transactionDate = new Date(transaction.timestamp);
//       return transactionDate.toDateString() === today.toDateString();
//     })
//     .reduce((sum, transaction) => sum + transaction.total, 0);

//   const lowStockProducts = products.filter(product => product.stock < 20);

//   const statsCards = [
//     {
//       title: t('Total Sales'),
//       value: `₹${totalSales.toLocaleString()}`,
//       icon: DollarSign,
//       color: 'text-green-600',
//       bgColor: 'bg-green-100'
//     },
//     {
//       title: t('Todays Sales'),
//       value: `₹${todaysSales.toLocaleString()}`,
//       icon: TrendingUp,
//       color: 'text-blue-600',
//       bgColor: 'bg-blue-100'
//     },
//     {
//       title: t('Total Products'),
//       value: products.length.toString(),
//       icon: Package,
//       color: 'text-purple-600',
//       bgColor: 'bg-purple-100'
//     },
//     {
//       title: t('Low Stock'),
//       value: lowStockProducts.length.toString(),
//       icon: AlertTriangle,
//       color: 'text-red-600',
//       bgColor: 'bg-red-100'
//     }
//   ];

//   return (
//     <div className="flex items-center justify-between">
//       <h1 className="text-3xl font-bold text-gray-800">{t('Welcome to Grocery POS')}</h1>
//       {user && (
//         <div className="flex items-center mt-2 text-lg text-gray-600">
//           <UserIcon className="h-5 w-5 mr-2" />
//           <span>Hello, <span className="font-semibold text-gray-800">{user.name}</span></span>
//         </div>
//       )}
//       <div className="text-sm text-gray-500">
//         {new Date().toLocaleDateString()}
//       </div>
//     </div>
//   )

//    {/* Stats Cards */ }
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//     {statsCards.map((stat, index) => (
//       <Card key={index} className="hover:shadow-lg transition-shadow">
//         <CardContent className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//               <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
//             </div>
//             <div className={`p-3 rounded-full ${stat.bgColor}`}>
//               <stat.icon className={`h-6 w-6 ${stat.color}`} />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     ))}
//   </div>

//   {/* Quick Actions */ }
//   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//     <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//       <CardHeader className="text-center">
//         <ShoppingCart className="h-12 w-12 mx-auto text-blue-600 mb-4" />
//         <CardTitle className="text-blue-600">{t('pos')}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600 text-center">Start a new transaction</p>
//       </CardContent>
//     </Card>

//     <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//       <CardHeader className="text-center">
//         <Package className="h-12 w-12 mx-auto text-green-600 mb-4" />
//         <CardTitle className="text-green-600">{t('inventory')}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600 text-center">Manage your products</p>
//       </CardContent>
//     </Card>

//     <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//       <CardHeader className="text-center">
//         <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
//         <CardTitle className="text-purple-600">{t('vendors')}</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <p className="text-gray-600 text-center">Manage suppliers</p>
//       </CardContent>
//     </Card>
//   </div>

//   {/* Recent Transactions and Low Stock */ }
//   {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <Card>
//           <CardHeader>
//             <CardTitle>{t('Recent Transactions')}</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {transactions.slice(-5).reverse().map((transaction) => (
//                 <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
//                   <div>
//                     <p className="font-medium">Transaction #{transaction.id.substring(0, 8)}</p>
//                     <p className="text-sm text-gray-600">
//                       {transaction.items.length} items • {transaction.paymentMethod}
//                     </p>
//                   </div>
//                   <p className="font-bold text-green-600">₹{transaction.total}</p>
//                 </div>
//               ))}
//               {transactions.length === 0 && (
//                 <p className="text-gray-500 text-center py-4">No transactions yet</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center">
//               <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
//               {t('Low Stock')}
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               {lowStockProducts.map((product) => (
//                 <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
//                   <div>
//                     <p className="font-medium">{product.name}</p>
//                     <p className="text-sm text-gray-600">{product.category}</p>
//                   </div>
//                   <p className="font-bold text-red-600">{product.stock} left</p>
//                 </div>
//               ))}
//               {lowStockProducts.length === 0 && (
//                 <p className="text-gray-500 text-center py-4">All products are well stocked</p>
//               )}
//             </div>
//           </CardContent>
//         </Card>
//       </div>*/}

//   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//     {/* Card 1: Recent Transactions */}
//     <Card className="h-[400px] flex flex-col w-full">
//       <CardHeader>
//         <CardTitle>{t('Recent Transactions')}</CardTitle>
//       </CardHeader>
//       <CardContent className="flex-1 overflow-y-auto pr-2">
//         <div className="space-y-4">
//           {transactions.slice(-5).reverse().map((transaction) => (
//             <div
//               key={transaction.id}
//               className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
//             >
//               <div>
//                 <p className="font-medium">Transaction #{transaction.id.substring(0, 8)}</p>
//                 <p className="text-sm text-gray-600">
//                   {transaction.items.length} items • {transaction.paymentMethod}
//                 </p>
//               </div>
//               <p className="font-bold text-green-600">₹{transaction.total}</p>
//             </div>
//           ))}
//           {transactions.length === 0 && (
//             <p className="text-gray-500 text-center py-4">No transactions yet</p>
//           )}
//         </div>
//       </CardContent>
//     </Card>

//     {/* Card 2: Low Stock */}
//     <Card className="h-[400px] flex flex-col w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center">
//           <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
//           {t('Low Stock')}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="flex-1 overflow-y-auto pr-2">
//         <div className="space-y-4">
//           {lowStockProducts.map((product) => (
//             <div
//               key={product.id}
//               className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
//             >
//               <div>
//                 <p className="font-medium">{product.name}</p>
//                 <p className="text-sm text-gray-600">{product.category}</p>
//               </div>
//               <p className="font-bold text-red-600">{product.stock} left</p>
//             </div>
//           ))}
//           {lowStockProducts.length === 0 && (
//             <p className="text-gray-500 text-center py-4">All products are well stocked</p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   </div>
//   )
// };

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useData } from '@/contexts/DataContext';
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Users,
  User as UserIcon,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const { products, transactions, vendors, categories } = useData();

  const totalSales = transactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const todaysSales = transactions
    .filter(transaction => {
      const today = new Date();
      const transactionDate = new Date(transaction.timestamp);
      return transactionDate.toDateString() === today.toDateString();
    })
    .reduce((sum, transaction) => sum + transaction.total, 0);

  const lowStockProducts = products.filter(product => product.stock < 20);

  const statsCards = [
    {
      title: t('Total Sales'),
      value: `₹${totalSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: t('Todays Sales'),
      value: `₹${todaysSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: t('Total Products'),
      value: products.length.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: t('Low Stock'),
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8"> {/* Added responsive padding to the main container */}
      {/* Header */}
      {/* Added py-4 for vertical padding and items-center for vertical alignment */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-3xl font-bold text-gray-800">{t('Welcome to Grocery POS')}</h1>
        {user && (
          <div className="flex items-center mt-2 text-lg text-gray-600">
            <UserIcon className="h-5 w-5 mr-2" />
            <span>Hello, <span className="font-semibold text-gray-800">{user.name}</span></span>
          </div>
        )}
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    
    // <div className="space-y-8">
    //   {/* Header */}
    //   <div className="flex items-center justify-between">
    //     <h1 className="text-3xl font-bold text-gray-800">{t('Welcome to Grocery POS')}</h1>
    //     {user && (
    //       <div className="flex items-center mt-2 text-lg text-gray-600">
    //         <UserIcon className="h-5 w-5 mr-2" />
    //         <span>Hello, <span className="font-semibold text-gray-800">{user.name}</span></span>
    //       </div>
    //     )}
    //     <div className="text-sm text-gray-500">
    //       {new Date().toLocaleDateString()}
    //     </div>
    //   </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <ShoppingCart className="h-12 w-12 mx-auto text-blue-600 mb-4" />
            <CardTitle className="text-blue-600">{t('pos')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">Start a new transaction</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Package className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <CardTitle className="text-green-600">{t('inventory')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">Manage your products</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
            <CardTitle className="text-purple-600">{t('vendors')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center">Manage suppliers</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="h-[400px] flex flex-col w-full">
          <CardHeader>
            <CardTitle>{t('Recent Transactions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {transactions.slice(-5).reverse().map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Transaction #{transaction.id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {transaction.items.length} items • {transaction.paymentMethod}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">₹{transaction.total}</p>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Products */}
        <Card className="h-[400px] flex flex-col w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              {t('Low Stock')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                  <p className="font-bold text-red-600">{product.stock} left</p>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-gray-500 text-center py-4">All products are well stocked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
