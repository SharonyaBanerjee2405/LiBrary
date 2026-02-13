
import React from 'react';
import { User, Role } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <i className="fas fa-book-reader text-indigo-600 text-2xl"></i>
            <span className="text-xl font-bold text-slate-800">LibraryPro</span>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">
              {user.role}
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-700">{user.name}</span>
              <span className="text-xs text-slate-500">{user.id}</span>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center space-x-2 text-slate-500 hover:text-red-600 transition-colors"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
