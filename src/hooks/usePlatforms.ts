import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { databaseService } from '../lib/supabase';
import { Platform } from '../types';

export function usePlatforms() {
  const user = useAuthStore((state) => state.user);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlatforms = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await databaseService.getPlatforms(user.id);
      
      // Calculate password counts for each platform by fetching passwords
      const passwords = await databaseService.getPasswords(user.id);
      const platWithCounts = data.map(p => {
        const count = passwords.filter(pw => pw.platform_id === p.id).length;
        return { ...p, password_count: count };
      });

      setPlatforms(platWithCounts);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch platforms');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const addPlatforms = async (items: Array<{ name: string; logo_url: string | null; tempFile?: File | null }>) => {
    if (!user) throw new Error('Unauthenticated');
    setLoading(true);
    try {
      const parsedItems = [];
      
      for (const item of items) {
        let finalLogoUrl = item.logo_url;
        
        // If they uploaded a physical logo, upload to storage
        if (item.tempFile) {
          const fileExt = item.tempFile.name.split('.').pop();
          const fileName = `${user.id}_${Math.random().toString(36).substring(2, 7)}_${Date.now()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;
          finalLogoUrl = await databaseService.uploadFile('platform-logos', filePath, item.tempFile);
        }

        parsedItems.push({
          user_id: user.id,
          name: item.name,
          logo_url: finalLogoUrl,
        });
      }

      await databaseService.insertPlatforms(parsedItems);
      await fetchPlatforms();
    } catch (err: any) {
      setError(err.message || 'Failed to add platforms');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePlatform = async (id: string) => {
    setLoading(true);
    try {
      await databaseService.deletePlatform(id);
      await fetchPlatforms();
    } catch (err: any) {
      setError(err.message || 'Failed to delete platform');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePlatform = async (id: string, name: string, logo_url: string | null, tempFile?: File | null) => {
    if (!user) throw new Error('Unauthenticated');
    setLoading(true);
    try {
      let finalLogoUrl = logo_url;
      if (tempFile) {
        const fileExt = tempFile.name.split('.').pop();
        const fileName = `${user.id}_${Math.random().toString(36).substring(2, 7)}_${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        finalLogoUrl = await databaseService.uploadFile('platform-logos', filePath, tempFile);
      }

      await databaseService.updatePlatform(id, {
        name,
        logo_url: finalLogoUrl,
      });
      await fetchPlatforms();
    } catch (err: any) {
      setError(err.message || 'Failed to update platform');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    platforms,
    loading,
    error,
    refresh: fetchPlatforms,
    addPlatforms,
    removePlatform,
    updatePlatform,
  };
}
