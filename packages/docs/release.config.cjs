/**
 * @type {import('semantic-release').Options}
 */
const config = {
  extends: 'semantic-release-monorepo',
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/changelog',
    [
      '@semantic-release/git',
      {
        assets: ['packages/docs/.vitepress/dist'],
      },
    ],
  ],
}

module.exports = config
