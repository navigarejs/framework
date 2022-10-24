import fs from 'node:fs'
import makeDebugger from 'debug'
import { callArtisan, findPhpPath } from './utilities'
import { Options, Configuration, Adapter } from './types'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import { throwError } from '@navigare/core'

const CONFIG_ARTISAN_COMMAND = 'navigare:config'
const debug = makeDebugger('navigare:laravel:config')

/**
 * Get configuration.
 */
export const getConfiguration = async (
  options: Options,
  env: NodeJS.ProcessEnv,
): Promise<Configuration> => {
  // Prefer already defined configuration
  if (isObject(options.configuration)) {
    return options.configuration
  }

  // Load configuration from JSON
  if (isString(options.configuration)) {
    return JSON.parse(fs.readFileSync(options.configuration, 'utf8'))
  }

  // Otherwise try to retrieve configuration from adapter
  switch (options.configuration) {
    case Adapter.Laravel: {
      return await getLaravelConfiguration(options, env)
      break
    }

    default: {
      throwError(`"${options.configuration}" is not a valid adapter for routes`)
    }
  }
}

/**
 * Reads the configuration from the `php artisan navigare:config` command.
 */
export async function getLaravelConfiguration(
  options: Options,
  env: NodeJS.ProcessEnv,
): Promise<Configuration> {
  const executable = findPhpPath({ env, path: options.php })

  try {
    // Asks PHP for the configuration
    debug('reading configuration from PHP.')
    const json = JSON.parse(
      callArtisan(executable, CONFIG_ARTISAN_COMMAND),
    ) as Configuration

    if (!json) {
      throwError('the configuration object is empty')
    }

    return json
  } catch (error: any) {
    throwError(`could not read configuration`, error)
  }
}
