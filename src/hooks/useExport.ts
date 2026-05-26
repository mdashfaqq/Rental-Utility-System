
import { exportApi } from '@/services/api';
import { toast } from '@/hooks/use-toast';

export const useExport = () => {
  const downloadFile = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportProducts = async () => {
    try {
      const response = await exportApi.exportProducts();
      downloadFile(response.data, `products_${new Date().toISOString().split('T')[0]}.xls`);
      toast({
        title: 'Export Successful',
        description: 'Products exported to Excel successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export products.',
        variant: 'destructive',
      });
    }
  };

  const exportCategories = async () => {
    try {
      const response = await exportApi.exportCategories();
      downloadFile(response.data, `categories_${new Date().toISOString().split('T')[0]}.xls`);
      toast({
        title: 'Export Successful',
        description: 'Categories exported to Excel successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export categories.',
        variant: 'destructive',
      });
    }
  };

  const exportVendors = async () => {
    try {
      const response = await exportApi.exportVendors();
      downloadFile(response.data, `vendors_${new Date().toISOString().split('T')[0]}.xls`);
      toast({
        title: 'Export Successful',
        description: 'Vendors exported to Excel successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export vendors.',
        variant: 'destructive',
      });
    }
  };

  const exportTransactions = async () => {
    try {
      const response = await exportApi.exportTransactions();
      downloadFile(response.data, `transactions_${new Date().toISOString().split('T')[0]}.xls`);
      toast({
        title: 'Export Successful',
        description: 'Transactions exported to Excel successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export transactions.',
        variant: 'destructive',
      });
    }
  };

  const exportStockMovements = async () => {
    try {
      const response = await exportApi.exportStockMovements();
      downloadFile(response.data, `stock_movements_${new Date().toISOString().split('T')[0]}.xls`);
      toast({
        title: 'Export Successful',
        description: 'Stock movements exported to Excel successfully.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'Failed to export stock movements.',
        variant: 'destructive',
      });
    }
  };

  return {
    exportProducts,
    exportCategories,
    exportVendors,
    exportTransactions,
    exportStockMovements,
  };
};
