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
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel
      `
        .split('\n')
        .map((line) => line.trim())
        .join(' '),
      prepareCmd: `curl
        -X POST
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        -d '{ "event_type": "synchronize", "client_payload": { "message": "chore(release): \${nextRelease.version} [skip ci]" } }'
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel/dispatches
      `
        .split('\n')
        .map((line) => line.trim())
        .join(' '),
    },
  ],
])

module.exports = configuration
