import type { AuthResponse, AuthUser, Book, BookInput, UserInput } from '../types/auth';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

type ApiErrorPayload = {
  message?: string;
};

type RequestOptions = {
  body?: Record<string, unknown>;
  method?: 'DELETE' | 'GET' | 'PATCH' | 'POST';
  token?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, method = 'GET', token } = options;
  const response = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({}))) as ApiErrorPayload & T;

  if (!response.ok) {
    throw new Error(payload.message ?? 'Something went wrong. Please try again.');
  }

  return payload;
}

export function signup(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>('/signup', { method: 'POST', body: input });
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>('/login', { method: 'POST', body: input });
}

export function getBooks(token: string): Promise<{ books: Book[] }> {
  return request('/books', { token });
}

export function getBook(token: string, id: string): Promise<{ book: Book }> {
  return request(`/books/${id}`, { token });
}

export function createBook(token: string, input: BookInput): Promise<{ book: Book }> {
  return request('/books', { method: 'POST', token, body: input });
}

export function updateBook(token: string, id: string, input: BookInput): Promise<{ book: Book }> {
  return request(`/books/${id}`, { method: 'PATCH', token, body: input });
}

export function deleteBook(token: string, id: string): Promise<void> {
  return request(`/books/${id}`, { method: 'DELETE', token });
}

export function getUsers(token: string): Promise<{ users: AuthUser[] }> {
  return request('/users', { token });
}

export function getUser(token: string, id: string): Promise<{ user: AuthUser }> {
  return request(`/users/${id}`, { token });
}

export function createUser(token: string, input: UserInput): Promise<{ user: AuthUser }> {
  return request('/users', { method: 'POST', token, body: input });
}

export function updateUser(token: string, id: string, input: UserInput): Promise<{ user: AuthUser }> {
  const { password, ...userWithoutPassword } = input;
  return request(`/users/${id}`, {
    method: 'PATCH',
    token,
    body: password ? input : userWithoutPassword,
  });
}

export function deleteUser(token: string, id: string): Promise<void> {
  return request(`/users/${id}`, { method: 'DELETE', token });
}
