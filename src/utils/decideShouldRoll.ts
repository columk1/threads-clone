export function decideShouldRoll(isSet: boolean, count: number) {
  let shouldRoll = false
  if (!isSet && count === 1) {
    shouldRoll = true
  } else if (count > 1 && count < 1000) {
    shouldRoll = true
  } else if (count > 0) {
    // For 1000+ (K-formatted numbers), animate at format boundaries
    const mod = count % 100
    if (isSet && mod === 0) {
      shouldRoll = true
    } else if (!isSet && mod === 99) {
      shouldRoll = true
    }
  }
  return shouldRoll
}
