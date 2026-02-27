import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AppNavbar from './AppNavbar';
import {
  Home,
  Users,
  Building2,
  Calendar,
  FileText,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const navItems = [
  { to: '/feed', icon: Home, label: 'Feed' },
  { to: '/network/invitations', icon: Users, label: 'Network' },
  { to: '/chapters', icon: Building2, label: 'Chapters' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/chats', icon: MessageSquare, label: 'Messages' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
];

const resolveTitle = (pathname) => {
  if (pathname.startsWith('/feed')) return 'Feed';
  if (pathname.startsWith('/network')) return 'Network';
  if (pathname.startsWith('/chapters')) return 'Chapters';
  if (pathname.startsWith('/events')) return 'Events';
  if (pathname.startsWith('/documents')) return 'Documents';
  if (pathname.startsWith('/chats')) return 'Messages';
  if (pathname.startsWith('/courses')) return 'Courses';
  if (pathname.startsWith('/settings')) return 'Settings';
  if (pathname.startsWith('/notifications')) return 'Notifications';
  if (pathname === '/') return 'Home';
  return 'CampusHub';
};

export default function DashboardLayout() {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/settings'));

  const pageTitle = useMemo(() => resolveTitle(location.pathname), [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-slate-900 border-r border-slate-700/50">
      

      {user && (
        <div className="px-3 py-4 border-b border-slate-700/50">
          <NavLink
            to={`/${user.username}`}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-700/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
              {user.profilePicUrl ? (
                <img src={user.profilePicUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-slate-400 text-xs truncate">@{user.username}</p>
              </div>
            )}
          </NavLink>
        </div>
      )}

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              } ${sidebarCollapsed ? 'justify-center px-2' : ''}`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="truncate">{label}</span>
                {label === 'Messages' && unreadCount > 0 && (
                  <span className="ml-auto bg-blue-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <button
          type="button"
          onClick={() => {
            if (sidebarCollapsed) {
              navigate('/settings/personal-details');
              setMobileOpen(false);
              return;
            }
            setSettingsOpen((v) => !v);
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
            location.pathname.startsWith('/settings')
              ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
          } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
        >
          <Settings size={20} className="flex-shrink-0" />
          {!sidebarCollapsed && (
            <>
              <span className="truncate">Settings</span>
              <ChevronDown size={14} className={`ml-auto transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {settingsOpen && !sidebarCollapsed && (
          <div className="ml-4 mt-1 space-y-0.5">
            {[
              { key: 'personal-details', label: 'Personal Details' },
              { key: 'change-password', label: 'Change Password' },
              { key: 'privacy-settings', label: 'Privacy Settings' },
              { key: 'notifications', label: 'Notifications' },
              ...(user?.role === 'admin' ? [{ key: 'organizations', label: 'Organizations' }] : []),
              { key: 'delete-account', label: 'Delete Account' },
            ].map((section) => (
              <NavLink
                key={section.key}
                to={`/settings/${section.key}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive ? 'text-blue-300 bg-blue-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/40'
                  }`
                }
              >
                {section.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="px-2 py-4 border-t border-slate-700/50">
        <button
          type="button"
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut size={20} className="flex-shrink-0" /> {!sidebarCollapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <AppNavbar
        title={pageTitle}
        onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        onToggleMobileSidebar={() => setMobileOpen(true)}
        sidebarCollapsed={sidebarCollapsed}
        showSearch
      />

      <div className="flex flex-1 min-h-0">
        <div
          className={`hidden lg:flex flex-col flex-shrink-0 transition-[width] duration-200 border-r border-slate-800 ${
            sidebarCollapsed ? 'w-[72px]' : 'w-64'
          }`}
        >
          <Sidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
            <div className="absolute left-0 top-0 bottom-0 w-72 z-50 bg-slate-900">
              <Sidebar />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
