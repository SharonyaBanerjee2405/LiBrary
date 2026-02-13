
import React, { useState, useEffect, useCallback } from 'react';
import { AppState, User, Role, Book, BorrowRecord } from './types';
import { getDB, saveDB, resetDB } from './db';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getDB());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    saveDB(state);
  }, [state]);

  const handleLogin = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    if (user) {
      setState(prev => ({ ...prev, currentUser: user }));
    } else {
      alert("User ID not found. Use S101, S102, or L001.");
    }
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

  const borrowBook = (bookId: string) => {
    if (!state.currentUser) return;

    const book = state.books.find(b => b.id === bookId);
    if (!book || book.availableCopies <= 0) {
      alert("Book not available.");
      return;
    }

    const newRecord: BorrowRecord = {
      id: `rec_${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      studentId: state.currentUser.id,
      borrowDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fineAmount: 0,
      isPaid: false
    };

    const updatedBooks = state.books.map(b => 
      b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b
    );

    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser?.id 
        ? { ...u, borrowedBooks: [...u.borrowedBooks, newRecord.id] } 
        : u
    );

    setState(prev => ({
      ...prev,
      books: updatedBooks,
      borrowRecords: [...prev.borrowRecords, newRecord],
      users: updatedUsers,
      currentUser: updatedUsers.find(u => u.id === state.currentUser?.id) || null
    }));

    alert(`Successfully borrowed ${book.title}!`);
  };

  const returnBook = (recordId: string) => {
    const record = state.borrowRecords.find(r => r.id === recordId);
    if (!record) return;

    const updatedRecords = state.borrowRecords.map(r => 
      r.id === recordId ? { ...r, returnDate: new Date().toISOString().split('T')[0] } : r
    );

    const updatedBooks = state.books.map(b => 
      b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b
    );

    setState(prev => ({
      ...prev,
      borrowRecords: updatedRecords,
      books: updatedBooks
    }));
  };

  const payFine = (amount: number) => {
    if (!state.currentUser) return;
    
    const updatedUsers = state.users.map(u => 
      u.id === state.currentUser?.id ? { ...u, totalFines: Math.max(0, u.totalFines - amount) } : u
    );

    setState(prev => ({
      ...prev,
      users: updatedUsers,
      currentUser: updatedUsers.find(u => u.id === state.currentUser?.id) || null
    }));
    
    alert(`Payment of ₹${amount} successful!`);
  };

  const updateBook = (updatedBook: Book) => {
    const exists = state.books.some(b => b.id === updatedBook.id);
    const newBooks = exists 
      ? state.books.map(b => b.id === updatedBook.id ? updatedBook : b)
      : [...state.books, updatedBook];

    setState(prev => ({ ...prev, books: newBooks }));
  };

  const deleteBook = (bookId: string) => {
    setState(prev => ({ ...prev, books: prev.books.filter(b => b.id !== bookId) }));
  };

  if (!state.currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={state.currentUser} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {state.currentUser.role === Role.STUDENT ? (
          <StudentDashboard 
            user={state.currentUser} 
            books={state.books} 
            records={state.borrowRecords.filter(r => r.studentId === state.currentUser?.id)}
            onBorrow={borrowBook}
            onReturn={returnBook}
            onPayFine={payFine}
          />
        ) : (
          <LibrarianDashboard 
            books={state.books} 
            users={state.users}
            records={state.borrowRecords}
            onUpdateBook={updateBook}
            onDeleteBook={deleteBook}
            onReset={resetDB}
          />
        )}
      </main>
      <footer className="bg-slate-800 text-slate-400 py-6 text-center text-sm">
        <p>&copy; 2024 LibraryPro. All rights reserved.</p>
        <p className="mt-1">Built with Gemini AI & React.</p>
      </footer>
    </div>
  );
};

export default App;
