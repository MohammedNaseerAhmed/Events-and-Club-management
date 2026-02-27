import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Menu, Search, User,Building2  } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AppNavbar({
  title = 'Dashboard',
  onToggleSidebar,
  onToggleMobileSidebar,
  showSearch = true,
}) {
  const { user, logout, unreadCount } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="lg:hidden text-slate-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden lg:inline-flex text-slate-300 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="flex items-center gap-3 text-white font-semibold text-lg truncate">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="tracking-tight">CampusHub</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
            <Search size={16} className="text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none w-32 lg:w-52"
              aria-label="Search"
            />
          </div>
        )}

        {user ? (
          <>
            <Link to="/notifications" className="relative">
              <Bell className="text-slate-300 hover:text-white cursor-pointer" size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white px-1.5 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm overflow-hidden">
                  {user.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden />
                  <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 py-1">
                    <Link
                      to={`/${user.username}`}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/settings/personal-details"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                    >
                      <User size={16} />
                      Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link to="/login" className="px-3 py-2 text-slate-300 hover:text-white">
              Login
            </Link>
            <Link to="/register" className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
