/**
 * @type {import('semantic-release').Options}
 */
const config = {
  extends: 'semantic-release-monorepo',
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/exec',
      {
        verifyConditionsCmd: 'yarn npm whoami --publish',
        prepareCmd:
          "yarn version ${nextRelease.version} --deferred && echo '::set-output name=version::${nextRelease.version}'",
        publishCmd: 'yarn npm publish --access public',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
    '@semantic-release/git',
  ],
}

module.exports = config
