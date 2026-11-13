// Build-time only (used from getStaticProps / getStaticPaths)
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

const slugs = () =>
  fs.existsSync(POSTS_DIR)
    ? fs
        .readdirSync(POSTS_DIR)
        .filter((name) => name.endsWith('.mdx'))
        .map((name) => name.replace(/\.mdx$/, ''))
    : []

export const getPostSlugs = slugs

export const getPost = (slug) => {
  const file = path.join(POSTS_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const { content, data } = matter(fs.readFileSync(file, 'utf8'))
  return {
    content,
    meta: {
      slug,
      title: data.title || slug,
      date: data.date || null,
      description: data.description || null,
      topic: data.topic || null
    }
  }
}

// Newest first
export const getAllPosts = () =>
  slugs()
    .map((slug) => getPost(slug).meta)
    .sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date) - new Date(a.date)
    })
