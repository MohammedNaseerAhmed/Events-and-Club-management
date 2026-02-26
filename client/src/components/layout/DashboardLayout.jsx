import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Home, Users, Calendar, MessageSquare, Bell, FileText, BookOpen,
  Settings, LogOut, Menu, X, ChevronDown, Building2, Shield
} from 'lucide-react';

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/network/invitations', icon: Users, label: 'Network' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/chats', icon: MessageSquare, label: 'Messages' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
];

export default function DashboardLayout() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-[#0a0f1e] border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">CampusHub</span>
        </div>
      </div>

      {/* Profile mini */}
      <div className="px-4 py-4 border-b border-white/5">
        <NavLink to={`/${user?.username}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.profilePicUrl ? (
              <img src={user.profilePicUrl} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-slate-400 text-xs truncate">@{user?.username}</p>
          </div>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative ${isActive
                ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/20 text-white border border-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
                {label}
                {label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin / Club Head links */}
        {user?.role === 'admin' && (
          <NavLink to="/admin/dashboard" onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10'}`
            }>
            <Shield size={18} />Admin Panel
          </NavLink>
        )}
        {(user?.role === 'clubHead') && (
          <NavLink to="/club-admin/dashboard" onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20' : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`
            }>
            <Building2 size={18} />My Organization
          </NavLink>
        )}
      </nav>

      {/* Settings + Logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-1">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings size={18} />Settings
          <ChevronDown size={14} className={`ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
        </button>
        {settingsOpen && (
          <div className="pl-6 space-y-1">
            {['personal-details', 'change-password', 'privacy-settings', 'notifications', 'organizations', 'delete-account'].map((s) => (
              <NavLink key={s} to={`/settings/${s}`} onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `block px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-200'}`}>
                {s.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
              </NavLink>
            ))}
          </div>
        )}
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut size={18} />Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#060b18] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0a0f1e] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <span className="font-bold text-white">CampusHub</span>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/notifications" className="relative text-slate-400 hover:text-white">
              <Bell size={20} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
