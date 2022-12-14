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
  /*[
    '@semantic-release/exec',
    {
      prepareCmd: run(
        `content=$(jq --arg version "\${nextRelease.version}" ".version=\\$version" composer.json) && printf "%b" $content > composer.json`,
      ),
    },
  ],*/

  [
    '@semantic-release/exec',
    {
      verifyConditionsCmd: run(`curl
        --silent
        --show-error
        -X GET
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel
      `),

      successCmd: run(`curl
        --silent
        --show-error
        -X POST
        -H "Accept: application/vnd.github+json"
        -H "Authorization: Bearer ${process.env.LARAVEL_GIT_TOKEN}"
        -d '{ "event_type": "synchronize", "client_payload": {} }'
        --fail-with-body
        https://api.github.com/repos/navigarejs/laravel/dispatches
      `),
    },
  ],
])

module.exports = configuration
