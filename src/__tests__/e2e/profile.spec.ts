import { expect, test } from '@playwright/test'

import { generateRandomString } from '../../utils/string/generateRandomString'

test.describe('Profile Management', () => {
  const testEmail = `test.${generateRandomString(8)}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'
  const testUsername = `testuser_${generateRandomString(6)}`

  test.beforeEach(async ({ page }) => {
    // Sign up and log in before each test
    await page.goto('/signup')
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill(testPassword)
    await page.getByLabel(/full name/i).fill(testName)
    await page.getByLabel(/username/i).fill(testUsername)
    await page.getByRole('button', { name: /Sign up/i }).click()
  })

  test.describe('Profile Viewing', () => {
    test('should display user profile information', async ({ page }) => {
      // Navigate to profile page
      await page.goto(`/${testUsername}`)

      // Verify profile information is displayed
      await expect(page.getByText(testName)).toBeVisible()
      await expect(page.getByText(testUsername)).toBeVisible()
    })

    test('should display user posts on profile', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByRole('button', { name: /create post/i }).click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Navigate to profile and verify post is visible
      await page.goto(`/${testUsername}`)

      await expect(page.getByText(postContent)).toBeVisible()
    })
  })

  test.describe('Profile Editing', () => {
    test('should update profile information', async ({ page }) => {
      // Navigate to profile edit page
      await page.goto(`/${testUsername}/edit`)

      // Update profile information
      const newName = `Updated Name ${generateRandomString(4)}`
      const newBio = `Test bio ${generateRandomString(8)}`

      await page.getByLabel(/name/i).fill(newName)
      await page.getByLabel(/bio/i).fill(newBio)

      // Save changes
      await page.getByRole('button', { name: /save/i }).click()

      // Verify changes are reflected
      await expect(page.getByText(newName)).toBeVisible()
      await expect(page.getByText(newBio)).toBeVisible()
    })

    test('should handle profile update validation', async ({ page }) => {
      await page.goto(`/${testUsername}/edit`)

      // Try to save with empty required fields
      await page.getByLabel(/name/i).fill('')
      await page.getByRole('button', { name: /save/i }).click()

      // Verify validation error
      await expect(page.getByText(/name is required/i)).toBeVisible()
    })
  })

  test.describe('Following Management', () => {
    test('should follow and unfollow users', async ({ browser }) => {
      // Create two browser contexts for two different users
      const userContext = await browser.newContext()
      const otherUserContext = await browser.newContext()

      const userPage = await userContext.newPage()
      const otherUserPage = await otherUserContext.newPage()

      // Create second test user
      const otherUsername = `other_${generateRandomString(6)}`
      await otherUserPage.goto('/signup')
      await otherUserPage.getByLabel(/email/i).fill(`other.${generateRandomString(8)}@example.com`)
      await otherUserPage.getByLabel(/password/i).fill(testPassword)
      await otherUserPage.getByLabel(/full name/i).fill('Other User')
      await otherUserPage.getByLabel(/username/i).fill(otherUsername)
      await otherUserPage.getByRole('button', { name: /Sign up/i }).click()

      // First user follows second user
      await userPage.goto(`/${otherUsername}`)
      await userPage.getByRole('button', { name: /follow/i }).click()

      // Verify following status
      await expect(userPage.getByRole('button', { name: /following/i })).toBeVisible()

      // Unfollow
      await userPage.getByRole('button', { name: /following/i }).click()
      await userPage.getByRole('button', { name: /unfollow/i }).click()

      // Verify follow button is back
      await expect(userPage.getByRole('button', { name: /follow/i })).toBeVisible()
    })

    test('should display followers and following counts', async ({ browser }) => {
      const userContext = await browser.newContext()
      const otherUserContext = await browser.newContext()

      const userPage = await userContext.newPage()
      const otherUserPage = await otherUserContext.newPage()

      // Create second test user
      const otherUsername = `other_${generateRandomString(6)}`
      await otherUserPage.goto('/signup')
      await otherUserPage.getByLabel(/email/i).fill(`other.${generateRandomString(8)}@example.com`)
      await otherUserPage.getByLabel(/password/i).fill(testPassword)
      await otherUserPage.getByLabel(/full name/i).fill('Other User')
      await otherUserPage.getByLabel(/username/i).fill(otherUsername)
      await otherUserPage.getByRole('button', { name: /Sign up/i }).click()

      // First user follows second user
      await userPage.goto(`/${otherUsername}`)
      await userPage.getByRole('button', { name: /follow/i }).click()

      // Verify follower count on second user's profile
      await otherUserPage.goto(`/${otherUsername}`)

      await expect(otherUserPage.getByText('1 Follower')).toBeVisible()

      // Verify following count on first user's profile
      await userPage.goto(`/${testUsername}`)

      await expect(userPage.getByText('1 Following')).toBeVisible()
    })
  })
})
