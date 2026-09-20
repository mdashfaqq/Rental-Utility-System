import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  User, Phone, Mail, MapPin, Calendar, Hash, Star, ChevronDown,
  ChevronUp, X, UserCircle2, Home, KeyRound,
} from 'lucide-react';
import { API_BASE_URL } from '@/services/api';

const genderOptions = ['Male', 'Female', 'Other'];
const contactOptions = ['Phone', 'Email', 'WhatsApp'];

const AddCustomerModal = ({
  show,
  onClose,
  customerPhone,
  newCustomerData,
  setNewCustomerData,
  setCustomerName,
    fetchCustomers,
      editingCustomer,
}) => {
  const [showMore, setShowMore] = useState(false);

  if (!show) return null;

  
  const handleSubmit = async () => {
    const name = (newCustomerData.name || '').trim();
    const phone = (customerPhone || '').trim();
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
    if (!name || !phone) {
      toast({
        title: 'Required Fields Missing',
        description: 'Name and Phone are required',
        variant: 'destructive',
      });
      return;
    }

const email = String(newCustomerData.email || "").trim();

if (email !== "" && !isValidEmail(email)) {
  toast({
    title: "Invalid Email",
    description: "Please enter a valid email address",
    variant: "destructive",
  });

  return;
}
    const payload = {
      name,
      phone,
      email: (newCustomerData.email || '').trim(),
      address: (newCustomerData.address || '').trim(),
      gender: newCustomerData.gender || '',
      dob: newCustomerData.dob || '',
      city: newCustomerData.city || '',
      state: newCustomerData.state || '',
      pincode: newCustomerData.pincode || '',
      customer_code: newCustomerData.customer_code || '',
      loyalty_points: Number(newCustomerData.loyalty_points || 0),
      preferred_contact: newCustomerData.preferred_contact || 'Phone',
      whatsapp_optin: newCustomerData.whatsapp_optin ? 1 : 0,
      gst_number: newCustomerData.gst_number || '',
      status: newCustomerData.status || "active",
    };

    try {
const url = editingCustomer
  ? `${API_BASE_URL}/customers.php?id=${editingCustomer.id}`
  : `${API_BASE_URL}/customers.php`;

const method = editingCustomer ? 'PUT' : 'POST';

const res = await fetch(url, {
  method,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

      let text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Invalid JSON from server');
      }

if (data.success) {

  await fetchCustomers?.();

  toast({
    title: editingCustomer
      ? 'Customer Updated'
      : 'Customer Added',

    description: editingCustomer
      ? 'Customer updated successfully'
      : 'Customer has been saved successfully',
  });

  setCustomerName(name);

  setNewCustomerData({
    name: '',
    phone: '',
    email: '',
    address: '',
    gender: '',
    dob: '',
    city: '',
    state: '',
    pincode: '',
    customer_code: '',
    loyalty_points: 0,
    preferred_contact: 'Phone',
    whatsapp_optin: 0,
    gst_number: '',
    status: 'active',
  });

  onClose();

} else {

  toast({
    title: 'Error',
    description: data.message || 'Failed to save customer',
    variant: 'destructive'
  });

}
} catch (err) {

  console.error(err);

  toast({
    title: 'Error',
    description: String(err),
    variant: 'destructive'
  });
}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto">
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-2xl border border-yellow-900 my-12">
        {/* Accent Header */}
        <div className="flex items-center justify-between bg-yellow-800 rounded-t-lg px-6 py-4">
          <div className="flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-yellow-200" />
            <h2 className="text-lg font-bold">
  {editingCustomer ? "Edit Customer" : "Add New Customer"}
</h2>
          </div>
          <button
            className="rounded-full p-1 transition hover:bg-yellow-100"
            onClick={onClose}
            title="Close"
            type="button"
          >
            <X className="h-5 w-5 text-yellow-800" />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                  <User className="h-4 w-4 opacity-70" /> Name <span className="text-red-600">*</span>
                </label>
                <Input
                  required
                  className="border-yellow-400 focus:border-yellow-700"
                  value={newCustomerData.name || ''}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                  <Phone className="h-4 w-4 opacity-70" /> Phone <span className="text-red-600">*</span>
                </label>
<Input
  className="border-yellow-400"
  value={newCustomerData.phone || ''}
  onChange={(e) =>
    setNewCustomerData({
      ...newCustomerData,
      phone: e.target.value.replace(/\D/g, ''),
    })
  }
  maxLength={10}
/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                  <Mail className="h-4 w-4 opacity-70" /> Email
                </label>
                <Input
                  className="border-yellow-200"
                  type="email"
                  value={newCustomerData.email || ''}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, email: e.target.value })}
                />
              </div>
                              <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                    <KeyRound className="h-4 w-4 opacity-70" /> Customer Code
                  </label>
                  <Input
                    className="border-yellow-100"
                    value={newCustomerData.customer_code || ''}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, customer_code: e.target.value })}
                  />
                </div>
              {/* <div>
                <label className="block text-sm font-medium mb-1 text-yellow-900">Gender</label>
                <select
                  value={newCustomerData.gender || ''}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, gender: e.target.value })}
                  className="border border-yellow-300 w-full p-2 rounded h-10 bg-white focus:ring-yellow-700"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div> */}


                              <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900">GST Number</label>
                  <Input
                    className="border-yellow-100"
                    value={newCustomerData.gst_number || ''}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, gst_number: e.target.value })}
                  />
                </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                  <Home className="h-4 w-4 opacity-70" /> Address
                </label>
                <textarea
                  value={newCustomerData.address || ''}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, address: e.target.value })}
                  className="border border-yellow-200 focus:border-yellow-700 rounded p-2 w-full min-h-[60px]"
                />
              </div>
