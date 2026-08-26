'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { 
  Users, Shield, User as UserIcon, 
  CheckCircle2, Clock, Search, AlertCircle 
} from 'lucide-react';
import Navbar from '@/components/Navbar';

interface U {
  id: number;
  email: string;
  name: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<U[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) api.admin.users.list().then(setUsers).catch(console.error);
  }, [user, loading, router]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-primary-600" />
              Registered Accounts & Roles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Audit registered donor accounts, administrative roles, and email verification states.
            </p>
          </div>

          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-700 shadow-xs">
            Total Accounts: {users.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">User Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Role</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Verification</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600 text-right">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Name + Avatar */}
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {u.name?.[0] || 'U'}
                      </div>
                      <span>{u.name}</span>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {u.email}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-md border ${
                          u.role === 'ADMIN'
                            ? 'bg-primary-50 text-primary-700 border-primary-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3 text-primary-600" />}
                        {u.role}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      {u.verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending Email
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 text-right text-slate-500 font-medium font-mono">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <p className="font-bold text-slate-800 text-sm">No users found</p>
                        <p className="text-xs text-slate-500">Try adjusting your search filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
