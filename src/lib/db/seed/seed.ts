// This script will seed the db with pre-generated data that came from LLMs and image generation models

import bcrypt from 'bcrypt'

import { logger } from '../../Logger.ts'
import { db } from '../Drizzle.ts'
import { followerSchema, likeSchema, postSchema, repostSchema, userSchema } from '../Schema.ts'
import { seedData } from './seedData.ts'

/**
 * Seeds the database with static data
 */
export async function seed() {
  try {
    if (!process.env.TEST_USER_PASSWORD) {
      throw new Error('TEST_USER_PASSWORD environment variable is not set')
    }

    // Delete all existing rows
    logger.info('Deleting existing data...')
    await db.delete(postSchema)
    await db.delete(userSchema)
    await db.delete(likeSchema)
    await db.delete(repostSchema)
    await db.delete(followerSchema)

    // Insert users with hashed passwords
    logger.info('Inserting users...')
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(process.env.TEST_USER_PASSWORD, saltRounds)
    const users = seedData.users.map((user) => ({
      ...user,
      password: hashedPassword,
      emailVerified: 1,
      googleId: null,
    }))
    await db.insert(userSchema).values(users)

    // Insert posts
    logger.info('Inserting posts...')
    await db.insert(postSchema).values(seedData.posts)

    // Insert likes
    logger.info('Inserting likes...')
    await db.insert(likeSchema).values(seedData.likes)

    // Insert reposts
    logger.info('Inserting reposts...')
    await db.insert(repostSchema).values(seedData.reposts)

    // Insert followers
    logger.info('Inserting followers...')
    await db.insert(followerSchema).values(seedData.followers)

    // Add my user with hashed password
    await db.insert(userSchema).values({
      id: '01JBXMJGX3JABF1GQXSW38MXMN',
      email: 'columk1@gmail.com',
      password: hashedPassword,
      name: 'Colum Kelly',
      username: 'columk',
      emailVerified: 1,
      bio: '',
      followerCount: 0,
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1735805136/threads-clone/avatars/389b973e.jpg',
      googleId: null,
    })

    logger.info('Static seeding complete!')
  } catch (error) {
    logger.error(error, 'Error seeding database:')
  }
}

seed()
