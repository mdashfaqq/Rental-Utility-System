
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Grid, List, Plus, Package } from 'lucide-react';

interface ProductViewSwitcherProps {
  products: any[];
  onQuickAdd: (product: any, quantity?: number) => void;
  defaultView?: 'table' | 'grid';
}

export const ProductViewSwitcher = ({ products, onQuickAdd, defaultView = 'table' }: ProductViewSwitcherProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(defaultView);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});

  const handleQuantityChange = (productId: string, value: string) => {
    const quantity = parseFloat(value) || 0;
    setQuantities(prev => ({ ...prev, [productId]: quantity }));
  };

  const handleQuickAdd = (product: any) => {
    const quantity = quantities[product.id] || product.minQuantity || 1;
    onQuickAdd(product, quantity);
    // Reset quantity after adding
    setQuantities(prev => ({ ...prev, [product.id]: product.minQuantity || 1 }));
  };

  const renderTableView = () => (
    <div className="bg-card rounded-2xl border border-black/[0.04] overflow-hidden flex flex-col flex-1">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.barcode}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-champagne text-foreground border-transparent font-medium">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-green-600">
                  ₹{product.price}/{product.unit}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.stock < 10 
                      ? 'bg-red-100 text-red-800' 
                      : product.stock < 30 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.stock} {product.unit}
                  </span>
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={product.minQuantity || 1}
                    step={product.minQuantity || 1}
                    value={quantities[product.id] || product.minQuantity || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="w-20"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleQuickAdd(product)}
                    disabled={product.stock <= 0}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-3">
        {products.map((product) => (
          <div key={product.id} className="bg-muted/60 rounded-2xl p-3 border border-border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{product.barcode}</p>
              </div>
              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0 bg-champagne text-foreground border-transparent font-medium">{product.category}</Badge>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-600 text-sm">₹{product.price}/{product.unit}</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                product.stock < 10 
                  ? 'bg-red-100 text-red-800' 
                  : product.stock < 30 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {product.stock} {product.unit}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                min={product.minQuantity || 1}
                step={product.minQuantity || 1}
                value={quantities[product.id] || product.minQuantity || 1}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                className="flex-1 text-sm"
                placeholder="Qty"
              />
              <Button
                size="sm"
                onClick={() => handleQuickAdd(product)}
                disabled={product.stock <= 0}
                className="flex-shrink-0"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden md:inline ml-1">Add</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {products.map((product) => (
        <Card key={product.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            
            <h3 className="font-semibold text-sm mb-2 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{product.barcode}</p>
            
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-xs bg-champagne text-foreground border-transparent font-medium">{product.category}</Badge>
              <span className="text-green-600 font-bold">₹{product.price}</span>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">
              Stock: {product.stock} {product.unit}
            </p>
            
            <div className="space-y-2">
              <Input
                type="number"
                min={product.minQuantity || 1}
                step={product.minQuantity || 1}
                value={quantities[product.id] || product.minQuantity || 1}
                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                className="text-sm"
                placeholder="Quantity"
              />
              <Button
                size="sm"
                onClick={() => handleQuickAdd(product)}
                disabled={product.stock <= 0}
                className="w-full"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden md:inline ml-1">Add to Cart</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center">
        <div className="flex bg-muted rounded-xl p-1">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Table</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Grid</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'table' ? renderTableView() : renderGridView()}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No products found</p>
        </div>
      )}
    </div>
  );
};
