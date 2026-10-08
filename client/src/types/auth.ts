export type UserRole = 'user' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type Book = {
  _id: string;
  name: string;
  author: string;
  pageCount: number;
};

export type BookInput = Omit<Book, '_id'>;

export type UserInput = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
};
