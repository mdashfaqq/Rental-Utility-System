
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/contexts/DataContext';
import { Category } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, category }) => {
  const { addCategory, updateCategory } = useData();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description
      });
    } else {
      setFormData({
        name: '',
        description: ''
      });
    }
  }, [category]);

const handleSubmit = async (e: React.FormEvent) => {

  e.preventDefault();

  let result;

  try {

    const payload = {
      name: formData.name.trim(),
      description: formData.description
    };

    if (category) {

      result = await updateCategory(
        category.id,
        payload
      );

    } else {

      result = await addCategory(payload);
    }

    // Duplicate / validation error
    if (!result?.success) {

      toast({
        title: "Error",
        description:
          result?.message ||
          "Category already exists",
        variant: "destructive",
      });

      return;
    }

    // Success
    toast({
      title: "Success",
      description: category
        ? "Category updated successfully"
        : "Category created successfully",
    });

    // Close only on success
    onClose();

  } catch (error: any) {

    console.error(error);

    toast({
      title: "Error",
      description:
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
      variant: "destructive",
    });
  }
};
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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
            <Button type="submit">
              {category ? 'Update' : 'Add'} Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
