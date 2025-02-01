import { expect, test } from '@playwright/test'

import { generateRandomString } from '../../utils/string/generateRandomString'
import { USER_1 } from '../utils/testConstants'

test.describe('Authentication Flows', () => {
  const testEmail = `test.${generateRandomString(8)}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'
  const testUsername = `testuser_${generateRandomString(6)}`

  test.describe('Signup Flow', () => {
    test('should show validation errors after input', async ({ page }) => {
      await page.goto('/signup')

      // Enter and clear email to trigger validation
      await page.getByLabel(/email/i).fill('test')
      await page.getByLabel(/email/i).clear()
      await page.getByLabel(/password/i).focus() // unfocus email

      await expect(page.getByText('This field is required.')).toBeVisible()

      // Enter invalid email to trigger format validation
      await page.getByLabel(/email/i).fill('invalid-email')
      await page.getByLabel(/password/i).focus() // unfocus email

      await expect(page.getByText('Enter a valid email.')).toBeVisible()

      // Enter and clear password
      await page.getByLabel(/password/i).fill('test')
      await page.getByLabel(/password/i).clear()
      await page.getByLabel(/email/i).focus() // unfocus password

      await expect(page.getByText('This field is required.')).toBeVisible()

      // Enter short password
      await page.getByLabel(/password/i).fill('short')
      await page.getByLabel(/email/i).focus() // unfocus password

      await expect(page.getByText('Create a password at least 6 characters long.')).toBeVisible()

      // Verify signup button remains disabled
      await expect(page.getByRole('button', { name: /Sign up/i })).toBeDisabled()
    })

    test('should validate unique email and username', async ({ page }) => {
      await page.goto('/signup')

      // Test duplicate email validation
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).focus() // unfocus email

      await expect(page.getByText('Another account is using the same email.')).toBeVisible()

      // Test duplicate username validation
      await page.getByLabel(/username/i).fill(USER_1.username)
      await page.getByLabel(/email/i).focus() // unfocus username

      await expect(page.getByText('A user with that username already exists.')).toBeVisible()

      // Verify signup button is disabled
      await expect(page.getByRole('button', { name: /Sign up/i })).toBeDisabled()
    })

    test('should successfully create a new account', async ({ page }) => {
      await page.goto('/signup')

      // Fill the signup form with valid data
      await page.getByLabel(/email/i).fill(testEmail)
      await page.getByLabel(/password/i).fill(testPassword)
      await page.getByLabel(/full name/i).fill(testName)
      await page.getByLabel(/username/i).fill(testUsername)

      // Move focus to trigger validation
      await page.getByLabel(/email/i).focus()

      // Verify signup button becomes enabled
      await expect(page.getByRole('button', { name: /Sign up/i })).toBeEnabled()

      // Submit form
      await page.getByRole('button', { name: /Sign up/i }).click()

      // Should redirect to email verification page
      await expect(page).toHaveURL('/verify-email')
    })
  })

  test.describe('Login Flow', () => {
    test('should show validation error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      // Try invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /Log in/i }).click()

      // Check for error message
      await expect(page.getByText(/incorrect password/i)).toBeVisible()
    })

    test('should successfully log in with valid credentials', async ({ page }) => {
      await page.goto('/login')

      // Use credentials from test user
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: /Log in/i }).click()

      // Should redirect to home page since email is verified
      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Logout Flow', () => {
    test('should successfully log out', async ({ page }) => {
      // First log in
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: /Log in/i }).click()

      // Click the more button in the desktop sidebar to open dropdown
      const moreButton = page.getByRole('button', { name: 'More' }).first()

      await expect(moreButton).toBeVisible()

      // Click the button
      await moreButton.click()

      // Click the logout button in the dropdown menu
      await page.getByRole('menuitem', { name: /Log out/i }).click()

      // Should redirect to login page
      await expect(page).toHaveURL('/login')

      await page.goto('/')

      await expect(page.getByRole('link', { name: /Log in/i })).toBeVisible()
    })
  })
})
