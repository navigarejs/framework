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
      '@semantic-release/exec',
      {
        verifyConditionsCmd: '',
        prepareCmd:
          "yarn version ${nextRelease.version} && echo 'version=${nextRelease.version}' >> $GITHUB_OUTPUT",
        publishCmd: 'yarn prepack',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['packages/*/package.json', '.yarn/versions/'],
      },
    ],
  ],
}

module.exports = config
