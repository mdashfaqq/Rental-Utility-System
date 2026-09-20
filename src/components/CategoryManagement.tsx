
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Search, Edit, Trash2, Grid, Eye } from 'lucide-react';
import { CategoryModal } from '@/components/modals/CategoryModal';

export const CategoryManagement = () => {
  const { t } = useLanguage();
  const { categories, deleteCategory } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="p-6 bg-transparent min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-normal text-foreground">{t('categories')}</h1>
          <p className="text-muted-foreground">Organize and manage your product categories</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? <Eye className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            <span className="hidden md:inline ml-2">{viewMode === 'grid' ? 'Table View' : 'Grid View'}</span>
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline ml-2">{t('add')} {t('category')}</span>
          </Button>
        </div>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`${t('search')} ${t('categories')}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
              <span className="text-sm font-medium text-green-800">Total Categories:</span>
              <Badge variant="secondary" className="bg-green-600 text-white">
                {filteredCategories.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="flex flex-wrap gap-1">
                  {category.subcategories?.slice(0, 3).map((sub, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {sub}
                    </Badge>
                  ))}
                  {(category.subcategories?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{(category.subcategories?.length || 0) - 3} more
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 hover:bg-green-50"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  {t('edit')}
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

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />
    </div>
  );
};
