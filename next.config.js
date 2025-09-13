const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: []
  }
})

module.exports = withMDX({
  output: 'export',
  reactStrictMode: true,
  basePath: '',
  assetPrefix: '',
  pageExtensions: ['js', 'jsx', 'mdx'],
  images: {
    unoptimized: true
  }
})
