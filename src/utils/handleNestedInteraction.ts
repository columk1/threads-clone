export function handleNestedInteraction(e: React.MouseEvent<HTMLDivElement>, callback: () => void) {
  if (
    e.target instanceof SVGElement ||
    (e.target instanceof HTMLElement && e.target.closest('button, a, [role="button"]'))
  ) {
    return // Exit if the target is an SVG or a button/link
  }
  callback()
}
