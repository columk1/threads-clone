import OpenAI from 'openai'

const openai = new OpenAI()

export const moderateContent = async (text: string | null, imageUrl: string | null) => {
  if (!text && !imageUrl) {
    throw new Error('No content to moderate')
  }

  const inputs: string[] = []

  if (text) {
    inputs.push(text)
  }

  if (imageUrl) {
    inputs.push(imageUrl)
  }

  const moderation = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: inputs,
  })
  // Flag sexual imagery more liberally
  if (imageUrl) {
    const imageResult = text ? moderation.results[1] : moderation.results[0]
    if (imageResult?.category_scores?.sexual && imageResult.category_scores.sexual > 0.019) {
      imageResult.flagged = true
      return moderation
    }
  }
  return moderation
}
