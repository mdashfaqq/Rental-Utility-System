
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
  movementType: 'in' | 'out';
   onSuccess?: () => void | Promise<void>;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  movementType 
}) => {
  const { products, categories, vendors, addStockMovement } = useData();
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    reference_type: movementType === 'in' ? 'purchase' : 'sale',
    notes: '',
    vendor_id: '',
    category_id: ''
  });


  
  useEffect(() => {
    if (product) {
      setFormData(prev => ({
        ...prev,
        product_id: String(product.id),
        vendor_id: vendors.find(v => v.name === product.vendor)?.id || 'none',
        category_id: categories.find(c => c.name === product.category)?.id || 'none'
      }));
    } else {
      setFormData({
        product_id: '',
        quantity: '',
        reference_type: movementType === 'in' ? 'purchase' : 'sale',
        notes: '',
        vendor_id: 'none',
        category_id: 'none'
      });
    }
  }, [product, movementType, vendors, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const stockMovement = {
      ...formData,
      movement_type: movementType,
      quantity: parseFloat(formData.quantity),
      vendor_id: formData.vendor_id === 'none' ? null : formData.vendor_id
    };

    addStockMovement(stockMovement);
    onClose();
  };

  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesCategory = formData.category_id === 'none' || 
        categories.find(c => c.id === formData.category_id)?.name === p.category;
      const matchesVendor = formData.vendor_id === 'none' || 
        vendors.find(v => v.id === formData.vendor_id)?.name === p.vendor;
      return matchesCategory && matchesVendor;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {movementType === 'in' ? 'Stock In' : 'Stock Out'} - 
            {product ? product.name : 'Select Product'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category_id} 
              onValueChange={(value) => setFormData({ ...formData, category_id: value, product_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Select 
              value={formData.vendor_id} 
              onValueChange={(value) => setFormData({ ...formData, vendor_id: value, product_id: '' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="product">Product</Label>
            <Select 
              value={formData.product_id} 
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              disabled={!!product}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredProducts().map((prod) => (
                  <SelectItem key={prod.id} value={String(prod.id)}>
                    {prod.name} - {prod.barcode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.001"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              required
              min="0.001"
            />
          </div>

          <div>
            <Label htmlFor="reference_type">Reference Type</Label>
            <Select 
              value={formData.reference_type} 
              onValueChange={(value) => setFormData({ ...formData, reference_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {movementType === 'in' ? (
                  <>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Enter any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {movementType === 'in' ? 'Add Stock' : 'Remove Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
