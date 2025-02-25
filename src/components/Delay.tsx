const Delay = async ({ delay = 1000 }: { delay?: number }) => {
  await new Promise((resolve) => setTimeout(resolve, delay))
  return null
}

export default Delay
