
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { subCategoriesApi } from '@/services/api';
import { Plus, Search, Edit, Trash2, Tag, Grid, Eye } from 'lucide-react';
import { SubCategoryModal } from '@/components/modals/SubCategoryModal';
import { toast } from 'sonner';

export const SubCategoryMaster = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const response = await subCategoriesApi.getAll();
      console.log('Subcategories fetched:', response.data);
      setSubcategories(response.data);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubCategories = subcategories.filter(subCategory =>
    subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subCategory.category_name && subCategory.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEdit = (subcategory: any) => {
    setEditingSubCategory(subcategory);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSubCategory(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this sub-category?')) {
      try {
        await subCategoriesApi.delete(id);
        toast.success('Sub-category deleted successfully');
        fetchSubcategories();
      } catch (error) {
        console.error('Error deleting subcategory:', error);
        toast.error('Failed to delete sub-category');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchSubcategories(); // Refresh data after modal closes
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading subcategories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sub-Category Master</h1>
          <p className="text-gray-600">Manage product sub-categories and organize your inventory</p>
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
            Add Sub-Category
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sub-categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-purple-800">Total Sub-Categories:</span>
              <Badge variant="secondary" className="bg-purple-600 text-white">
                {filteredSubCategories.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2 text-purple-600" />
              Sub-Category List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Sub-Category</TableHead>
                  <TableHead className="font-semibold">Parent Category</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubCategories.map((subCategory) => (
                  <TableRow key={subCategory.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-full mr-4">
                          <Tag className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="font-medium text-gray-900">{subCategory.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        {subCategory.category_name || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{subCategory.description || 'No description'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(subCategory)}
                          className="hover:bg-purple-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(subCategory.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSubCategories.map((subCategory) => (
            <Card key={subCategory.id} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <Tag className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{subCategory.name}</h3>
                </div>
                
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Parent Category:</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                    {subCategory.category_name || 'N/A'}
                  </Badge>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Description:</p>
                  <p className="text-sm text-gray-600">{subCategory.description || 'No description'}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-purple-50"
                    onClick={() => handleEdit(subCategory)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(subCategory.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SubCategoryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        subcategory={editingSubCategory}
      />
    </div>
  );
};
