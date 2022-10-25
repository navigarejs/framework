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
        prepareCmd: [
          'yarn version ${nextRelease.version}',
          "echo 'version=${nextRelease.version}' >> $GITHUB_OUTPUT",
        ].join(' && '),
        publishCmd: 'yarn npm publish --access public',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: [
          'git add ../../packages/*/package.json',
          'git add ../../.yarn/versions',
          'git commit -m "chore(release): ${nextRelease.version} [skip ci]" -m "${nextRelease.notes}"',
          'git push',
        ].join(' && '),
      },
    ],
  ],
}

module.exports = config
