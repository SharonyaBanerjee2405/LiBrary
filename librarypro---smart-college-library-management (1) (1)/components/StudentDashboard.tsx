
import React, { useState, useEffect } from 'react';
import { User, Book, BorrowRecord } from '../types';
import { getBookRecommendations } from '../geminiService';

interface StudentDashboardProps {
  user: User;
  books: Book[];
  records: BorrowRecord[];
  onBorrow: (bookId: string) => void;
  onReturn: (recordId: string) => void;
  onPayFine: (amount: number) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, books, records, onBorrow, onReturn, onPayFine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recs, setRecs] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  const activeBorrows = records.filter(r => !r.returnDate);
  const pastBorrows = records.filter(r => !!r.returnDate);
  
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchRecs = async () => {
      if (records.length > 0) {
        setRecLoading(true);
        const titles = records.slice(0, 3).map(r => r.bookTitle);
        const result = await getBookRecommendations(titles);
        setRecs(result);
        setRecLoading(false);
      }
    };
    fetchRecs();
  }, [records.length]);

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <i className="fas fa-book text-xl"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500">Currently Borrowed</p>
            <p className="text-2xl font-bold">{activeBorrows.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <i className="fas fa-history text-xl"></i>
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Books Read</p>
            <p className="text-2xl font-bold">{records.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <i className="fas fa-wallet text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-slate-500">Outstanding Fines</p>
              <p className="text-2xl font-bold">₹{user.totalFines}</p>
            </div>
          </div>
          {user.totalFines > 0 && (
            <button 
              onClick={() => onPayFine(user.totalFines)}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Pay Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Book Search and Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Library Catalog</h2>
              <div className="relative w-64">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="Search title, author..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBooks.map(book => (
                <div key={book.id} className="p-4 border border-slate-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/10 transition-all flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{book.category}</span>
                    <h3 className="font-bold text-slate-800 mt-2 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-1">{book.author}</p>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 italic">"{book.description}"</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-xs ${book.availableCopies > 0 ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Out of Stock'}
                    </span>
                    <button 
                      disabled={book.availableCopies <= 0}
                      onClick={() => onBorrow(book.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${book.availableCopies > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      Borrow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Recommendations & Active Borrows */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <i className="fas fa-magic text-indigo-300"></i>
                Smart Recommendations
              </h2>
              <p className="text-xs text-indigo-200 mt-1 mb-4">AI picks based on your history</p>
              
              {recLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-12 bg-indigo-800/50 rounded"></div>
                  <div className="h-12 bg-indigo-800/50 rounded"></div>
                </div>
              ) : recs.length > 0 ? (
                <div className="space-y-3">
                  {recs.map((r, i) => (
                    <div key={i} className="bg-white/10 p-3 rounded-lg border border-white/10">
                      <p className="font-semibold text-sm line-clamp-1">{r.title}</p>
                      <p className="text-xs text-indigo-200">{r.author}</p>
                      <p className="text-[10px] text-indigo-300 mt-1 italic">{r.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-indigo-300 italic">Borrow some books to see recommendations!</p>
              )}
            </div>
            <i className="fas fa-brain absolute -right-4 -bottom-4 text-7xl text-white/5 pointer-events-none"></i>
          </div>

          {/* Active Borrows */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <i className="fas fa-clock text-blue-500"></i>
              Currently Reading
            </h2>
            <div className="space-y-4">
              {activeBorrows.length === 0 && <p className="text-sm text-slate-400 italic">No active borrowings.</p>}
              {activeBorrows.map(rec => (
                <div key={rec.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="font-bold text-slate-800 text-sm">{rec.bookTitle}</p>
                  <div className="flex justify-between mt-2">
                    <div className="text-[10px] text-slate-500">
                      <p>Borrowed: {rec.borrowDate}</p>
                      <p className="text-orange-600 font-medium">Due: {rec.dueDate}</p>
                    </div>
                    <button 
                      onClick={() => onReturn(rec.id)}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
