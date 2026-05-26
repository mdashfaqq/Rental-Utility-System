
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
} from '@mui/material';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  ShoppingCart,
  Users,
  Grid
} from 'lucide-react';

export const Dashboard = () => {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">{t('Welcome to Grocery POS')}</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString()}
        </div>
      </div>

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
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('Recent Transactions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(-5).reverse().map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              {t('Low Stock')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
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
      */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: '1fr 1fr' }} gap={3}>
      {/* Recent Transactions */}
      <Card sx={{ height: 360, display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={<Typography variant="h6">{t('Recent Transactions')}</Typography>}
        />
        <CardContent sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {transactions.length > 0 ? (
            [...transactions].slice(-5).reverse().map((transaction) => (
              <Box
                key={transaction.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#f9fafb"
                borderRadius={2}
                p={2}
                mb={1}
              >
                <Box>
                  <Typography fontWeight={600}>
                    Transaction #{transaction.id.substring(0, 8)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.items.length} items • {transaction.paymentMethod}
                  </Typography>
                </Box>
                <Typography fontWeight={700} color="success.main">
                  ₹{transaction.total}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography align="center" color="text.secondary" py={2}>
              No transactions yet
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Low Stock */}
      <Card sx={{ height: 360, display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center">
              <AlertTriangle style={{ color: '#f44336', marginRight: 8 }} />
              <Typography variant="h6">{t('Low Stock')}</Typography>
            </Box>
          }
        />
        <CardContent sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {lowStockProducts.length > 0 ? (
            lowStockProducts.map((product) => (
              <Box
                key={product.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                bgcolor="#fee2e2"
                borderRadius={2}
                p={2}
                mb={1}
              >
                <Box>
                  <Typography fontWeight={600}>{product.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {product.category}
                  </Typography>
                </Box>
                <Typography fontWeight={700} color="error.main">
                  {product.stock} left
                </Typography>
              </Box>
            ))
          ) : (
            <Typography align="center" color="text.secondary" py={2}>
              All products are well stocked
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
    </div> 
  );
};
