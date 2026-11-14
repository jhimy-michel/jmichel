// Shared page geometry: the navbar and the hero text use the same column,
// and the 3D room frames itself around the hero text
export const SITE_WIDTH = 1152 // px, max width of the navbar/hero column
export const SITE_PADDING = 16 // px, side padding of that column
export const SPLIT_FROM = 992 // px wide and up (Chakra `lg`): text left, room right
export const HERO_TEXT_WIDTH = 380 // px, hero text column in the split layout
export const HERO_TEXT_HEIGHT = 190 // px, hero text block under the room below SPLIT_FROM

// Screen space the hero text covers, for framing the room beside it
// (left/right: px from each screen edge; bottom: px from the bottom)
export function heroInset(width) {
  if (width < SPLIT_FROM) return { left: 0, right: 0, bottom: HERO_TEXT_HEIGHT }
  const margin = Math.max(0, (width - SITE_WIDTH) / 2)
  return {
    left: margin + SITE_PADDING + HERO_TEXT_WIDTH,
    right: margin,
    bottom: 0
  }
}