<div className="md:col-span-2">
  <label className="block text-sm font-medium mb-2 text-yellow-900">
    Customer Status
  </label>

  <div className="grid grid-cols-2 gap-2 sm:gap-3">

    <button
      type="button"
      onClick={() =>
        setNewCustomerData({
          ...newCustomerData,
          status: "active",
        })
      }
      className={`rounded-xl border p-3 transition-all text-left ${
        (newCustomerData.status || "active") === "active"
          ? "border-green-600 bg-green-50 shadow-md"
          : "border-gray-200 hover:border-green-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full bg-green-600 ring-2 ring-green-100 flex-shrink-0"></div>

        <span className="font-medium text-green-700">
          Active
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Customer can make purchases
      </p>
    </button>

    <button
      type="button"
      onClick={() =>
        setNewCustomerData({
          ...newCustomerData,
          status: "inactive",
        })
      }
      className={`rounded-xl border p-3 transition-all text-left ${
        newCustomerData.status === "inactive"
          ? "border-red-600 bg-red-50 shadow-md"
          : "border-gray-200 hover:border-red-400"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-full bg-red-500 ring-2 ring-red-100 flex-shrink-0"></div>

        <span className="font-medium text-yellow-700">
          Inactive
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Temporarily unavailable
      </p>
    </button>

  </div>
  
</div>


            </div>


            {/* Collapse more fields nicely */}
            <div className="flex items-center justify-between my-4 mt-8 gap-2">
              <span className="font-medium text-yellow-700">Additional Information</span>
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowMore(v => !v)}
                className="inline-flex items-center gap-2 text-yellow-800 border-yellow-400 hover:border-yellow-900 transition mt-6"
              >
                {showMore ? (
                  <>
                    <ChevronUp className="w-4 h-4" /> Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mt-8" /> More fields
                  </>
                )}
              </Button>
            </div>
            {showMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pb-2 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900">City</label>
                  <Input
                    className="border-yellow-100"
                    value={newCustomerData.city || ''}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900">State</label>
                  <Input
                    className="border-yellow-100"
                    value={newCustomerData.state || ''}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, state: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900">Pincode</label>
                  <Input
                    className="border-yellow-100"
                    value={newCustomerData.pincode || ''}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, pincode: e.target.value })}
                  />
                </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                  <Calendar className="h-4 w-4 opacity-70" /> Date of Birth
                </label>
                <Input
                  type="date"
                  className="border-yellow-200"
                  value={newCustomerData.dob || ''}
                  onChange={(e) => setNewCustomerData({ ...newCustomerData, dob: e.target.value })}
                />
              </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900 flex items-center gap-1">
                    <Star className="h-4 w-4 opacity-70" /> Loyalty Points
                  </label>
                  <Input
                    type="number"
                    min={0}
                    className="border-yellow-100"
                    value={newCustomerData.loyalty_points ?? 0}
                    onChange={e =>
                      setNewCustomerData({ ...newCustomerData, loyalty_points: Number(e.target.value || 0) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-yellow-900">Preferred Contact</label>
                  <select
                    value={newCustomerData.preferred_contact || 'Phone'}
                    onChange={(e) => setNewCustomerData({ ...newCustomerData, preferred_contact: e.target.value })}
                    className="border border-yellow-300 w-full p-2 rounded h-10 bg-white"
                  >
                    {contactOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 md:col-span-2 mt-1">
                  <input
                    id="whatsapp_optin"
                    type="checkbox"
                    className="h-4 w-4 accent-yellow-700"
                    checked={!!newCustomerData.whatsapp_optin}
                    onChange={e =>
                      setNewCustomerData({ ...newCustomerData, whatsapp_optin: e.target.checked ? 1 : 0 })
                    }
                  />
                  <label htmlFor="whatsapp_optin" className="text-sm text-yellow-900 select-none cursor-pointer">
                    Opt-in to WhatsApp updates
                  </label>
                </div>

              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-3 bg-yellow-50 border-t border-yellow-200 rounded-b-lg">
            <Button
              variant="outline"
              type="button"
              className="border-yellow-700 text-yellow-900 hover:bg-yellow-100"
              onClick={onClose}
            >
              Cancel
            </Button>
<Button
  type="submit"
  className="px-5 font-semibold"
>
  Save
</Button>
          </div>
        </form>
      </div>
      <style>{`
        .animate-fadeIn { animation: fadeInMove .38s cubic-bezier(.43,1.14,.49,1.01); }
        @keyframes fadeInMove {
          from { opacity: 0; transform: translateY(16px);}
          to   { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
};

export default AddCustomerModal;
