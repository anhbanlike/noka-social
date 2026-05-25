import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const UsersTab: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profiles'));
        setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="text-slate-400">Đang tải...</div>;
  if (users.length === 0) return <div className="text-slate-400">Không có người dùng nào.</div>;

  return (
    <div className="text-slate-400">
      <h3 className="font-semibold text-white mb-4">Người dùng ({users.length})</h3>
      <ul className="space-y-2">
        {users.map((user: any) => (
          <li key={user.id} className="p-3 bg-white/5 rounded-lg">
            {user.full_name || user.username || 'Người dùng ẩn danh'}
          </li>
        ))}
      </ul>
    </div>
  );
};
