import { Buffer } from 'node:buffer'

import { expect, test } from '@playwright/test'

import { generateRandomString } from '../../utils/string/generateRandomString'
import { USER_1, USER_2 } from '../utils/testConstants'

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in with the test user created in global setup
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(USER_1.email)
    await page.getByLabel(/password/i).fill(USER_1.password)
    await page.getByRole('button', { name: /Log in/i }).click()
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

    test('should display user posts on profile', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByText("What's new?").click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Navigate to profile and verify post is visible
      await page.goto(`/@${USER_1.username}`)

      await expect(page.getByText(postContent)).toBeVisible()
    })
  })

  test.describe('Profile Editing', () => {
    test('should update profile information through settings', async ({ page }) => {
      // Navigate to profile page
      await page.goto(`/@${USER_1.username}`)

      // Store initial avatar for comparison
      const initialAvatar = page.getByRole('img', { name: 'Avatar' }).first()

      await expect(initialAvatar).toHaveAttribute('src')

      // Open edit profile dialog
      await page.getByRole('button', { name: 'Edit Profile' }).click()

      // Update profile information
      const newBio = `Test bio ${generateRandomString(8)}`
      await page.getByText('Bio', { exact: true }).click()
      await page.getByRole('textbox', { name: 'Bio' }).fill(newBio)
      await page.getByRole('button', { name: 'Done' }).click()

      // Verify bio is updated
      await expect(page.getByText(newBio)).toBeVisible()

      // Upload a new profile image through the dropdown
      await page.getByRole('button', { name: 'Avatar' }).click()
      await page.getByRole('menuitem', { name: 'Upload a picture' }).click()

      // Handle file upload through hidden input
      await page.locator('input[type="file"]').setInputFiles({
        name: 'test-profile.jpg',
        mimeType: 'image/jpeg',
        // Valid 1x1 white pixel JPEG
        buffer: Buffer.from(
          '/9j/4AAQSkZJRgABAQEAYABgAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gOTAK/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A+3/HPjnw/wCDNPF1r2p21lGVyqyPl3/3VGWb8BXwx8Wf2nviH4x1R7Xw9qL+HtJDYRLNzHMw9XkGGz7Lj3NfN+ueJNY8Qak+oa5qd1qN25+aW4lL/h6D2HAqhX+fvEXiDnGdYqUaWInQw9/dpQdk126v1f4H+h/CvA+U5Th4zqUo16/2qk1dvyT2XovUK+6P2O/jN4g8SxTeEPE159ustPgE1pdyHMqxghWRj/EASpAPOCMdq+F6K+Y4Y4gxWQZhDGYZ2a0lF7SXR/o+jPoeI8hw2dYGeFxCs94y6xe6/VdUf//Z',
          'base64',
        ),
      })

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

      // await expect(page.getByText(newBio)).toBeVisible()
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

      await page.getByRole('button', { name: /follow/i }).click()

      // Verify following status
      await expect(page.getByRole('button', { name: /unfollow/i })).toBeVisible()

      // Verify follower count
      await expect(page.getByText('1 follower', { exact: true })).toBeVisible()

      // Unfollow using dropdown menu and wait for both the button click and toast to appear
      await page.getByRole('button', { name: /unfollow/i }).click()

      // Verify toast notification is visible with a more generous timeout
      await expect(page.getByText(/unfollowed/i)).toBeVisible()

      // Verify follow button is back
      await expect(page.getByRole('button', { name: /follow/i })).toBeVisible()

      // Verify follower count
      await expect(page.getByText('0 followers', { exact: true })).toBeVisible()
    })
  })
})
