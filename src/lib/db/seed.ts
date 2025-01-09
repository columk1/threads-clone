import bcrypt from 'bcrypt'

import { logger } from '../Logger.ts'
import { db } from './Drizzle.ts'
import { postSchema, userSchema } from './Schema.ts'

async function seed() {
  const users = [
    {
      id: '01JBXMJGX3JABF1GQXSW38MXMN',
      email: 'columk1@gmail.com',
      password: '123456',
      name: 'Colum Kelly',
      username: 'columk1',
      emailVerified: 1,
      bio: '"The past is always tense, the future perfect."',
      followerCount: 0,
      avatar: 'https://res.cloudinary.com/dsrekt1mo/image/upload/v1735805136/threads-clone/avatars/389b973e.jpg',
    },
    {
      id: '01JC5DJJF5YB7QTWTJH9Z4SAR4',
      email: 'jeremystrong@gmail.com',
      password: '123456',
      name: 'Jeremy Strong',
      username: 'jeremystrong',
      emailVerified: 1,
      bio: 'Actor.',
      followerCount: 0,
      avatar: null,
    },
    {
      id: '01JCVFAX0PC4G5P456FEEJ2PMV',
      email: 'columk.1@gmail.com',
      password: '123456',
      name: 'Zadie Smith',
      username: 'zadiesmith',
      emailVerified: 1,
      bio: 'Zadie Smith is a British novelist, essayist and short story writer.',
      followerCount: 0,
      avatar: null,
    },
  ]

  const posts = [
    {
      id: '01JC2P47P0VD0GEGWDZY9QHBNB',
      text: 'Do you think I’d get yelled at for making an emulated server of a formerly popular game for educational purposes? 🤔',
      userId: '01JBXMJGX3JABF1GQXSW38MXMN',
      parentId: null,
      createdAt: 1730962137,
      likeCount: 0,
    },
    {
      id: '01JCVGNVNDD355AS194HPHG8Y6',
      text: 'Next.js is a React framework for building full-stack web applications.',
      userId: '01JCVFAX0PC4G5P456FEEJ2PMV',
      parentId: null,
      createdAt: 1731795283,
      likeCount: 0,
    },
    {
      id: '01JDQVX9Q9G0SRQCKY33B4H9FJ',
      text: 'Tell me more',
      userId: '01JBXMJGX3JABF1GQXSW38MXMN',
      parentId: '01JCVGNVNDD355AS194HPHG8Y6',
      createdAt: 1732746585,
      likeCount: 0,
    },
    {
      id: '01JE868F3BBBTQYZF8EDWX6EG4',
      text: 'Yessir',
      userId: '01JBXMJGX3JABF1GQXSW38MXMN',
      parentId: '01JDQVX9Q9G0SRQCKY33B4H9FJ',
      createdAt: 1733294308,
      likeCount: 0,
    },
  ]

  // Delete all existing rows
  await db.delete(postSchema)
  await db.delete(userSchema)

  try {
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

    for (const user of hashedUsers) {
      await db.insert(userSchema).values(user)
    }

    for (const post of posts) {
      await db.insert(postSchema).values(post)
    }

    logger.info('Seeding complete!')
  } catch (error) {
    logger.error('Error seeding database:', error)
  }
}

seed()
