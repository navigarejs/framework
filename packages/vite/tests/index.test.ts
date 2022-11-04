import navigare from '../src'
import routes from './__fixtures__/routes.json'
import { fixture } from './utilities'
import vue from '@vitejs/plugin-vue'
import vueJSX from '@vitejs/plugin-vue-jsx'
import path from 'node:path'
import { build as vite } from 'vite'
import { describe, expect, it } from 'vitest'

/*
const copy = (value: string) => {
  const proc = require('child_process').spawn('pbcopy')
  proc.stdin.write(value)
  proc.stdin.end()
}
*/

const build = async (input: string) => {
  const result = (await vite({
    mode: 'production',
    root: path.resolve(__dirname),
    build: {
      // outDir: fixture('test/'),
      minify: false,
      rollupOptions: {
        input,
        external: [/node_modules/, /@navigare/],
      },
    },
    logLevel: 'silent',
    plugins: [
      vue({}),

      vueJSX(),

      navigare({
        interval: false,
        configuration: fixture('configuration.json'),
        routes: fixture('routes.json'),
      }),
    ],
  })) as any

  return result.output.reduce(
    (
      cumulatedCode: string,
      output: {
        code: string
      },
    ) => {
      return [cumulatedCode, output.code].join('\n')
    },
    '',
  )
}

it('throw an error for invalid route names', async () => {
  try {
    await build(fixture('resources/scripts/invalid.ts'))
  } catch (error: any) {
    expect(error.message).toBe('Navigare: "invalid" is not a valid route name.')
  }
})

const findRouteInCode = (route: any, code: string): number => {
  const codeWithoutWhitespaces = code.replace(/\s/g, '')

  /*return (
    codeWithoutWhitespaces
      .replace(/\s/g, '')
      .split(JSON.stringify(route).replace(/\s/g, '')).length - 1
  )*/

  return codeWithoutWhitespaces.split(route.uri).length - 1
}

describe('Vue', () => {
  it('replaces routes in Vue components (*.ts)', async () => {
    const code = await build(
      fixture('resources/scripts/vue/ComponentContainer.ts'),
    )

    expect(code).toMatchSnapshot()
    expect(findRouteInCode(routes.welcome, code)).toEqual(1)
  })

  it('replaces routes in Vue components (*.vue)', async () => {
    const code = await build(
      fixture('resources/scripts/vue/ComponentContainer.vue'),
    )

    expect(code).toMatchSnapshot()
    expect(findRouteInCode(routes.welcome, code)).toEqual(2)
  })

  it('replaces routes in Vue components with setup sugar', async () => {
    const code = await build(
      fixture('resources/scripts/vue/SetupContainer.vue'),
    )

    expect(code).toMatchSnapshot()
    expect(findRouteInCode(routes.welcome, code)).toEqual(2)
  })

  it('replaces routes in Vue components with TSX', async () => {
    const code = await build(fixture('resources/scripts/vue/Component.tsx'))

    expect(code).toMatchSnapshot()
    expect(findRouteInCode(routes.welcome, code)).toEqual(2)
  })
})

describe.skip('React', () => {
  it('replaces routes in React components with TSX', async () => {
    const code = await build(fixture('resources/scripts/react/Component.tsx'))

    expect(code).toMatchSnapshot()
    expect(findRouteInCode(routes.welcome, code)).toEqual(2)
  })
})
