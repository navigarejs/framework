import { getConfiguration } from '../src/configuration'
import { Adapter } from '../src/types'
import { artisan, fixture } from './utilities'
import { it, expect } from 'vitest'

it('reads configuration from the given option object', async () => {
  const configuration = await getConfiguration(
    {
      configuration: {
        ssr: {
          enabled: false,
          protocol: 'http',
          host: '127.0.0.1',
          port: 13715,
          timeout: 1,
          input: 'resources/scripts/ssr.ts',
          manifest: '/tmp/bootstrap/ssr/manifest.json',
        },

        client: {
          manifest: '/tmp/public/build/manifest.json',
        },

        components: {
          path: 'resources/scripts/pages',
          default_extension: 'vue',
        },

        testing: {
          ensure_pages_exist: true,
        },
      },
    },
    process.env,
  )

  expect(configuration).toMatchSnapshot()
})

it('reads configuration from file', async () => {
  const configuration = await getConfiguration(
    {
      configuration: fixture('configuration.json'),
    },
    process.env,
  )

  expect(configuration).toMatchSnapshot()
})

it('reads configuration from Laravel', async () => {
  process.env.TEST_ARTISAN_SCRIPT = artisan()

  const configuration = await getConfiguration(
    {
      configuration: Adapter.Laravel,
    },
    process.env,
  )

  expect(configuration).toMatchSnapshot()
})
