import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

export const CustomerModal = ({ isOpen, onClose, customer }: any) => {
  const { addCustomer, updateCustomer } = useData();
  const { toast } = useToast();
  const validateGST = (gst) => /^[0-9A-Z]{15}$/.test(gst);
const [form, setForm] = useState({
  name: '',
  phone: '',
  email: '',
  address: '',
  gst_number: '',
  status: 'active',
});

  const [loading, setLoading] = useState(false);

  // ✅ LOAD EDIT DATA
  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        gst_number: customer.gst_number || '',
        status: customer.status || 'active',
      });
    } else {
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        gst_number: '',
        status: 'active',
      });
    }
  }, [customer, isOpen]);

  // ✅ HANDLE INPUT CHANGE
  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ VALIDATION
const validate = () => {
  if (!form.name.trim()) {
    toast({ title: 'Name is required', variant: 'destructive' });
    return false;
  }

  if (!form.phone.trim()) {
    toast({ title: 'Phone is required', variant: 'destructive' });
    return false;
  }

  if (form.phone.length < 10) {
    toast({ title: 'Invalid phone number', variant: 'destructive' });
    return false;
  }

  // EMAIL VALIDATION
  if (
    form.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      form.email.trim()
    )
  ) {
    toast({
      title: 'Invalid email address',
      variant: 'destructive'
    });

    return false;
  }

  return true;
};
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      if (customer) {
        await updateCustomer(customer.id, form);

        toast({
          title: 'Customer Updated',
          description: 'Details updated successfully',
        });
      } else {
        await addCustomer(form);

        toast({
          title: 'Customer Added',
          description: 'New customer created',
        });
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">

        <DialogHeader>
          <DialogTitle>
            {customer ? 'Edit Customer' : 'Add Customer'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">

          {/* NAME */}
          <div>
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          {/* PHONE */}
          <div>
            <Label>Phone *</Label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter phone number"
              type="tel"
            />
          </div>

          {/* EMAIL */}
          <div>
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email"
              type="email"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>
<div className="space-y-1.5">
  <label className="text-sm font-medium text-gray-700">
    GST Number
  </label>

<input
  type="text"
  value={form.gst_number}
  maxLength={15}
  onChange={(e) =>
    setForm({
      ...form,
      gst_number: e.target.value.toUpperCase()
    })
  }
  placeholder="33ABCDE1234F1Z5"
  className="w-full border rounded-lg p-2"
/>
</div>

          {/* STATUS */}
          <div className="flex items-center justify-between">
            <Label>Active Status</Label>
            <Switch
              checked={form.status === 'active'}
              onCheckedChange={(val) => handleChange('status', val ? 'active' : 'inactive')}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading
                ? 'Saving...'
                : customer
                ? 'Update Customer'
                : 'Add Customer'}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};