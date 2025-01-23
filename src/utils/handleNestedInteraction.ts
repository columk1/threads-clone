export function handleNestedInteraction(
  e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  callback: () => void,
) {
  // If target is not a direct child of currentTarget, it might be a synthetic event
  if ((e.target instanceof Node && !e.currentTarget.contains(e.target)) || e.target === e.currentTarget) {
    return
  }

  if (
    e.target instanceof SVGElement ||
    (e.target instanceof HTMLElement && e.target.closest('button, a, [role="button"]'))
  ) {
    return // Exit if the target is an SVG or a button/link
  }
  callback()
}
