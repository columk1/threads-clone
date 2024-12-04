// const FollowButton: FunctionComponent<FollowButtonProps> = ({ isFollowed, onToggleFollow }) => {
//   const [optimisticIsFollowed, addOptimisticIsFollowed] = useOptimistic(
//     isFollowed,
//     (_, optimisticValue: boolean) => optimisticValue,
//   )

//   const handleToggleFollow = async () => {
//     startTransition(() => {
//       addOptimisticIsFollowed(!optimisticIsFollowed)
//     })
//     await onToggleFollow()
//   }
