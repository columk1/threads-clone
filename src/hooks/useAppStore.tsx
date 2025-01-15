import { create } from 'zustand'

type AppState = {
  posts: Record<
    string,
    { isLiked: boolean; likeCount: number; replyCount: number; isReposted: boolean; repostCount: number }
  >
  users: Record<string, { isFollowed: boolean; followerCount: number }>
  setPosts: (
    posts: Array<{
      post: {
        id: string
        isLiked?: boolean
        likeCount: number
        replyCount: number
        isReposted?: boolean
        repostCount: number
      }
    }>,
  ) => void
  addPosts: (
    posts: Array<{
      post: {
        id: string
        isLiked?: boolean
        likeCount: number
        replyCount: number
        isReposted?: boolean
        repostCount: number
      }
    }>,
  ) => void
  updatePost: (
    postId: string,
    updates: { isLiked: boolean; likeCount: number; replyCount: number; isReposted: boolean; repostCount: number },
  ) => void
  setUsers: (users: Array<{ id: string; isFollowed: boolean; followerCount: number }>) => void
  addUsers: (users: Array<{ id: string; isFollowed: boolean; followerCount: number }>) => void
  updateUser: (userId: string, updates: { isFollowed: boolean; followerCount: number }) => void
  clearPosts: () => void
  clearUsers: () => void
}

export const useAppStore = create<AppState>((set) => ({
  posts: {},
  users: {},
  setPosts: (posts) =>
    set(() => ({
      posts: Object.fromEntries(
        posts.map(({ post }) => [
          post.id,
          {
            isLiked: post.isLiked ?? false,
            likeCount: post.likeCount,
            replyCount: post.replyCount,
            isReposted: post.isReposted ?? false,
            repostCount: post.repostCount,
          },
        ]),
      ),
    })),
  addPosts: (posts) =>
    set((state) => ({
      posts: {
        ...Object.fromEntries(
          posts.map(({ post }) => [
            post.id,
            {
              isLiked: post.isLiked ?? false,
              likeCount: post.likeCount,
              replyCount: post.replyCount,
              isReposted: post.isReposted ?? false,
              repostCount: post.repostCount,
            },
          ]),
        ),
        ...state.posts,
      },
    })),
  updatePost: (postId, updates) =>
    set((state) => {
      const post = state.posts[postId]
      if (!post) {
        return state
      }

      return {
        posts: {
          ...state.posts,
          [postId]: { ...state.posts[postId], ...updates },
        },
      }
    }),
  setUsers: (users) =>
    set(() => ({
      users: Object.fromEntries(
        users.map((user) => [
          user.id,
          {
            isFollowed: user.isFollowed,
            followerCount: user.followerCount,
          },
        ]),
      ),
    })),
  addUsers: (users) =>
    set((state) => ({
      users: {
        ...Object.fromEntries(
          users.map((user) => [
            user.id,
            {
              isFollowed: user.isFollowed,
              followerCount: user.followerCount,
            },
          ]),
        ),
        ...state.users,
      },
    })),
  updateUser: (userId, updates) =>
    set((state) => {
      const user = state.users[userId]
      if (!user) {
        return state
      }

      return {
        users: {
          ...state.users,
          [userId]: { ...state.users[userId], ...updates },
        },
      }
    }),
  clearPosts: () =>
    set(() => ({
      posts: {},
    })),
  clearUsers: () =>
    set(() => ({
      users: {},
    })),
}))
