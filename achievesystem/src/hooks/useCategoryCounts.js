import { useState, useEffect } from 'react';

const API_BASE = 'https://archivesystembackend.onrender.com';

export const useCategoryCounts = () => {
  const [categoryData, setCategoryData] = useState({
    counts: {
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      spreadsheets: 0,
      presentations: 0,
      others: 0,
      total: 0
    },
    sizes: {
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      spreadsheets: 0,
      presentations: 0,
      others: 0,
      total: 0
    },
    loading: true,
    error: null
  });

  const fetchCategoryCounts = async () => {
    try {
      setCategoryData(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/upload/categories/counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setCategoryData({
          counts: result.data.categoryCounts,
          sizes: result.data.categorySizes,
          loading: false,
          error: null
        });
      } else {
        throw new Error(result.message || 'Failed to load category counts');
      }
    } catch (err) {
      console.error('Error fetching category counts:', err);
      setCategoryData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }));
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCategoryCounts();
  }, []);

  return {
    categoryCounts: categoryData.counts,
    categorySizes: categoryData.sizes,
    loading: categoryData.loading,
    error: categoryData.error,
    refetch: fetchCategoryCounts
  };
};