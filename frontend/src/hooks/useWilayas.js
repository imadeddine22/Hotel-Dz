import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { WILAYAS as STATIC_WILAYAS } from '@/lib/wilayas';

export function useWilayas() {
  const [wilayas, setWilayas] = useState(STATIC_WILAYAS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        const { data } = await api.get('/wilayas');
        if (data.success && data.wilayas?.length) {
          // Map to just names to keep compatibility with existing components
          const names = data.wilayas.map(w => w.name);
          setWilayas(names);
        }
      } catch (err) {
        console.error('Failed to load wilayas from API, using static list', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWilayas();
  }, []);

  const addWilaya = async (name) => {
    try {
      const { data } = await api.post('/admin/wilayas', { name });
      if (data.success && data.wilaya) {
        setWilayas(prev => [...prev, data.wilaya.name].sort());
        return data.wilaya.name;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Error adding wilaya';
      throw new Error(msg);
    }
  };

  return { wilayas, loading, addWilaya };
}
