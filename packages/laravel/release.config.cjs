const run = (input) => {
  return input
    .split('\n')
    .map((line) => line.trim())
    .join(' ')
}

/**
 * @type {import('semantic-release').Options}
 */
const configuration = require('../../release.config.cjs')('yarn prepack', [
  [
    '@semantic-release/exec',
    {
      verifyConditionsCmd: run(`curl
        -X GET
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel
      `),
      prepareCmd: run(`curl
        -X POST
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        -d '{ "event_type": "synchronize", "client_payload": { "version": "\${nextRelease.version}" } }'
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel/dispatches
      `),
    },
  ],
])

module.exports = configuration
