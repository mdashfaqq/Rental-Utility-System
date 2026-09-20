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
import { API_BASE_URL } from '@/services/api';
import { useState, useEffect } from 'react';
import { settingsApi } from '@/services/api';
import { toast } from './ui/sonner';
import { useToast } from './ui/use-toast';
export const InventoryManagement = ({
  inventoryFilter = ""
}: {
  inventoryFilter?: string;
}) => {
  const { t } = useLanguage();
const {
  products,
  categories,
  vendors,
  fetchData ,
} = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');
const { toast } = useToast();
const [lowStockLimit, setLowStockLimit] = useState(10);
const [mediumStockLimit, setMediumStockLimit] = useState(30);


useEffect(() => {
  const fetchStockSettings = async () => {
    try {
      const res = await settingsApi.getSystemSettings();

      console.log("SYSTEM SETTINGS:", res.data);

      setLowStockLimit(Number(res.data?.lowStockAlert || 10));
      setMediumStockLimit(Number(res.data?.mediumStockAlert || 30));

    } catch (err) {
      console.error("Stock settings error", err);
    }
  };

  fetchStockSettings();
}, []);

const filteredProducts = products.filter(product => {

  const matchesSearch =
    product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    ||

    product.barcode
      .includes(searchTerm)

    ||

    product.category
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesCategory =
    filterCategory === 'all'
      || product.category === filterCategory;

  const matchesVendor =
    filterVendor === 'all'
      || product.vendor === filterVendor;

  const matchesInventory =

    inventoryFilter === ""

      ? true

      : inventoryFilter === "out-of-stock"

      ? Number(product.stock) === 0

      : inventoryFilter === "low-stock"

      ? Number(product.stock) > 0
        && Number(product.stock) <= 5

      : true;

  return (
    matchesSearch &&
    matchesCategory &&
    matchesVendor &&
    matchesInventory
  );

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

const handleDelete = async (productId: number) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) return;

  try {

    const res = await fetch(
      `${API_BASE_URL}/products.php?id=${productId}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();

    if (!data.success) {
      throw new Error(
        data.message || "Failed to delete product"
      );
    }

    toast({
      title: "Product Deleted",
      description: `Product ID ${productId} deleted successfully`
    });

    fetchData ();

  } catch (err: any) {

    toast({
      title: "Error",
      description:
        err.message || "Failed to delete product",
      variant: "destructive"
    });

    console.error(err);
  }
};

  const handleStockOut = (product: any) => {
    setSelectedProduct(product);
    setStockType('out');
    setIsStockModalOpen(true);
  };

const getStockStatus = (stock: number) => {
  if (stock <= lowStockLimit) {
    return { text: 'Low', color: 'text-red-600 bg-red-100' };
  }

  if (stock <= mediumStockLimit) {
    return { text: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
  }

  return { text: 'Good', color: 'text-green-600 bg-green-100' };
};

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Rental Price</TableHead>
              <TableHead>Unit Price</TableHead>
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
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>₹{product.unitPrice}</TableCell>
                  <TableCell>{product.stock}</TableCell>
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

                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(Number(product.id))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button> 
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-3">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock);
          return (
            <div key={product.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.barcode}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${stockStatus.color}`}>
                  {stockStatus.text}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div><span className="text-gray-500">Category:</span> {product.category}</div>
                <div><span className="text-gray-500">Vendor:</span> {product.vendor}</div>
                <div><span className="text-gray-500">Rental:</span> ₹{product.price}</div>
                <div><span className="text-gray-500">Unit:</span> ₹{product.unitPrice}</div>
                <div className="col-span-2"><span className="text-gray-500">Stock:</span> {product.stock}</div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3" />
                  <span className="hidden md:inline ml-1">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockIn(product)}
                  className="flex-1 text-green-600 hover:text-green-700"
                >
                  <ArrowUp className="h-3 w-3" />
                  <span className="hidden md:inline ml-1">In</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStockOut(product)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <ArrowDown className="h-3 w-3" />
                  <span className="hidden md:inline ml-1">Out</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(Number(product.id))}
                >
                  <Trash2 className="h-3 w-3" />
                </Button> 
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {filteredProducts.map((product) => {
        const stockStatus = getStockStatus(product.stock);
        return (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div> */}

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
                  <Edit className="h-3 w-3" />
                  <span className="hidden md:inline ml-1">{t('edit')}</span>
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
    <div className="p-6 bg-transparent min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-display text-3xl font-normal text-foreground">{t('inventory')}</h1>
        <div className="flex gap-2">
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-2" />
            <span className="hidden md:inline ml-2">{t('Add Stock')}</span>
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
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
        onSuccess={async () => {
    await fetchData(); // refresh inventory instantly
    setIsStockModalOpen(false);
  }}

      />
    </div>
  );
};
