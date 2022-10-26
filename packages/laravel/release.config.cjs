/**
 * @type {import('semantic-release').Options}
 */
const configuration = require('../../release.config.cjs')('yarn prepack', [
  [
    '@semantic-release/exec',
    {
      verifyConditionsCmd: `curl
        -X GET
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.GIT_TOKEN_LARAVEL}"
        https://api.github.com/repos/navigarejs/laravel
      `
        .split('\n')
        .join(' '),
      prepareCmd: `curl
        -X POST
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.GIT_TOKEN_LARAVEL}"
        https://api.github.com/repos/navigarejs/laravel/dispatches
        -d '{ "event_type": "synchronize", "client_payload": { "message": "chore(release): \${nextRelease.version} [skip ci]" } }'
      `
        .split('\n')
        .join(' '),
    },
  ],
])

module.exports = configuration
