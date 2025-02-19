import { expect, test } from '@playwright/test'

import { USER_1, USER_2 } from '../utils/testConstants'

const TEST_NOTIFICATION_POST = 'Test notification post'

test.describe('Notifications Icon', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as USER_1
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(USER_1.email)
    await page.getByLabel('Password').fill(USER_1.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL('/')
  })

  test('should show notification indicator when user has unseen notifications', async ({ page }) => {
    // Create a notification by having USER_2 like USER_1's post
    // First create a post as USER_1
    await page.getByRole('button', { name: 'Create' }).first().click()
    await page.getByPlaceholder("What's new?").fill(TEST_NOTIFICATION_POST)
    await page.getByRole('button', { name: 'Post' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()

    // Log out USER_1
    const sidebar = page.getByRole('navigation', { name: 'Primary navigation' })
    const moreButton = sidebar.getByRole('button', { name: 'More' })

    await expect(moreButton).toBeVisible()

    await moreButton.click()
    await page.getByRole('menuitem', { name: 'Log out' }).click()

    await expect(page).toHaveURL('/login')

    // Log in as USER_2 to create a notification
    await page.getByLabel(/email/i).fill(USER_2.email)
    await page.getByLabel('Password').fill(USER_2.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL('/')

    const postElement = page.getByRole('article', { name: `${USER_1.username}` })
    // Like USER_1's post
    await postElement.getByRole('button', { name: 'Like' }).click()

    // Reply to USER_1's post
    const replyButton = postElement.getByRole('button', { name: 'Reply' })
    await replyButton.click()
    await page.getByPlaceholder(`Reply to ${USER_1.username}...`).fill('Test reply')
    await page.getByRole('button', { name: 'Post' }).click()

    await expect(replyButton).toContainText('1')

    // Log out USER_2
    const moreButton2 = sidebar.getByRole('button', { name: 'More' })

    await expect(moreButton2).toBeVisible()

    await moreButton2.click()
    await page.getByRole('menuitem', { name: 'Log out' }).click()

    await expect(page).toHaveURL('/login')

    // Log back in as USER_1 to check notifications
    await page.getByLabel(/email/i).fill(USER_1.email)
    await page.getByLabel('Password').fill(USER_1.password)
    await page.getByRole('button', { name: 'Log in' }).click()
    await page.waitForURL('/')

    // Check that notification icon shows unseen count
    const notificationIcon = page.getByRole('img', { name: 'Notifications (2)' })

    await expect(notificationIcon).toBeVisible()

    // Verify the notification dot is visible
    await expect(page.locator('circle[fill="var(--notification)"]')).toBeVisible()

    // Visit notifications page
    await page.goto('/activity')

    await expect(page.getByRole('list')).toBeVisible()

    // Go back to home page and verify notification indicator is gone
    await page.goto('/')

    await expect(page.getByRole('img', { name: 'Notifications' })).toBeVisible()
    await expect(page.locator('circle[fill="var(--notification)"]')).toBeHidden()
  })

  test('should not show notification indicator for own actions', async ({ page }) => {
    // Create a post (this should not trigger a notification)
    await page.getByRole('button', { name: 'Create' }).first().click()
    await page.getByPlaceholder("What's new?").fill(TEST_NOTIFICATION_POST)
    await page.getByRole('button', { name: 'Post' }).click()

    await expect(page.getByRole('dialog')).toBeHidden()

    const postElement = page.getByRole('article', { name: `${USER_1.username}` }).first()

    // Like own post (this should not trigger a notification)
    await postElement.getByRole('button', { name: 'Like' }).click()

    // Verify no notification indicator is shown
    await expect(page.getByRole('img', { name: 'Notifications' })).toBeVisible()
    await expect(page.locator('circle[fill="var(--notification)"]')).toBeHidden()
  })
})
