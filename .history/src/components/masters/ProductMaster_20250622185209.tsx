// import { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { useData } from '@/contexts/DataContext';
// import { useLanguage } from '@/contexts/LanguageContext';
// import { useExport } from '@/hooks/useExport';
// import { Plus, Search, Edit, Trash2, Package, Download } from 'lucide-react';
// import { ProductModal } from '@/components/ProductModal';
// import { productsApi } from '@/services/api';
// import { toast } from 'sonner';

// export const ProductMaster = () => {
//   const { products, categories, deleteProduct } = useData();
//   const { t } = useLanguage();
//   const { exportProducts } = useExport();
//   // const [products, setProducts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);

//     // useEffect(() => {
//     //   fetchProduct();
//     // }, []);
  

//       // const fetchProduct = async () => {
//       //   setLoading(true);
//       //   try {
//       //     const response = await productsApi.getAll();
//       //     console.log('Product fetched:', response.data);
//       //     fetchProduct(response.data);
//       //   } catch (error) {
//       //     console.error('Error fetching subcategories:', error);
//       //     toast.error('Failed to fetch subcategories');
//       //   } finally {
//       //     setLoading(false);
//       //   }
//       // };

//   const filteredProducts = products.filter(product => {
//     const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          product.barcode.includes(searchTerm);
//     const matchesCategory = !selectedCategory || product.category === selectedCategory;
//     return matchesSearch && matchesCategory;
//   });

//   const handleEdit = (product: any) => {
//     setEditingProduct(product);
//     setIsModalOpen(true);
//   };

//   const handleAdd = () => {
//     setEditingProduct(null);
//     setIsModalOpen(true);
//   };
//     };

//   const handleDelete = async (id: string) => {
//     if (confirm('Are you sure you want to delete this product?')) {
//       try {
//         await deleteProduct(id);
//       } catch (error) {
//         console.error('Error deleting product:', error);
//       }
//   }
//     };


//    const handleDelete = async (id: string) => {
//     if (confirm('Are you sure you want to delete this sub-category?')) {
//       try {
//         await productsApi.delete(id);
//         toast.success('Sub-category deleted successfully');
//         fetchSubcategories();
//       } catch (error) {
//         console.error('Error deleting subcategory:', error);
//         toast.error('Failed to delete sub-category');
//       }
//     }
//   };
//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">{t('products')} Master</h1>
//           <p className="text-gray-600">Manage all product information</p>
//         </div>
//         <div className="flex gap-2">
//           <Button onClick={exportProducts} variant="outline">
//             <Download className="h-4 w-4 mr-2" />
//             {t('exportToExcel')}
//           </Button>
//           <Button onClick={handleAdd}>
//             <Plus className="h-4 w-4 mr-2" />
//             {t('addProduct')}
//           </Button>
//         </div>
//       </div>

//       <Card className="mb-6">
//         <CardContent className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 placeholder="Search products..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.name}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//             <div className="text-sm text-gray-600 flex items-center">
//               Total Products: {filteredProducts.length}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>{t('products')} List</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>{t('products')}</TableHead>
//                 <TableHead>{t('category')}</TableHead>
//                 {/* <TableHead>Sub-Category</TableHead> */}
//                 <TableHead>Unit Price</TableHead>
//                 <TableHead>{t('stock')}</TableHead>
//                 <TableHead>Unit</TableHead>
//                 <TableHead>{t('vendor')}</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredProducts.map((product) => (
//                 <TableRow key={product.id}>
//                   <TableCell>
//                     <div className="flex items-center">
//                       <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
//                         <Package className="h-5 w-5 text-gray-400" />
//                       </div>
//                       <div>
//                         <div className="font-medium">{product.name}</div>
//                         <div className="text-sm text-gray-500">{product.barcode}</div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>{product.category}</TableCell>
//                   {/* <TableCell>{product.subcategory || '-'}</TableCell> */}
//                   <TableCell className="font-medium text-green-600">₹{product.unitPrice}</TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${
//                       product.stock < 10 
//                         ? 'text-red-600 bg-red-100' 
//                         : product.stock < 30 
//                           ? 'text-yellow-600 bg-yellow-100'
//                           : 'text-green-600 bg-green-100'
//                     }`}>
//                       {product.stock}
//                     </span>
//                   </TableCell>
//                   <TableCell>{product.unit}</TableCell>
//                   <TableCell>{product.vendor}</TableCell>
//                   <TableCell>
//                     <div className="flex space-x-2">
//                       <Button 
//                         variant="outline" 
//                         size="sm"
//                         onClick={() => handleEdit(product)}
//                       >
//                         <Edit className="h-3 w-3 mr-1" />
//                         {t('edit')}
//                       </Button>
//                       {/* <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
//                         <Trash2 className="h-3 w-3" />
//                       </Button> */}

//                          <Button 
//                         variant="outline" 
//                         size="sm" 
//                         className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                         onClick={() => handleDelete(product.id)}
//                       >
//                     <Trash2 className="h-3 w-3" />
//                   </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       <ProductModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         product={editingProduct}
//       />
//     </div>
//   );
// };


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useData } from '@/contexts/DataContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExport } from '@/hooks/useExport';
import { Plus, Search, Edit, Trash2, Package, Download } from 'lucide-react';
import { ProductModal } from '@/components/ProductModal';
import { useToast } from '@/components/ui/use-toast';



export const ProductMaster = () => {
  const { products, categories, deleteProduct } = useData();
  const { t } = useLanguage();
  const { toast } = useToast();


  const { exportProducts } = useExport();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // const handleDelete = async (id: string) => {
  //   if (confirm('Are you sure you want to delete this product?')) {
  //     try {
  //       await deleteProduct(id);
  //       toast({
  //       title: 'Product Deleted',
  //       description: `"${products.name}" was removed from the inventory.`,
  //       duration: 3000,
  //       className: 'bg-white text-black border border-black shadow-md',
  //     });
  //     } catch (error) {
  //       console.error('Error deleting product:', error);
  //       toast({
  //       title: 'Failed to delete product',
  //       description: 'Something went wrong. Please try again.',
  //       duration: 3000,
  //       variant: 'destructive',
  //       className: 'bg-white text-black border border-black shadow-md',
  //     });
  //     }
  //   }
  // };

  const handleDelete = async (id: string) => {
  const productToDelete = products.find(p => p.id === id); // Get full product object

  if (!productToDelete) return;

  if (confirm(`Are you sure you want to delete "${productToDelete.name}"?`)) {
    try {
      await deleteProduct(id);
      toast({
        title: 'Product Deleted',
        description: `"${productToDelete.name}" was removed from the inventory.`,
        duration: 3000,
        className: 'bg-white text-black border border-black shadow-md',
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Failed to delete product',
        description: 'Something went wrong. Please try again.',
        duration: 3000,
        variant: 'destructive',
        className: 'bg-white text-black border border-black shadow-md',
      });
    }
  }
};
  

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{t('products')} Master</h1>
          <p className="text-gray-600">Manage all product information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportProducts} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('exportToExcel')}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t('addProduct')}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              Total Products: {filteredProducts.length}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('products')} List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('products')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead> Price</TableHead>

                <TableHead>{t('stock')}</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>{t('vendor')}</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.barcode}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="font-medium text-green-600">₹{product.unitPrice}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.stock < 10 
                        ? 'text-red-600 bg-red-100'
                        : product.stock < 30
                          ? 'text-yellow-600 bg-yellow-100'
                          : 'text-green-600 bg-green-100'
                    }`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>{product.unit}</TableCell>
                  <TableCell>{product.vendor}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {t('edit')}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />
    </div>
  );
};

