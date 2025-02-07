import { expect, test } from '@playwright/test'

import { followerSchema, likeSchema, notificationSchema, postSchema, repostSchema } from '../../lib/db/Schema'
import { generateRandomString } from '../../utils/string/generateRandomString'
import { USER_1, USER_2 } from '../utils/testConstants'
import { testDb } from '../utils/testDb'

// Test content constants
const TEST_POST_CONTENT = 'This is a test post'
const TEST_REPLY_CONTENT = 'This is a test reply'
const TEST_INTERACTION_POST = 'Test post for interactions'
const TEST_NOTIFICATION_POST = 'Test post for notifications'

// Clear database before running tests in this file
test.beforeAll(async () => {
  // Clear all content
  await testDb.delete(postSchema)
  await testDb.delete(likeSchema)
  await testDb.delete(repostSchema)
  await testDb.delete(notificationSchema)
  await testDb.delete(followerSchema)
})

test.describe('Post Management', () => {
  test.describe('Post Creation', () => {
    test.beforeEach(async ({ page }) => {
      // Log in with test user
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      // Wait for login to complete and redirect
      await page.waitForURL('/')
    })

    test('should create a new text post', async ({ page }) => {
      await page.goto('/')

      const createButton = page.getByRole('button', { name: 'Create' }).first()

      await expect(createButton).toBeVisible()

      // Click create post button (FAB)
      await createButton.click()

      // Fill post content in modal
      await page.getByPlaceholder("What's new?").fill(TEST_POST_CONTENT)

      // Submit post
      await page.getByRole('button', { name: 'Post' }).click()

      // Verify post appears in feed
      await expect(page.getByText(TEST_POST_CONTENT)).toBeVisible()
    })

    test('should handle post creation validation', async ({ page }) => {
      await page.goto('/')

      // Click create post button
      await page.getByRole('button', { name: 'Create' }).first().click()

      // Post button should be disabled
      const textInput = page.getByPlaceholder("What's new?")
      const postButton = page.getByRole('button', { name: 'Post' })

      await expect(postButton).toBeDisabled()

      await textInput.fill('a'.repeat(500))

      await expect(page.getByText('0', { exact: true })).toBeVisible()

      await expect(postButton).toBeVisible()

      await textInput.fill('a'.repeat(501))

      await expect(page.getByText('-1', { exact: true })).toBeVisible()

      await expect(page.getByRole('button', { name: 'Post' })).toBeDisabled()
    })
  })

  test.describe('Post Interactions', () => {
    const sharedPostContent = TEST_INTERACTION_POST

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Log in with test user
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Create post
      await page.goto('/')
      await page.getByRole('button', { name: 'Create' }).first().click()
      await page.getByPlaceholder("What's new?").fill(sharedPostContent)
      await page.getByRole('button', { name: 'Post' }).click()

      // Wait for the modal to close and post to appear in feed
      await expect(page.getByRole('dialog')).toBeHidden()

      // Now find and verify the post
      await expect(page.getByRole('article', { name: `${USER_1.username}` })).toBeVisible()

      await context.close()
    })

    test.afterAll(async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Log in with test user to delete the post
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Delete the interaction post
      await page.goto('/')
      const postToDelete = page.getByRole('article', { name: `${USER_1.username}` })

      await expect(postToDelete).toBeVisible()
      await expect(postToDelete).toContainText(sharedPostContent)

      await postToDelete.getByRole('button', { name: 'More' }).click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Delete' }).click()

      // Verify the post is actually deleted
      await expect(postToDelete).toBeHidden()
      await expect(page.getByText(sharedPostContent)).toBeHidden()

      await context.close()
    })

    test.beforeEach(async ({ page }) => {
      // Log in as USER_2 to test interactions
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_2.email)
      await page.getByLabel(/password/i).fill(USER_2.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')
    })

    test('should like and unlike a post', async ({ page }) => {
      // Like the post

      const postElement = page.getByRole('article', { name: `${USER_1.username}` })

      await expect(postElement).toContainText(sharedPostContent)

      await expect(postElement).toBeVisible()

      const likeButton = postElement.getByRole('button', { name: 'Like' })

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
      const postElement = page.getByRole('article', { name: `${USER_1.username}` })

      await expect(postElement).toContainText(sharedPostContent)

      await expect(postElement).toBeVisible()

      // Click reply on that specific post
      const replyButton = postElement.getByRole('button', { name: 'Reply' })

      await expect(replyButton).toBeVisible()

      await replyButton.click()

      // Add a comment
      await page.getByPlaceholder(`Reply to ${USER_1.username}...`).fill(TEST_REPLY_CONTENT)
      await page.getByRole('button', { name: 'Post' }).click()

      // verify replyCount increased
      await expect(replyButton).toContainText('1')

      // Click the post text to view replies
      await postElement.click()
      await page.waitForURL(`/@${USER_1.username}/post/**`)

      // Verify comment appears
      await expect(page.getByText(TEST_REPLY_CONTENT)).toBeVisible()
    })

    test('should repost and unrepost a post', async ({ page }) => {
      await page.goto('/')

      // Find and repost the specific post
      const postElement = page.getByRole('article', { name: `${USER_1.username}` })

      await expect(postElement).toContainText(sharedPostContent)

      const repostButton = postElement.getByRole('button', { name: 'Repost' })

      await expect(repostButton).toBeVisible()

      await repostButton.click()

      // Verify repost count increased
      await expect(repostButton).toContainText('1')

      // Go to profile reposts tab to verify repost appears there
      await page.goto(`/@${USER_2.username}/reposts`)

      await expect(page.getByText(sharedPostContent)).toBeVisible()

      // Unrepost from profile
      const repostedPostProfile = page.getByRole('article', { name: `${USER_1.username}` })

      await expect(repostedPostProfile).toContainText(sharedPostContent)

      await repostedPostProfile.getByRole('button', { name: 'Repost' }).click()

      // Verify repost is removed from profile
      await expect(page.getByText(sharedPostContent)).toBeHidden()
    })

    test('should delete a post', async ({ page }) => {
      // First create a post
      await page.goto('/')
      const createButton = page.getByRole('button', { name: 'Create' }).first()
      await createButton.click()
      await page.getByPlaceholder("What's new?").fill(TEST_POST_CONTENT)
      await page.getByRole('button', { name: 'Post' }).click()

      await expect(page.getByRole('dialog')).toBeHidden()

      const testPost = page.getByRole('article', { name: `${USER_2.username}` })

      await expect(testPost).toBeVisible()

      // Delete the post
      await testPost.getByRole('button', { name: 'More' }).click()
      await page.getByRole('menuitem', { name: 'Delete' }).click()
      await page.getByRole('button', { name: 'Delete' }).click()

      // Verify post is removed
      await expect(testPost).toBeHidden()
      await expect(page.getByText(TEST_POST_CONTENT)).toBeHidden()
    })
  })

  test.describe('Post Notifications', () => {
    const notificationPostContent = TEST_NOTIFICATION_POST

    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext()
      const page = await context.newPage()

      // Log in with test user
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Create post
      await page.goto('/')
      const createButton = page.getByRole('button', { name: 'Create' }).first()
      await createButton.click()
      await page.getByPlaceholder("What's new?").fill(notificationPostContent)
      await page.getByRole('button', { name: 'Post' }).click()

      // Wait for the modal to close and post to appear in feed
      await expect(page.getByRole('dialog')).toBeHidden()

      // Now find and verify the post
      await expect(page.getByRole('article', { name: `${USER_1.username}` })).toContainText(notificationPostContent)

      await context.close()
    })

    test.beforeEach(async ({ page }) => {
      // Log in as USER_2 to test interactions
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_2.email)
      await page.getByLabel(/password/i).fill(USER_2.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')
    })

    test('should create notifications for post interactions', async ({ page }) => {
      await page.goto('/')

      // Like the post and verify notification
      await expect(page.getByRole('article', { name: `${USER_1.username}` })).toBeVisible()

      const likeButton = page.getByRole('button', { name: 'Like' })
      await likeButton.click()

      await expect(likeButton).toContainText('1')

      // Create a reply and verify notification
      const replyButton = page.getByRole('button', { name: 'Reply' })
      await replyButton.click()
      const replyText = `Test reply ${generateRandomString(8)}`
      await page.getByPlaceholder(`Reply to ${USER_1.username}...`).fill(replyText)
      await page.getByRole('button', { name: 'Post' }).click()

      await expect(page.getByRole('button', { name: 'Reply' })).toContainText('1')

      // Repost the post and verify notification
      const repostButton = page.getByRole('button', { name: 'Repost' })
      await repostButton.click()

      await expect(repostButton).toContainText('1')

      // Log out USER_2
      await page.goto('/logout')

      // Log back in as USER_1 to check notifications
      await page.goto('/login')
      await page.getByLabel(/email/i).fill(USER_1.email)
      await page.getByLabel(/password/i).fill(USER_1.password)
      await page.getByRole('button', { name: 'Log in' }).click()
      await page.waitForURL('/')

      // Check notifications in activity feed
      await page.goto('/activity')

      // Wait for notifications to load
      await expect(page.getByRole('list')).toBeVisible()

      // Verify all notifications are present using exact notification text
      await expect(page.getByRole('link', { name: `Avatar Like Notification ${USER_2.username}` })).toBeVisible()
      await expect(page.getByRole('link', { name: `Avatar Reply Notification ${USER_2.username}` })).toBeVisible()
      await expect(page.getByRole('link', { name: `Avatar Repost Notification ${USER_2.username}` })).toBeVisible()
    })
  })
})
