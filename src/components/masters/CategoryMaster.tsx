import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit, Trash2, Grid, Eye } from 'lucide-react';
import { CategoryModal } from '@/components/modals/CategoryModal';
import { toast } from '@/hooks/use-toast';
export const CategoryMaster = () => {
  const { categories, deleteCategory } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

const handleDelete = async (id: string) => {

  const confirmed = window.confirm(
    'Are you sure you want to delete this category?'
  );

  if (!confirmed) return;

  try {

    await deleteCategory(id);

    toast({
      title: "Category Deleted",
      description: "Category removed successfully",
    });

  } catch (err: any) {

    toast({
      title: "Delete Failed",
      description:
        err?.message ||
        "Failed to delete category",
      variant: "destructive",
    });
  }
};

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Category Master</h1>
          <p className="text-gray-600">Manage product categories and organize your inventory</p>
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
            Add Category
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-blue-800">Total Categories:</span>
              <Badge variant="secondary" className="bg-blue-600 text-white">
                {filteredCategories.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Grid className="h-5 w-5 mr-2 text-green-600" />
              Category List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Sub-Categories</TableHead>
                  <TableHead className="font-semibold text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-full mr-4">
                          <Grid className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{category.description}</TableCell>
<TableCell>
  <div className="flex flex-wrap gap-1">

    {Array.isArray(category.subcategories) &&
    category.subcategories.length > 0 ? (
      <>
        {category.subcategories
          .slice(
            0,
            expandedCategory === String(category.id)
              ? undefined
              : 2
          )
          .map((sub, index) => (
            <Badge
              key={index}
              variant="outline"
              className="
                text-xs
                bg-blue-50
                text-blue-700
                border-blue-200
              "
            >
              {sub}
            </Badge>
        ))}

        {/* SHOW MORE */}
        {category.subcategories.length > 2 &&
          expandedCategory !== String(category.id) && (
            <button
              type="button"
              onClick={() =>
                setExpandedCategory(String(category.id))
              }
            >
              <Badge
                variant="secondary"
                className="
                  text-xs
                  cursor-pointer
                  hover:bg-gray-200
                  transition-colors
                "
              >
                +{category.subcategories.length - 2}
              </Badge>
            </button>
        )}

        {/* SHOW LESS */}
        {expandedCategory === String(category.id) && (
          <button
            type="button"
            onClick={() => setExpandedCategory(null)}
          >
            <Badge
              variant="secondary"
              className="
                text-xs
                cursor-pointer
                hover:bg-gray-200
              "
            >
              Show Less
            </Badge>
          </button>
        )}
      </>
    ) : (
      <span className="text-gray-400 text-sm">
        No Subcategories
      </span>
    )}

  </div>
</TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(category.id)}
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
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-xl transition-shadow duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <Grid className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-800">{category.name}</h3>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{category.description}</p>
                
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sub-categories:</p>
<div className="flex flex-wrap gap-1 mt-2">

  {Array.isArray(category.subcategories) &&
  category.subcategories.length > 0 ? (
    <>
      {/* FIRST 2 */}
      {category.subcategories
        .slice(0, expandedCategory === category.id ? undefined : 2)
        .map((sub, index) => (
          <Badge
            key={index}
            variant="outline"
            className="
              text-xs
              bg-blue-50
              text-blue-700
              border-blue-200
            "
          >
            {sub}
          </Badge>
      ))}

      {/* EXPAND BUTTON */}
      {category.subcategories.length > 2 &&
        expandedCategory !== category.id && (
          <button
            type="button"
            onClick={() => setExpandedCategory(category.id)}
          >
            <Badge
              variant="secondary"
              className="
                text-xs
                cursor-pointer
                hover:bg-gray-200
                transition-colors
              "
            >
              +{category.subcategories.length - 2}
            </Badge>
          </button>
      )}

      {/* COLLAPSE */}
      {expandedCategory === category.id && (
        <button
          type="button"
          onClick={() => setExpandedCategory(null)}
        >
          <Badge
            variant="secondary"
            className="
              text-xs
              cursor-pointer
              hover:bg-gray-200
            "
          >
            Show Less
          </Badge>
        </button>
      )}
    </>
  ) : (
    <span className="text-xs text-gray-400">
      No Subcategories
    </span>
  )}

</div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-50"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
    </div>
  );
};
