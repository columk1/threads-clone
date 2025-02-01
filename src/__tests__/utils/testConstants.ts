export const TEST_USERS = [
  {
    name: 'Test User 1',
    email: 'test1@example.com',
    username: 'testuser1',
    emailVerified: 1,
    password: 'password123',
  },
  {
    name: 'Test User 2',
    email: 'test2@example.com',
    username: 'testuser2',
    emailVerified: 1,
    password: 'password123',
  },
] as const

// For easier access in tests
export const USER_1 = TEST_USERS[0]
export const USER_2 = TEST_USERS[1]
