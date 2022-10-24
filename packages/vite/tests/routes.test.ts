import { it, expect } from 'vitest'
import { getRoutes } from '../src/routes'
import { Adapter } from '../src/types'
import { artisan, fixture } from './utilities'

it('reads routes from the given option object', async () => {
  const result = await getRoutes(
    {
      routes: {
        welcome: {
          name: 'welcome' as never,
          uri: 'welcome/{name?}',
          method: 'GET',
          methods: ['GET', 'HEAD'],
          domain: 'navigare.test',
          bindings: { name: null },
          components: ['pages/Welcome.vue'],
        },
      },
    },
    process.env,
  )

  expect(result).toMatchSnapshot()
})

it('reads routes from file', async () => {
  const configuration = await getRoutes(
    {
      routes: fixture('routes.json'),
    },
    process.env,
  )

  expect(configuration).toMatchSnapshot()
})

it('reads routes from Laravel', async () => {
  process.env.TEST_ARTISAN_SCRIPT = artisan

  const routes = await getRoutes(
    {
      routes: Adapter.Laravel,
    },
    process.env,
  )

  expect(routes).toMatchSnapshot()
})
