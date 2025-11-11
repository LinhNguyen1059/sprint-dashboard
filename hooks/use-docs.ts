import { useEffect, useState } from 'react';

import { FileObject } from '@supabase/storage-js';

export const useGetDocs = () => {
  const [docs, setDocs] = useState<FileObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/list');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setDocs(result.docs || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching docs:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setDocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  return { docs, loading, error };
};
