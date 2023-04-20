import { Options, Adapter } from './types'
import { callArtisan, findPhpPath } from './utilities'
import { RawRoutes, throwError } from '@navigare/core'
import makeDebugger from 'debug'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import fs from 'node:fs'

const debug = makeDebugger('navigare:laravel:routes')

/**
 * Write routes.
 */
export const writeTypes = async (
  path: string,
  routes: RawRoutes,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const oldContent =
      fs.existsSync(path) &&
      fs.readFileSync(path, {
        encoding: 'utf-8',
      })
    /*const newContent = `import '@navigare/core'

declare module '@navigare/core' {
  export interface Routes ${JSON.stringify(routes, null, 2)}
}
`*/
    const newContent = `export declare type GeneratedRoutes = ${JSON.stringify(
      routes,
      null,
      2,
    )};`

    // Do not update file if content is anyway the same
    if (oldContent === newContent) {
      resolve()
      return resolve()
    }

    try {
      fs.writeFileSync(path, newContent, {
        encoding: 'utf-8',
      })
    } catch (error) {
      if (error instanceof Error) {
        reject(new Error(`could not write types file: ${error.message}`))
        return
      }

      reject(new Error(`could not write types file`))
      return
    }

    resolve()
  })
}

/**
 * Get routes.
 */
export const getRoutes = async (
  options: Options,
  env: NodeJS.ProcessEnv,
  ssr: boolean,
  hash?: string,
): Promise<RawRoutes | undefined> => {
  // Prefer already defined routes
  if (isObject(options.routes)) {
    return options.routes
  }

  // Load routes from JSON
  if (isString(options.routes)) {
    return JSON.parse(fs.readFileSync(options.routes, 'utf8'))
  }

  // Otherwise try to retrieve them from adapter
  switch (options.routes) {
    case Adapter.Laravel: {
      return await getLaravelRoutes(options, env, ssr, hash)
      break
    }

    default: {
      throwError(`"${options.routes}" is not a valid adapter for routes`)
    }
  }
}

/**
 * Reads the routes from the `php artisan navigare:routes` command.
 */
export async function getLaravelRoutes(
  options: Options,
  env: NodeJS.ProcessEnv,
  ssr: boolean,
  hash?: string,
): Promise<RawRoutes> {
  const executable = findPhpPath({ env, path: options.php })

  try {
    // Asks artisan for the routes
    debug('reading Laravel routes')
    const json = JSON.parse(
      callArtisan(
        executable,
        ...[
          'navigare:routes',
          ssr ? '--ssr' : undefined,
          hash ? `--hash=${hash}` : undefined,
        ],
      ),
    ) as RawRoutes

    if (!json) {
      throwError('the routes object is empty')
    }

    return json
  } catch (error: any) {
    throwError(`could not read routes: ${error.message}`)
  }
}
