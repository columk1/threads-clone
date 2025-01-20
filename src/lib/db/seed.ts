import bcrypt from 'bcrypt'

import { logger } from '../Logger.ts'
import { db } from './Drizzle.ts'
import { generateFakeLikes, generateFakePosts, generateFakeReposts, generateFakeUsers } from './fakerData.ts'
import { likeSchema, postSchema, repostSchema, userSchema } from './Schema.ts'
import { updatePostCounts } from './updateCounts.ts'

async function seed() {
  // Delete all existing rows
  logger.info('Deleting existing data...')
  await db.delete(postSchema)
  await db.delete(userSchema)
  await db.delete(likeSchema)
  await db.delete(repostSchema)

  try {
    // Generate fake data
    logger.info('Generating synthetic data...')
    const users = generateFakeUsers(10) // Generate 10 users
    const posts = await generateFakePosts(users, 30) // Generate 30 posts
    const likes = generateFakeLikes(users, posts, 50) // Generate 50 likes
    const reposts = generateFakeReposts(users, posts, 20) // Generate 20 reposts

    // Update counts based on interactions
    updatePostCounts(posts, likes, reposts)

    // Hash passwords
    const saltRounds = 10
    const hashedUsers = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds)
        return {
          ...user,
          password: hashedPassword,
        }
      }),
    )

    // Insert data
    logger.info('Inserting data...')
    await db.insert(userSchema).values(hashedUsers)
    await db.insert(postSchema).values(posts)
    await db.insert(likeSchema).values(likes)
    await db.insert(repostSchema).values(reposts)

    // Add my user with hashed password
    const myHashedPassword = await bcrypt.hash('123456', saltRounds)
    await db.insert(userSchema).values({
      id: '01JBXMJGX3JABF1GQXSW38MXMN',
      email: 'columk1@gmail.com',
      password: myHashedPassword,
      name: 'Colum Kelly',
      username: 'columk1',
      emailVerified: 1,
      bio: '"The past is always tense, the future perfect."',
      followerCount: 0,
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1735805136/threads-clone/avatars/389b973e.jpg',
    })

    logger.info('Seeding complete!')
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seed()
