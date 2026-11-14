// Writes public/shelf.json: the posts as books for the 3D bookshelf
// (newest first). Runs before `dev` and `build`; the room fetches it
const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

const POSTS_DIR = path.join(process.cwd(), 'content/posts')
const OUT_FILE = path.join(process.cwd(), 'public/shelf.json')

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter(name => name.endsWith('.mdx'))
  .map(name => {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, name), 'utf8'))
    return {
      slug: name.replace(/\.mdx$/, ''),
      title: data.title || name,
      topic: data.topic || null,
      date: data.date ? new Date(data.date).toISOString().slice(0, 10) : null
    }
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

fs.writeFileSync(OUT_FILE, `${JSON.stringify(posts, null, 2)}\n`)
console.log(`shelf.json: ${posts.length} posts`)
