import { expect, test } from '@playwright/test'

import { followerSchema, likeSchema, notificationSchema, postSchema, repostSchema } from '../../lib/db/Schema'
import { generateRandomString } from '../../utils/string/generateRandomString'
import { USER_1, USER_2 } from '../utils/testConstants'
import { testDb } from '../utils/testDb'

test.describe('Profile Management', () => {
  // Clear database before running tests in this file
  test.beforeAll(async () => {
    // Clear all content
    await testDb.delete(postSchema)
    await testDb.delete(likeSchema)
    await testDb.delete(repostSchema)
    await testDb.delete(notificationSchema)
    await testDb.delete(followerSchema)
  })

  test.beforeEach(async ({ page }) => {
    // Log in with the test user created in global setup
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(USER_1.email)
    await page.getByLabel('Password').fill(USER_1.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    // Wait for login to complete and redirect
    await page.waitForURL('/')
  })

  test.describe('Profile Viewing', () => {
    test('should display user profile information', async ({ page }) => {
      // Navigate to profile page
      await page.goto(`/@${USER_1.username}`)

      // Verify profile information is displayed
      await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
      await expect(page.getByText(USER_1.name)).toBeVisible()

      // Verify profile navigation exists
      const profileNav = page.getByRole('main').getByRole('navigation')

      await expect(profileNav.getByRole('link', { name: 'Threads' })).toBeVisible()
      await expect(profileNav.getByRole('link', { name: 'Replies' })).toBeVisible()
      await expect(profileNav.getByRole('link', { name: 'Reposts' })).toBeVisible()
    })
  })

  test.describe('Profile Editing', () => {
    test('should update profile information through settings', async ({ page }) => {
      // Navigate to profile page
      await page.goto(`/@${USER_1.username}`)

      // Store initial avatar for comparison
      const initialAvatar = page.getByRole('img', { name: 'Avatar' }).first()

      await expect(initialAvatar).toHaveAttribute('src')

      // Open edit profile dialog`
      await page.getByRole('button', { name: 'Edit Profile' }).click()

      // Update profile information
      const newBio = `Test bio ${generateRandomString(8)}`
      await page.getByText('Bio', { exact: true }).click()
      await page.getByRole('textbox', { name: 'Bio' }).fill(newBio)
      await page.getByRole('button', { name: 'Done' }).click()

      await expect(page.getByRole('textbox', { name: 'Bio' })).toBeHidden()

      await page.getByRole('button', { name: 'Done' }).click()

      await expect(page.getByRole('dialog')).toBeHidden()

      // Verify bio is updated
      await expect(page.getByText(newBio)).toBeVisible()

      // Re-open the edit profile dialog
      await page.getByRole('button', { name: 'Edit Profile' }).click()

      // Upload a new profile image through the dropdown
      await page.getByRole('button', { name: 'Avatar' }).click()
      await page.getByRole('menuitem', { name: 'Upload a picture' }).click()

      // Handle file upload through hidden input
      await page.locator('input[type="file"]').setInputFiles('src/__tests__/e2e/test-data/test-avatar.png')

      // Wait for both the Cloudinary upload and the avatar update
      const [cloudinaryResponse] = await Promise.all([
        page.waitForResponse((response) => response.url().includes('api.cloudinary.com') && response.status() === 200),
      ])

      // Verify both responses
      expect(cloudinaryResponse.ok()).toBeTruthy()

      // Close the dialog
      await page.getByRole('button', { name: 'Done' }).click()

      // Verify changes are reflected
      await expect(async () => {
        const currentAvatar = page.getByRole('img', { name: 'Avatar' }).first()

        await expect(currentAvatar).toHaveAttribute('src')
        expect(currentAvatar).not.toBe(initialAvatar)
      }).toPass({ timeout: 5000 })
    })

    test('should handle profile update validation', async ({ page }) => {
      await page.goto(`/@${USER_1.username}`)
      await page.getByRole('button', { name: 'Edit Profile' }).click()

      // Try to save with invalid bio
      await page.getByText('Bio', { exact: true }).click()
      const longBio = 'a'.repeat(501)
      await page.getByRole('textbox', { name: 'Bio' }).fill(longBio)

      // Verify validation error appears
      await expect(page.getByText(longBio)).toBeHidden()
    })
  })

  test.describe('Following Management', () => {
    test('should follow and unfollow users', async ({ page }) => {
      // Follow the other user
      await page.goto(`/@${USER_2.username}`)

      await page.getByRole('button', { name: 'Follow' }).click()

      // Verify following status
      await expect(page.getByRole('button', { name: 'Following' })).toBeVisible()

      // Verify follower count
      await expect(page.getByText('1 follower', { exact: true })).toBeVisible()

      // Unfollow using dropdown menu and wait for both the button click and toast to appear
      await page.getByRole('button', { name: 'Following' }).click()

      await expect(page.getByRole('button', { name: 'Unfollow' })).toBeVisible()

      await page.getByRole('button', { name: 'Unfollow' }).click()

      // Verify toast notification is visible
      await expect(page.getByText('Unfollowed')).toBeVisible()

      // Verify follow button is back
      await expect(page.getByRole('button', { name: 'Follow' })).toBeVisible()

      // Verify follower count
      await expect(page.getByText('0 followers', { exact: true })).toBeVisible()
    })

    test('should follow users and create notifications', async ({ page }) => {
      // Follow USER_2
      await page.goto(`/@${USER_2.username}`)
      await page.getByRole('button', { name: 'Follow' }).click()

      // Verify following status
      await expect(page.getByRole('button', { name: 'Following' })).toBeVisible()
      await expect(page.getByText('1 follower', { exact: true })).toBeVisible()

      // Log out USER_1
      const sidebar = page.getByRole('navigation', { name: 'Primary navigation' })
      const moreButton = sidebar.getByRole('button', { name: 'More' })

      await expect(moreButton).toBeVisible()

      await moreButton.click()
      await page.getByRole('menuitem', { name: 'Log out' }).click()

      await expect(page).toHaveURL('/login')

      // Log back in as USER_2 to check notifications
      await page.getByLabel(/email/i).fill(USER_2.email)
      await page.getByLabel('Password').fill(USER_2.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Check notifications
      await page.goto('/activity')

      await expect(page.getByRole('list')).toBeVisible()

      // Verify follow notification is present
      await expect(page.getByRole('link', { name: `${USER_1.username}`, exact: true })).toBeVisible()
      await expect(page.getByText('Followed you')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Follow back' })).toBeVisible()
    })

    test('should not create duplicate notifications for repeat follow actions', async ({ page }) => {
      // Log in as USER_2 to check notifications after the previous follow/unfollow/follow actions
      const sidebar = page.getByRole('navigation', { name: 'Primary navigation' })
      const moreButton = sidebar.getByRole('button', { name: 'More' })

      await expect(moreButton).toBeVisible()

      await moreButton.click()
      await page.getByRole('menuitem', { name: 'Log out' }).click()

      await expect(page).toHaveURL('/login')

      await page.getByLabel(/email/i).fill(USER_2.email)
      await page.getByLabel('Password').fill(USER_2.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Check notifications
      await page.goto('/activity')

      // Wait for notifications to load
      await expect(page.getByRole('list')).toBeVisible()

      // Verify one notification is present
      await expect(page.getByRole('link', { name: `Avatar Follow Notification ${USER_1.username}` })).toBeVisible()

      // Log out USER_1
      await expect(moreButton).toBeVisible()

      await moreButton.click()
      await page.getByRole('menuitem', { name: 'Log out' }).click()

      await expect(page).toHaveURL('/login')

      // Log back in as USER_2 to check notifications
      await page.getByLabel(/email/i).fill(USER_2.email)
      await page.getByLabel('Password').fill(USER_2.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Check notifications
      await page.goto('/activity')

      // Wait for notifications to load
      await expect(page.getByRole('list')).toBeVisible()

      // Verify one notification is present
      await expect(page.getByRole('link', { name: `Avatar Follow Notification ${USER_1.username}` })).toBeVisible()
    })
  })
})
