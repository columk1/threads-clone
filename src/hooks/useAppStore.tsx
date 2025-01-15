import { create } from 'zustand'

type AppState = {
  posts: Record<
    string,
    { isLiked: boolean; likeCount: number; replyCount: number; isReposted: boolean; repostCount: number }
  >
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
  clearPosts: () => void
}

export const useAppStore = create<AppState>((set) => ({
  posts: {},
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
        // Overwrite latest posts from fetch, they could be older, cached requests
        ...state.posts,
      },
    })),
  updatePost: (postId, updates) =>
    set((state) => {
      const post = state.posts[postId]
      if (!post) {
        return state
      } // Return unchanged state if post doesn't exist

      return {
        posts: {
          ...state.posts,
          [postId]: { ...state.posts[postId], ...updates },
        },
      }
    }),
  clearPosts: () =>
    set(() => ({
      posts: {},
    })),
}))
