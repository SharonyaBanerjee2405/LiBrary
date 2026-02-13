
import { AppState, Role, Book, User, BorrowRecord } from './types';

const DB_KEY = 'librarypro_db';

const INITIAL_BOOKS: Book[] = [
  { id: 'b1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', category: 'Classic', availableCopies: 5, totalCopies: 5, description: 'A story of wealth, love, and the American Dream.' },
  { id: 'b2', title: 'Introduction to Algorithms', author: 'Cormen et al.', isbn: '9780262033848', category: 'Computer Science', availableCopies: 2, totalCopies: 3, description: 'The comprehensive guide to algorithms.' },
  { id: 'b3', title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', category: 'Computer Science', availableCopies: 4, totalCopies: 4, description: 'A handbook of agile software craftsmanship.' },
  { id: 'b4', title: 'Brief Answers to the Big Questions', author: 'Stephen Hawking', isbn: '9781473695986', category: 'Science', availableCopies: 3, totalCopies: 3, description: 'Exploring the universe and our place in it.' },
];

const INITIAL_USERS: User[] = [
  { id: 'S101', name: 'Arjun Sharma', email: 'arjun@college.edu', role: Role.STUDENT, borrowedBooks: [], totalFines: 0 },
  { id: 'S102', name: 'Priya Patel', email: 'priya@college.edu', role: Role.STUDENT, borrowedBooks: [], totalFines: 150 },
  { id: 'L001', name: 'Dr. Anita Desai', email: 'anita.lib@college.edu', role: Role.LIBRARIAN, borrowedBooks: [], totalFines: 0 },
];

export const getDB = (): AppState => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    const initialState: AppState = {
      currentUser: null,
      books: INITIAL_BOOKS,
      borrowRecords: [],
      users: INITIAL_USERS
    };
    saveDB(initialState);
    return initialState;
  }
  return JSON.parse(data);
};

export const saveDB = (state: AppState) => {
  localStorage.setItem(DB_KEY, JSON.stringify(state));
};

export const resetDB = () => {
  localStorage.removeItem(DB_KEY);
  window.location.reload();
};
