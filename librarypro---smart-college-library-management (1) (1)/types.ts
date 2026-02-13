
export enum Role {
  STUDENT = 'STUDENT',
  LIBRARIAN = 'LIBRARIAN'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  availableCopies: number;
  totalCopies: number;
  description: string;
  coverImage?: string;
}

export interface BorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  isPaid: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  borrowedBooks: string[]; // BorrowRecord IDs
  totalFines: number;
}

export interface AppState {
  currentUser: User | null;
  books: Book[];
  borrowRecords: BorrowRecord[];
  users: User[];
}
