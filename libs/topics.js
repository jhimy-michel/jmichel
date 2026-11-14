// Post topics. Each is one book on Perrito's shelf (left to right), and a
// post picks one with `topic:` in its frontmatter
export const TOPICS = [
  { id: 'tech', label: 'Tech', emoji: '💻', color: '#1d5a66' },
  { id: 'travel', label: 'Travel', emoji: '✈️', color: '#cb6040' },
  { id: 'life', label: 'Life', emoji: '🌱', color: '#3a8c5c' }
]

export const topicById = id => TOPICS.find(t => t.id === id) || null
