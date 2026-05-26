import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit, Trash2, Users, Phone, Mail, MapPin, Eye, Grid } from 'lucide-react';
import { VendorModal } from '@/components/modals/VendorModal';
import { useToast } from '@/components/ui/use-toast';

export const VendorMaster = () => {
  const { vendors, deleteVendor } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contact.includes(searchTerm) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
    toast({
      title: 'Vendor Edited',
      description: 'The vendor details have been successfully removed.',
      variant: 'destructive', // optional: makes it red
      duration: 3000,
    });
  };

  const handleAdd = () => {
    setEditingVendor(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      deleteVendor(id);
      toast({
      title: 'Vendor Deleted',
      description: 'The vendor has been successfully removed.',
      variant: 'destructive', // optional: makes it red
      duration: 3000,
    });
    }
  };



  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Vendor Master</h1>
          <p className="text-gray-600">Manage supplier information and contacts</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? <Eye className="h-4 w-4 mr-2" /> : <Grid className="h-4 w-4 mr-2" />}
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vendors by name, contact, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Total Vendors:</span>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                {filteredVendors.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Vendor List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Address</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{vendor.contact}</TableCell>
                    <TableCell className="text-gray-700">{vendor.email}</TableCell>
                    <TableCell className="text-gray-700 max-w-xs truncate">{vendor.address}</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(vendor)}
                          className="hover:bg-purple-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(vendor.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{vendor.name}</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">{vendor.contact}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-start text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                    <span className="text-sm line-clamp-2">{vendor.address}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-purple-50"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(vendor.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vendor={editingVendor}
      />
    </div>
  );
};
