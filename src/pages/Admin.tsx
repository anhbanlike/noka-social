import React, { useState } from 'react';
import { Shield, Users, CreditCard, Lock, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { UsersTab } from '../components/admin/UsersTab';
import { SecurityTab } from '../components/admin/SecurityTab';
import { BillingTab } from '../components/admin/BillingTab';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Quản lý người dùng', icon: Users },
    { id: 'security', label: 'Quản lý bảo mật', icon: Shield },
    { id: 'billing', label: 'Gói giá bán', icon: CreditCard },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black text-white tracking-wider uppercase">Quản trị Hệ thống</h1>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">
          {tabs.find((t) => t.id === activeTab)?.label}
        </h2>
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'billing' && <BillingTab />}
      </div>
    </div>
  );
};

export default Admin;
