import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, Eye, Grid } from 'lucide-react';
import { CustomerModal } from '@/components/modals/CustomerModal.tsx';
import { useToast } from '@/components/ui/use-toast';
import AddCustomerModal from '@/components/AddCustomerModal';
import { API_BASE_URL } from '@/services/api';
export const CustomerMaster = () => {
const { customers: initialCustomers = [], deleteCustomer } = useData();

const [customers, setCustomers] = useState(initialCustomers);
  
const fetchCustomers = async () => {

  try {

    const res = await fetch(`${API_BASE_URL}/customers.php`);
    const data = await res.json();

    setCustomers(data || []);

  } catch (err) {

    console.error('Failed to fetch customers:', err);

  }
};
useEffect(() => {
  fetchCustomers();
}, []);

useEffect(() => {
  setCustomers(initialCustomers);
}, [initialCustomers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
const [newCustomerData, setNewCustomerData] = useState({
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
  // 🔍 FILTER
const filteredCustomers = isModalOpen
  ? customers
  : (customers || []).filter((customer: any) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm) ||
      (customer.email || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
const handleAdd = () => {
    setEditingCustomer(null);
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

  setShowModal(true);
};

const handleEdit = (customer: any) => {

  setEditingCustomer(customer);

  setNewCustomerData({
    ...customer,
    status: customer.status || 'active',
  });

  setShowModal(true);
};

  const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
const handleDelete = (customer: any) => {

  // BLOCK ACTIVE CUSTOMER DELETE
  if (
    (customer.status || '').toLowerCase() === 'active'
  ) {

    toast({
      title: 'Deletion Not Allowed',
      description:
        'Active customers cannot be deleted. Mark customer as inactive instead.',
      variant: 'destructive',
    });

    return;
  }

  if (confirm('Delete this customer?')) {

    deleteCustomer(customer.id);

    toast({
      title: 'Customer Deleted',
      description: 'Customer removed successfully',
      variant: 'destructive',
    });
  }
};

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Master</h1>
          <p className="text-gray-600">Manage your customers & billing details</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? <Eye className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>

          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* SEARCH + STATS */}
      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">

            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Total Customers</span>
              <Badge className="bg-blue-600 text-white">
                {filteredCustomers.length}
              </Badge>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Customer List
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead> Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredCustomers.map((customer: any) => (
<TableRow
  key={customer.id}
  className={
    customer.status === 'inactive'
      ? 'opacity-60 hover:bg-red-50 transition-colors'
      : 'hover:bg-gray-50 transition-colors'
  }
>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-full mr-3">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>

                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {customer.address || '-'}
                    </TableCell>
  <TableCell>
    <Badge
      className={
        customer.status === "inactive"
          ? "bg-red-100 text-red-700 border-red-200 hover:bg-red-100"
          : customer.status === "blocked"
          ? "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
          : "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
      }
    >
      {customer.status || "active"}
    </Badge>
  </TableCell>


                    <TableCell>
                      <div className="flex justify-center gap-2">

                        <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(customer)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>

                      </div>
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (

        /* GRID VIEW */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="hover:shadow-xl border-l-4 border-blue-500">
              <CardContent className="p-6">

                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">{customer.name}</h3>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    {customer.phone}
                  </div>

                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    {customer.email || '-'}
                  </div>

                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-red-600 mt-0.5" />
                    {customer.address || '-'}
                  </div>
                  <div className="mt-2">
  <Badge
    className={
      customer.status === 'inactive'
        ? 'bg-red-100 text-red-700 border-red-200'
        : customer.status === 'blocked'
        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
        : 'bg-green-100 text-green-700 border-green-200'
    }
  >
    {(customer.status || 'active').toUpperCase()}
  </Badge>
</div>
                </div>


                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEdit(customer)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(customer)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}
<AddCustomerModal
  show={showModal}
  onClose={() => setShowModal(false)}
  customerPhone={newCustomerData.phone || ''}
  newCustomerData={newCustomerData}
  setNewCustomerData={setNewCustomerData}
  setCustomerName={() => {}}
  fetchCustomers={fetchCustomers}
  editingCustomer={editingCustomer}
/>
      {/* MODAL */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
      />
    </div>
  );
};