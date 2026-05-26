import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { Product } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product }) => {
  const { categories, vendors, addProduct, updateProduct } = useData();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: '',
    vendor: '',
    price: '',
    unitPrice: '',
    stock: '',
    unit: 'piece' as 'kg' | 'gram' | 'litre' | 'ml' | 'piece' | 'packet' | 'dozen',
    smallUnit: '',
    conversionFactor: '',
    minQuantity: '',
    description: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        barcode: product.barcode,
        category: product.category,
        vendor: product.vendor,
        price: product.price.toString(),
        // Fix: Use unitPrice from product if it exists, otherwise use price
        unitPrice: (product.unitPrice || product.unit_price || product.price).toString(),
        stock: product.stock.toString(),
        unit: product.unit,
        smallUnit: product.smallUnit || '',
        conversionFactor: product.conversionFactor?.toString() || '',
        minQuantity: product.minQuantity.toString(),
        description: product.description || ''
      });
    } else {
      setFormData({
        name: '',
        barcode: '',
        category: '',
        vendor: '',
        price: '',
        unitPrice: '',
        stock: '',
        unit: 'piece',
        smallUnit: '',
        conversionFactor: '',
        minQuantity: '1',
        description: ''
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fix: Correctly map the form fields to database fields
    const productData = {
      name: formData.name,
      barcode: formData.barcode,
      category: formData.category,
      vendor: formData.vendor,
      unit_price: parseFloat(formData.unitPrice), // Unit price (cost price)
      selling_price: parseFloat(formData.price),  // Selling price
      stock: parseInt(formData.stock),
      unit: formData.unit,
      smallUnit: formData.smallUnit || undefined,
      conversionFactor: formData.conversionFactor ? parseFloat(formData.conversionFactor) : undefined,
      minQuantity: parseFloat(formData.minQuantity),
      description: formData.description || undefined
    };

    console.log("Sending product data:", productData);
    
    if (product) {
      updateProduct(product.id, productData);
      toast({
        title: 'Product Updated Successfully',
        variant: 'default',
        duration: 3000,
        className: 'bg-white text-black border border-black shadow-md',
      });
    } else {
      addProduct(productData);
      toast({
        title: 'Product added successfully',
        variant: 'success',
        duration: 3000,
        className: 'bg-white text-black border border-black shadow-md',
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vendor">Vendor</Label>
            <Select value={formData.vendor} onValueChange={(value) => setFormData({ ...formData, vendor: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.name}>{vendor.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Select value={formData.unit} onValueChange={(value: any) => setFormData({ ...formData, unit: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="piece">Piece</SelectItem>
                <SelectItem value="kg">Kilogram</SelectItem>
                <SelectItem value="gram">Gram</SelectItem>
                <SelectItem value="litre">Litre</SelectItem>
                <SelectItem value="ml">Millilitre</SelectItem>
                <SelectItem value="packet">Packet</SelectItem>
                <SelectItem value="dozen">Dozen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unitPrice">Unit Price (₹)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                required
                placeholder="Cost price"
              />
            </div>
            <div>
              <Label htmlFor="price">Selling Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="Selling price"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                step="0.01"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="smallUnit">Small Unit (Optional)</Label>
            <Input
              id="smallUnit"
              value={formData.smallUnit}
              onChange={(e) => setFormData({ ...formData, smallUnit: e.target.value })}
              placeholder="e.g., gram, ml"
            />
          </div>

          <div>
            <Label htmlFor="conversionFactor">Conversion Factor (Optional)</Label>
            <Input
              id="conversionFactor"
              type="number"
              step="0.01"
              value={formData.conversionFactor}
              onChange={(e) => setFormData({ ...formData, conversionFactor: e.target.value })}
              placeholder="e.g., 1000 (grams per kg)"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {product ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};