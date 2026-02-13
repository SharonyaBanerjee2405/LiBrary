
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userId, setUserId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId.trim()) {
      onLogin(userId.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full mb-4">
            <i className="fas fa-book-open text-3xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">LibraryPro</h1>
          <p className="text-slate-500 mt-2">Sign in to your library account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="e.g. S101 or L001"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <p className="mt-2 text-xs text-slate-400">
              Demo IDs: <strong>S101, S102</strong> (Students), <strong>L001</strong> (Librarian)
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg transform active:scale-95 transition-all"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Forgot your ID? Contact the library administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
