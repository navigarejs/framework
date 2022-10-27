const createConfiguration = (publishCmd, plugins = []) => {
  /**
   * @type {import('semantic-release').Options}
   */
  const configuration = {
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
            'cp ../../README.md README.md',
          ].join(' && '),
          publishCmd,
        },
      ],

      [
        '@semantic-release/github',
        {
          assets: [],
          // We can enable this once https://github.com/semantic-release/github/pull/487 was merged
          releasedLabels: false,
          successComment: false,
          failComment: false,
        },
      ],

      [
        '@semantic-release/exec',
        {
          prepareCmd: [
            'yarn',
            'git add ../../yarn.lock',
            'git add ../../packages/*/package.json',
            'git add ../../.yarn',
            'git commit -m "chore(release): ${nextRelease.version} [skip ci]" -m "${nextRelease.notes}"',
            'git push',
          ].join(' && '),
        },
      ],

      ...plugins,
    ],
  }

  return configuration
}

module.exports = createConfiguration
