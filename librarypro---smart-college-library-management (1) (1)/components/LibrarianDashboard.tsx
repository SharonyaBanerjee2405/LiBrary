
import React, { useState } from 'react';
import { Book, User, BorrowRecord } from '../types';
import { generateBookDescription } from '../geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LibrarianDashboardProps {
  books: Book[];
  users: User[];
  records: BorrowRecord[];
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onReset: () => void;
}

const LibrarianDashboard: React.FC<LibrarianDashboardProps> = ({ books, users, records, onUpdateBook, onDeleteBook, onReset }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'students' | 'analytics'>('inventory');
  const [editingBook, setEditingBook] = useState<Partial<Book> | null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const stats = {
    totalBooks: books.reduce((acc, b) => acc + b.totalCopies, 0),
    totalBorrowed: records.filter(r => !r.returnDate).length,
    totalFines: users.reduce((acc, u) => acc + u.totalFines, 0),
    studentsCount: users.filter(u => u.role === 'STUDENT').length
  };

  const categoryData = books.reduce((acc: any[], book) => {
    const existing = acc.find(item => item.name === book.category);
    if (existing) {
      existing.count += book.totalCopies;
    } else {
      acc.push({ name: book.category, count: book.totalCopies });
    }
    return acc;
  }, []);

  const COLORS = ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleAISummary = async () => {
    if (!editingBook?.title || !editingBook?.author) return;
    setAiGenerating(true);
    const desc = await generateBookDescription(editingBook.title, editingBook.author);
    setEditingBook(prev => ({ ...prev, description: desc }));
    setAiGenerating(false);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBook && editingBook.title && editingBook.author) {
      const bookToSave: Book = {
        id: editingBook.id || `b_${Date.now()}`,
        title: editingBook.title,
        author: editingBook.author,
        isbn: editingBook.isbn || 'N/A',
        category: editingBook.category || 'General',
        totalCopies: Number(editingBook.totalCopies) || 1,
        availableCopies: Number(editingBook.availableCopies) || 1,
        description: editingBook.description || ''
      };
      onUpdateBook(bookToSave);
      setEditingBook(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collection</p>
          <p className="text-2xl font-bold mt-1">{stats.totalBooks}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Borrows</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{stats.totalBorrowed}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Collected Fines</p>
          <p className="text-2xl font-bold mt-1 text-red-600">₹{stats.totalFines}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
          <p className="text-2xl font-bold mt-1">{stats.studentsCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          {(['inventory', 'students', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-semibold capitalize transition-all ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'inventory' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Book Inventory</h3>
              <button 
                onClick={() => setEditingBook({})}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i> Add Book
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-y border-slate-100">
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Title & Author</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">ISBN</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map(book => (
                    <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{book.title}</p>
                        <p className="text-xs text-slate-500">{book.author}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{book.isbn}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">{book.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium">{book.availableCopies}</span> / <span className="text-slate-400">{book.totalCopies}</span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => setEditingBook(book)} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i></button>
                        <button onClick={() => onDeleteBook(book.id)} className="text-red-500 hover:text-red-700"><i className="fas fa-trash"></i></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-6">Student Accounts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.filter(u => u.role === 'STUDENT').map(user => (
                <div key={user.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{user.name}</h4>
                      <p className="text-xs text-slate-500">{user.id} • {user.email}</p>
                      <p className="text-[10px] mt-1 text-slate-400">{user.borrowedBooks.length} books borrowed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">₹{user.totalFines}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Fines</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6">
            <h3 className="text-lg font-bold mb-6">Library Analytics</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 text-center">
              <button 
                onClick={onReset}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <i className="fas fa-undo mr-1"></i> Reset All Database Data (Developer Mode)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add Book Modal */}
      {editingBook && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold">{editingBook.id ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => setEditingBook(null)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSaveBook} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={editingBook.title || ''} onChange={e => setEditingBook({...editingBook, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Author</label>
                  <input required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={editingBook.author || ''} onChange={e => setEditingBook({...editingBook, author: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ISBN</label>
                  <input className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono" value={editingBook.isbn || ''} onChange={e => setEditingBook({...editingBook, isbn: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={editingBook.category || 'General'} onChange={e => setEditingBook({...editingBook, category: e.target.value})}>
                    <option>Computer Science</option>
                    <option>Classic</option>
                    <option>Science</option>
                    <option>History</option>
                    <option>Fiction</option>
                    <option>General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Copies</label>
                  <input type="number" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={editingBook.totalCopies || 1} onChange={e => setEditingBook({...editingBook, totalCopies: Number(e.target.value), availableCopies: Number(e.target.value)})} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                  <button 
                    type="button"
                    onClick={handleAISummary}
                    disabled={aiGenerating || !editingBook.title}
                    className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold hover:bg-indigo-200 transition-colors disabled:opacity-50"
                  >
                    {aiGenerating ? 'Generating...' : 'AI Generate Summary'}
                  </button>
                </div>
                <textarea 
                  rows={4} 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" 
                  value={editingBook.description || ''} 
                  onChange={e => setEditingBook({...editingBook, description: e.target.value})}
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingBook(null)} className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md transform active:scale-95 transition-all">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibrarianDashboard;
