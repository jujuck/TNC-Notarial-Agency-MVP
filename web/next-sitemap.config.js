/** @type {import('next-sitemap').IConfig} */
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080').replace(/\/+$/, '');

module.exports = {
  siteUrl,
  // Le robots.txt est un fichier statique : next-sitemap ne doit jamais l'ecraser.
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  outDir: 'public',
  exclude: ['/admin', '/admin/*', '/404', '/500'],
  changefreq: 'monthly',
  priority: 1,
  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: path === '/' ? 1 : config.priority,
    lastmod: new Date().toISOString(),
  }),
};
