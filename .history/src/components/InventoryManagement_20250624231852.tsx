import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit, Trash2, Package, ArrowUp, ArrowDown, Grid, List } from 'lucide-react';
import { ProductModal } from '@/components/ProductModal';
import { StockMovementModal } from '@/components/modals/StockMovementModal';

export const InventoryManagement = () => {
  const { t } = useLanguage();
  const { products, categories, vendors } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');

 
    


  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesVendor = filterVendor === 'all' || product.vendor === filterVendor;
    
    return matchesSearch && matchesCategory && matchesVendor;
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  
  const handleStockIn = (product: any) => {
    setSelectedProduct(product);
    setStockType('in');
    setIsStockModalOpen(true);
  };

  const handleDelete = (productId: number) => {
  const confirmed = window.confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;
  alert(`Deleted product with ID: ${productId}`);
  };

  const handleStockOut = (product: any) => {
    setSelectedProduct(product);
    setStockType('out');
    setIsStockModalOpen(true);
  };

  const getStockStatus = (stock: number) => {
    if (stock < 10) return { text: 'Low', color: 'text-red-600 bg-red-100' };
    if (stock < 30) return { text: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'Good', color: 'text-green-600 bg-green-100' };
  };

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProducts.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.barcode}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.vendor}</TableCell>
                {/* <TableCell>₹{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell> */}
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(product)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockIn(product)}
                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStockOut(product)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>  */}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        return (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              
              <h3 className="font-bold text-lg mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-2">{product.category}</p>
              <p className="text-green-600 font-bold text-xl mb-2">₹{product.price}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Stock:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                  {product.stock} - {stockStatus.text}
                </span>
              </div>
              
              <p className="text-xs text-gray-500 mb-4">
                Barcode: {product.barcode}
              </p>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEdit(product)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {t('edit')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStockIn(product)}
                  className="text-green-600 hover:text-green-700"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStockOut(product)}
                  className="text-red-600 hover:text-red-700"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t('inventory')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-2 mr-2" />
            {t('Add Stock')}
          </Button>
          <div className="flex bg-white rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t('searchProduct')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Category" />
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

            <Select value={filterVendor} onValueChange={setFilterVendor}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.name}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
                setFilterVendor('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? renderTableView() : renderGridView()}

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No products found</p>
          </CardContent>
        </Card>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
      />

      <StockMovementModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={selectedProduct}
        movementType={stockType}
      />
    </div>
  );
};
