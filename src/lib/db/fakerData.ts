import { Buffer } from 'node:buffer'

import { faker } from '@faker-js/faker'
import sharp from 'sharp'

import type { Like, Post, Repost, User } from './Schema'

const PROBABILITIES = {
  bio: 0.7,
  avatar: 0.8,
  reply: 0.4,
  image: 0.3,
  hasText: 0.9,
}

const LIMITS = {
  maxRetries: 10,
  maxShareCount: 5,
  maxSentences: 3,
  minSentences: 1,
  daysBack: 30,
}

type UniqueInteractionParams = {
  users: User[]
  posts: Post[]
  seen: Set<string>
  allowSelfInteraction?: boolean
}

function generateUniqueInteraction({ users, posts, seen, allowSelfInteraction = true }: UniqueInteractionParams): {
  user: User
  post: Post
  key: string
} | null {
  const user = faker.helpers.arrayElement(users)
  const post = faker.helpers.arrayElement(posts)
  const key = `${user.id}-${post.id}`

  if (seen.has(key) || (!allowSelfInteraction && user.id === post.userId)) {
    return null
  }

  seen.add(key)
  return { user, post, key }
}

function generateTimestampAfter(timestamp: number): number {
  return faker.date
    .between({
      from: timestamp,
      to: Date.now(),
    })
    .getTime()
}

async function generatePostContent() {
  const hasImage = faker.datatype.boolean(PROBABILITIES.image)
  const hasText = faker.datatype.boolean(PROBABILITIES.hasText)

  // If neither was selected, force text to be true
  const shouldHaveText = hasText || !hasImage

  let imageWidth = null
  let imageHeight = null
  let image = null

  if (hasImage) {
    const photoUrl = faker.image.urlPicsumPhotos()
    const response = await fetch(photoUrl)
    const buffer = Buffer.from(await response.arrayBuffer())
    const metadata = await sharp(buffer).metadata()
    imageWidth = metadata.width ?? null
    imageHeight = metadata.height ?? null
    image = photoUrl
  }

  return {
    text: shouldHaveText
      ? faker.lorem.sentences(faker.number.int({ min: LIMITS.minSentences, max: LIMITS.maxSentences }))
      : '',
    image,
    imageWidth,
    imageHeight,
  }
}

export function generateFakeUsers(count: number): User[] {
  return Array.from({ length: count }, () => ({
    id: faker.string.alphanumeric({ length: 26 }).toUpperCase(),
    googleId: null,
    email: faker.internet.email().toLowerCase(),
    password: '123456', // Simple password for testing
    name: faker.person.fullName(),
    username: faker.internet
      .username()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ''),
    emailVerified: 1,
    bio: faker.datatype.boolean(PROBABILITIES.bio) ? faker.lorem.sentence(10) : null,
    followerCount: 0, // Will be updated based on follows
    avatar: faker.datatype.boolean(PROBABILITIES.avatar) ? faker.image.avatar() : null,
  }))
}

export async function generateFakePosts(users: User[], count: number): Promise<Post[]> {
  const posts: Post[] = []
  const now = Math.floor(Date.now() / 1000)
  const pastDate = now - LIMITS.daysBack * 24 * 60 * 60

  // First generate parent posts
  for (let i = 0; i < Math.ceil(count * (1 - PROBABILITIES.reply)); i++) {
    const user = faker.helpers.arrayElement(users)
    const content = await generatePostContent()

    posts.push({
      id: faker.string.alphanumeric({ length: 26 }).toUpperCase(),
      ...content,
      userId: user.id,
      parentId: null,
      createdAt: faker.date.between({ from: pastDate, to: now }).getTime(),
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: faker.number.int({ min: 0, max: LIMITS.maxShareCount }),
    })
  }

  // Then generate replies, ensuring they come after their parent posts
  const remainingPosts = count - posts.length
  for (let i = 0; i < remainingPosts; i++) {
    const user = faker.helpers.arrayElement(users)
    const parentPost = faker.helpers.arrayElement(posts)
    const content = await generatePostContent()

    posts.push({
      id: faker.string.alphanumeric({ length: 26 }).toUpperCase(),
      ...content,
      userId: user.id,
      parentId: parentPost.id,
      createdAt: faker.date
        .between({
          from: parentPost.createdAt,
          to: now,
        })
        .getTime(),
      likeCount: 0,
      replyCount: 0,
      repostCount: 0,
      shareCount: faker.number.int({ min: 0, max: LIMITS.maxShareCount }),
    })
  }

  return posts.sort((a, b) => a.createdAt - b.createdAt)
}

export function generateFakeReposts(users: User[], posts: Post[], count: number): Repost[] {
  const reposts: Repost[] = []
  const seen = new Set<string>()

  for (let i = 0; i < count; i++) {
    let attempts = 0
    let repost: Repost | null = null

    while (attempts < LIMITS.maxRetries && !repost) {
      const interaction = generateUniqueInteraction({ users, posts, seen, allowSelfInteraction: false })

      if (interaction) {
        repost = {
          userId: interaction.user.id,
          postId: interaction.post.id,
          createdAt: generateTimestampAfter(interaction.post.createdAt),
        }
      }
      attempts++
    }

    if (repost) {
      reposts.push(repost)
    }
  }

  return reposts.sort((a, b) => a.createdAt - b.createdAt)
}

export function generateFakeLikes(users: User[], posts: Post[], count: number): Like[] {
  const likes: Like[] = []
  const seen = new Set<string>()

  for (let i = 0; i < count; i++) {
    let attempts = 0
    let like: Like | null = null

    while (attempts < LIMITS.maxRetries && !like) {
      const interaction = generateUniqueInteraction({ users, posts, seen })

      if (interaction) {
        like = {
          userId: interaction.user.id,
          postId: interaction.post.id,
          createdAt: generateTimestampAfter(interaction.post.createdAt),
        }
      }
      attempts++
    }

    if (like) {
      likes.push(like)
    }
  }

  return likes.sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
}

// Helper function to update counts based on interactions
export function updateCounts(posts: Post[], likes: Like[], reposts: Repost[]) {
  // Create a map for faster lookups
  const postMap = new Map(posts.map((post) => [post.id, post]))

  // Update like counts
  likes.forEach((like) => {
    const post = postMap.get(like.postId)
    if (post) {
      post.likeCount++
    }
  })

  // Update repost counts
  reposts.forEach((repost) => {
    const post = postMap.get(repost.postId)
    if (post) {
      post.repostCount++
    }
  })

  // Update reply counts
  posts.forEach((post) => {
    if (post.parentId) {
      const parentPost = postMap.get(post.parentId)
      if (parentPost) {
        parentPost.replyCount++
      }
    }
  })
}
