import { expect, test } from '@playwright/test'

import { generateRandomString } from '../../utils/string/generateRandomString'
import { USER_1 } from '../utils/testConstants'

test.describe('Post Management', () => {
  test.beforeEach(async ({ page }) => {
    // Log in with test user
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(USER_1.email)
    await page.getByLabel(/password/i).fill(USER_1.password)
    await page.getByRole('button', { name: /Log in/i }).click()
    // Wait for login to complete and redirect
    await page.waitForURL('/')
  })

  test.describe('Post Creation', () => {
    test('should create a new text post', async ({ page }) => {
      await page.goto('/')

      // Click create post button (FAB)
      const createButton = page.getByRole('button', { name: 'Create' }).first()

      await expect(createButton).toBeVisible()

      await createButton.click()

      // Fill post content in modal
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByPlaceholder("What's new?").fill(postContent)

      // Submit post
      await page.getByRole('button', { name: /post/i }).click()

      // Verify post appears in feed
      await expect(page.getByText(postContent)).toBeVisible()
    })

    test('should handle post creation validation', async ({ page }) => {
      await page.goto('/')

      // Click create post button
      const createButton = page.getByRole('button', { name: 'Create' }).first()

      await expect(createButton).toBeVisible()

      await createButton.click()

      // Post button should be disabled
      const textInput = page.getByPlaceholder("What's new?")
      const postButton = page.getByRole('button', { name: /post/i })

      await expect(postButton).toBeDisabled()

      await textInput.fill('a'.repeat(500))

      await expect(page.getByText('0', { exact: true })).toBeVisible()

      await expect(postButton).toBeVisible()

      await textInput.fill('a'.repeat(501))

      await expect(page.getByText('-1', { exact: true })).toBeVisible()

      await expect(page.getByRole('button', { name: /post/i })).toBeDisabled()
    })
  })

  test.describe('Post Interactions', () => {
    const postContent = `Test post ${generateRandomString(8)}`

    test.beforeEach(async ({ page }) => {
      await page.goto('/')

      // Create post
      const createButton = page.getByRole('button', { name: 'Create' }).first()
      await createButton.click()
      await page.getByPlaceholder("What's new?").fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      await expect(page.getByText(postContent).first()).toBeVisible()
    })

    test('should like and unlike a post', async ({ page }) => {
      await page.goto('/')

      // Like the post
      const postElement = page.getByText(postContent).first()
      const likeButton = postElement.locator('xpath=..').getByRole('button', { name: 'Like' })

      await expect(likeButton).toBeVisible()

      await likeButton.click()

      // Verify like count increased
      await expect(likeButton).toContainText('1')

      // Unlike the post
      await likeButton.click()

      // Verify like count decreased
      await expect(likeButton).not.toContainText('1')

      // eslint-disable-next-line playwright/no-networkidle
      await page.waitForLoadState('networkidle')
    })

    test('should create and view a reply', async ({ page }) => {
      await page.goto('/')

      // Find the specific post we want to reply to
      const postElement = page.getByText(postContent).first()

      await expect(postElement).toBeVisible()

      // Click reply on that specific post
      const replyButton = postElement.locator('xpath=..').getByRole('button', { name: /reply/i })

      await expect(replyButton).toBeVisible()

      await replyButton.click()

      // Add a comment
      const commentText = `Test comment ${generateRandomString(8)}`
      await page.getByPlaceholder(`Reply to ${USER_1.username}...`).fill(commentText)
      await page.getByRole('button', { name: /post/i }).click()

      await expect(page.getByText(commentText)).toBeVisible()

      // verify replyCount increased
      await expect(replyButton).toContainText('1')

      // Click the post text to view replies
      await postElement.click()

      await page.waitForURL(`/@${USER_1.username}/post/**`)

      // Verify comment appears
      await expect(page.getByText(commentText)).toBeVisible()
    })

    test('should repost and unrepost a post', async ({ page }) => {
      await page.goto('/')

      // Find and repost the specific post
      const postElement = page.getByText(postContent).first()
      const repostButton = postElement.locator('xpath=..').getByRole('button', { name: /repost/i })

      await expect(repostButton).toBeVisible()

      await repostButton.click()

      // Verify repost count increased
      await expect(repostButton).toContainText('1')

      // Go to profile reposts tab to verify repost appears there
      await page.goto(`/@${USER_1.username}/reposts`)

      await expect(page.getByText(postContent)).toBeVisible()

      // Unrepost from profile
      const profileRepostButton = page
        .getByText(postContent)
        .first()
        .locator('xpath=..')
        .getByRole('button', { name: /repost/i })
      await profileRepostButton.click()

      // Verify repost is removed from profile
      await expect(page.getByText(postContent)).toBeHidden()
    })
  })

  test.describe('Post Deletion', () => {
    test('should delete a post', async ({ page }) => {
      // First create a post
      await page.goto('/')
      const createButton = page.getByRole('button', { name: 'Create' }).first()
      await createButton.click()
      const postContent = `Test post ${generateRandomString(8)}`
      await page.getByPlaceholder("What's new?").fill(postContent)
      await page.getByRole('button', { name: /post/i }).click()

      await expect(page.getByText(postContent)).toBeVisible()

      // Delete the post
      await page.getByText(postContent).locator('xpath=..').getByRole('button', { name: /more/i }).click()
      await page.getByRole('menuitem', { name: /delete/i }).click()
      await page.getByRole('button', { name: /delete/i }).click()

      // Verify post is removed
      await expect(page.getByText(postContent)).toBeHidden()
    })
  })
})
