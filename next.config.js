const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  reactStrictMode: true,
  basePath: isProd ? '/jmichel' : '',
  assetPrefix: !isProd ? 'https://jhimy-michel.github.io/jmichel/' : '',
}
