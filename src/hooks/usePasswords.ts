import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { databaseService } from '../lib/supabase';
import { encryptPassword } from '../lib/crypto';
import { Password, PasswordLevel } from '../types';

export function usePasswords() {
  const user = useAuthStore((state) => state.user);
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPasswords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await databaseService.getPasswords(user.id);
      setPasswords(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch passwords');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPasswords();
  }, [fetchPasswords]);

  const addPassword = async (payload: {
    platform_id: string | null;
    account_name: string;
    notes: string | null;
    levels: Array<{ label: string; plainValue: string }>;
  }) => {
    if (!user) throw new Error('Unauthenticated');
    setLoading(true);
    try {
      // Encrypt the password level values client-side
      const encryptedLevels: PasswordLevel[] = payload.levels.map((lvl) => ({
        label: lvl.label,
        value: encryptPassword(lvl.plainValue, user.id),
      }));

      const newEntry = {
        user_id: user.id,
        platform_id: payload.platform_id,
        account_name: payload.account_name,
        password_levels: encryptedLevels,
        notes: payload.notes,
      };

      const result = await databaseService.insertPassword(newEntry);
      await fetchPasswords();
      
      // Send optional Telegram alert if configured
      try {
        const tgConfig = await databaseService.getTelegramConfig(user.id);
        if (tgConfig && tgConfig.is_active && tgConfig.notify_new_password) {
          // Send a beautiful notification to telegram
          const platName = payload.platform_id ? 'Nền tảng' : 'Tài khoản lẻ';
          const text = `🔹 [Noka Guard Alert]\n\nChào bạn ${user.full_name},\nmột biểu mục mật khẩu mới vừa được thêm thành công:\n• Tài khoản: ${payload.account_name}\n• Số cấp độ: ${payload.levels.length}\n• Thời gian: ${new Date().toLocaleString()}\n\nMật khẩu của bạn đã được mã hóa AES-256 an toàn!`;
          
          await fetch(`https://api.telegram.org/bot${tgConfig.bot_token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: tgConfig.chat_id,
              text: text,
            }),
          }).catch((err) => console.log('Simulated Telegram send (Normal fallback if offline/invalid token)'));
        }
      } catch (tgErr) {
        console.error('Telegram notification dispatch error', tgErr);
      }

      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to insert password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (
    id: string,
    payload: {
      platform_id: string | null;
      account_name: string;
      notes: string | null;
      levels: Array<{ label: string; plainValue: string; alreadyEncrypted?: boolean }>;
    }
  ) => {
    if (!user) throw new Error('Unauthenticated');
    setLoading(true);
    try {
      // Encrypt values only if they were updated to brand new plain text values
      const encryptedLevels: PasswordLevel[] = payload.levels.map((lvl) => {
        if (lvl.alreadyEncrypted) {
          return { label: lvl.label, value: lvl.plainValue };
        }
        return {
          label: lvl.label,
          value: encryptPassword(lvl.plainValue, user.id),
        };
      });

      await databaseService.updatePassword(id, {
        platform_id: payload.platform_id,
        account_name: payload.account_name,
        password_levels: encryptedLevels,
        notes: payload.notes,
      });

      await fetchPasswords();
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removePassword = async (id: string) => {
    setLoading(true);
    try {
      await databaseService.deletePassword(id);
      await fetchPasswords();
    } catch (err: any) {
      setError(err.message || 'Failed to delete password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    passwords,
    loading,
    error,
    refresh: fetchPasswords,
    addPassword,
    updatePassword,
    removePassword,
  };
}
