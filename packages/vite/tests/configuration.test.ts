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
          url: 'http://127.0.0.1:13714/',
        },

        testing: {
          ensure_pages_exist: true,
          page_paths: [],
          page_extensions: [],
        },

        types: {
          path: './resources/js/navigare.d.ts',
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
