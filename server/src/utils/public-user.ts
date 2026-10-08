import type { UserRole } from '../models/user.model.js';

type UserForResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export function serializeUser(user: UserForResponse) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}
