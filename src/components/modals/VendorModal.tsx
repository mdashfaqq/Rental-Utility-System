
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { Vendor } from '@/contexts/DataContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from '../ui/use-toast';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: Vendor;
}

export const VendorModal: React.FC<VendorModalProps> = ({ isOpen, onClose, vendor }) => {
  const { addVendor, updateVendor } = useData();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name,
        contact: vendor.contact,
        email: vendor.email,
        address: vendor.address
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        email: '',
        address: ''
      });
    }
  }, [vendor]);

const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  let result;

  try {

    if (vendor) {

      result = await updateVendor({
        id: vendor.id,
        ...formData
      });

    } else {

      result = await addVendor(formData);
    }

    // ✅ Duplicate or API error
    if (!result?.success) {

      toast({
        title: "Error",
        description:
          result?.message || "Vendor already exists",
        variant: "destructive",
      });

      return;
    }

    // ✅ Success toast
    toast({
      title: "Success",
      description: vendor
        ? "Vendor updated successfully"
        : "Vendor added successfully",
    });

    // ✅ Close modal only on success
    onClose();

  } catch (error: any) {

    console.error(error);

    toast({
      title: "Error",
      description:
        error?.message || "Something went wrong",
      variant: "destructive",
    });
  }
};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Vendor Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {vendor ? 'Update' : 'Add'} Vendor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
