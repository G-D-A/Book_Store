import assert from 'node:assert/strict';
import test from 'node:test';

import { Book } from './book.model.js';
import { User } from './user.model.js';

test('User applies defaults and normalizes the email address', async () => {
  const user = new User({
    name: '  Alice  ',
    email: '  ALICE@EXAMPLE.COM  ',
    password: 'password123',
  });

  await user.validate();
  assert.equal(user.name, 'Alice');
  assert.equal(user.email, 'alice@example.com');
  assert.equal(user.role, 'user');
});

test('User rejects invalid email addresses and roles', async () => {
  const user = new User({
    name: 'Alice',
    email: 'not-an-email',
    password: 'password123',
    role: 'moderator',
  });

  await assert.rejects(user.validate(), (error: { errors?: Record<string, unknown> }) => {
    assert.ok(error.errors?.email);
    assert.ok(error.errors?.role);
    return true;
  });
});

test('Book requires a positive whole page count', async () => {
  const book = new Book({
    name: 'Clean Code',
    author: 'Robert C. Martin',
    pageCount: 3.5,
  });

  await assert.rejects(book.validate(), (error: { errors?: Record<string, unknown> }) => {
    assert.ok(error.errors?.pageCount);
    return true;
  });
});
