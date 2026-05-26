
import { useState, useEffect } from 'react';
import { settingsApi } from '@/services/api';

export const useAppSettings = () => {
  const [storeSettings, setStoreSettings] = useState({
    name: 'Grocery POS',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    licenseNumber: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      const response = await settingsApi.getStoreSettings();
      if (response.data && Object.keys(response.data).length > 0) {
        setStoreSettings(prev => ({ ...prev, ...response.data }));
      }
    } catch (error) {
      console.error('Error loading store settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { storeSettings, loading, refreshSettings: loadStoreSettings };
};
