/* eslint-disable playwright/no-skipped-test */
import { expect, test } from '@playwright/test'

import { generateRandomString } from '../../utils/string/generateRandomString'

test.describe.skip('Post Management', () => {
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

  test.describe('Post Creation', () => {
    test('should create a new text post', async ({ page }) => {
      await page.goto('/')

      // Click create post button
      await page.getByRole('button', { name: /create post/i }).click()

      // Fill post content
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)

      // Submit post
      await page.getByRole('button', { name: /post/i }).click()

      // Verify post appears in feed
      await expect(page.getByText(postContent)).toBeVisible()
    })

    test('should handle post creation validation', async ({ page }) => {
      await page.goto('/')

      // Try to create empty post
      await page.getByRole('button', { name: /create post/i }).click()
      await page.getByRole('button', { name: /post/i }).click()

      // Should show validation error
      await expect(page.getByText(/post content is required/i)).toBeVisible()
    })
  })

  test.describe('Post Interactions', () => {
    test('should like and unlike a post', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByRole('button', { name: /create post/i }).click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Like the post
      await page.getByRole('button', { name: /like/i }).first().click()

      // Verify like count increased
      await expect(page.getByText('1')).toBeVisible()

      // Unlike the post
      await page.getByRole('button', { name: /like/i }).first().click()

      // Verify like count decreased
      await expect(page.getByText('0')).toBeVisible()
    })

    test('should add and view comments', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByRole('button', { name: /create post/i }).click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Add a comment
      const commentText = `Test comment ${generateRandomString(8)}`
      await page
        .getByRole('button', { name: /comment/i })
        .first()
        .click()
      await page.getByRole('textbox').fill(commentText)
      await page.getByRole('button', { name: /post/i }).click()

      // Verify comment appears
      await expect(page.getByText(commentText)).toBeVisible()
    })
  })

  test.describe('Post Management', () => {
    test('should edit a post', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByRole('button', { name: /create post/i }).click()
      const originalContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(originalContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Edit the post
      await page.getByRole('button', { name: /more/i }).first().click()
      await page.getByRole('menuitem', { name: /edit/i }).click()

      const editedContent = `Edited post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(editedContent)
      await page.getByRole('button', { name: /save/i }).click()

      // Verify edited content
      await expect(page.getByText(editedContent)).toBeVisible()
      await expect(page.getByText(originalContent)).toBeHidden()
    })

    test('should delete a post', async ({ page }) => {
      // First create a post
      await page.goto('/')
      await page.getByRole('button', { name: /create post/i }).click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByRole('textbox').fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      // Delete the post
      await page.getByRole('button', { name: /more/i }).first().click()
      await page.getByRole('menuitem', { name: /delete/i }).click()
      await page.getByRole('button', { name: /confirm/i }).click()

      // Verify post is removed
      await expect(page.getByText(postContent)).toBeHidden()
    })
  })
})
