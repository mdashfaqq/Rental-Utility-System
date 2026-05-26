
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categoriesApi ,subCategoriesApi } from '@/services/api';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

interface SubCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: any;
}

export const SubCategoryModal: React.FC<SubCategoryModalProps> = ({ isOpen, onClose, subcategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: ''
  });
const {
  addSubCategory,
  updateSubCategory
} = useData();
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (subcategory) {
      console.log('Editing subcategory:', subcategory);
      setFormData({
        name: subcategory.name,
        category_id: String(
  subcategory.category_id || ""
),
        description: subcategory.description || ''
      });
    } else {
      setFormData({
        name: '',
        category_id: '',
        description: ''
      });
    }
  }, [subcategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      console.log('Categories fetched for modal:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

const handleSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();

  setLoading(true);

  console.log(
    'Submitting form data:',
    formData
  );

  let result;

  try {

    if (subcategory) {

      const updateData = {
        id: subcategory.id,
        ...formData
      };

      console.log(
        'Updating subcategory with data:',
        updateData
      );

      result = await updateSubCategory(
        subcategory.id,
        formData
      );

    } else {

      console.log(
        'Creating new subcategory with data:',
        formData
      );

      result = await addSubCategory(formData);
    }

    // Duplicate / validation error
    if (!result?.success) {

      toast.error(
        result?.message ||
        'Sub-category already exists'
      );

      return;
    }

    // Success
    toast.success(
      subcategory
        ? 'Sub-category updated successfully'
        : 'Sub-category created successfully'
    );

    onClose();

  } catch (error: any) {

    console.error(
      'Error saving subcategory:',
      error
    );

    toast.error(
      error?.response?.data?.message ||
      'Something went wrong'
    );

  } finally {

    setLoading(false);
  }
};
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{subcategory ? 'Edit Sub-Category' : 'Add New Sub-Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Sub-Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Parent Category</Label>
<Select
  key={formData.category_id}
  value={formData.category_id || ""}
              onValueChange={(value) => {
                console.log('Selected category ID:', value);
                setFormData({ ...formData, category_id: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
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
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (subcategory ? 'Update' : 'Add')} Sub-Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
