const base = require('../../release.config.cjs')('yarn prepack')

/**
 * @type {import('semantic-release').Options}
 */
const configuration = {
  ...base,
  plugins: [
    ...base.plugins,
    [
      '@semantic-release/exec',
      {
        prepareCmd: [
          'cd ..',
          'git remote add laravel git@github.com:navigarejs/laravel.git',
          'git subtree split --prefix=packages/laravel -b split',
          'git checkout split',
          'git push --force --upstream laravel split:main',
        ].join(' && '),
      },
    ],
  ],
}

module.exports = configuration
