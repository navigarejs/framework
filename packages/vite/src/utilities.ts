import { PhpFinderOptions } from './types'
import { isDefined } from '@navigare/core'
import colorette from 'colorette'
import crypto from 'crypto'
import makeDebugger from 'debug'
import * as execa from 'execa'
import { loadEnv } from 'vite'

const debug = makeDebugger('navigare:laravel:utilities')

export const generateChunkName = (buildId: string | number, name: string) => {
  const hash = crypto
    .createHash('md5')
    .update(`${buildId}-${name.split('?')[0]}`)
    .digest('hex')

  return `${hash}.mjs`
}

export function parseUrl(href?: string) {
  if (!href) {
    return null
  }

  try {
    return new URL(href)
  } catch {
    return null
  }
}

export function finish(
  str: string | undefined,
  character: string,
  _default: string = '',
): string {
  if (!str) {
    return _default
  }

  if (!str.endsWith(character)) {
    return str + character
  }

  return str
}

export function wrap<T>(input: undefined | T | T[], _default: T[]): T[] {
  if (!input) {
    return _default
  }

  if (Array.isArray(input)) {
    return input
  }

  return [input]
}

/**
 * Finds the path to PHP.
 */
export function findPhpPath(options: PhpFinderOptions = {}): string {
  if (options.path) {
    return options.path
  }

  if (!options.env) {
    options.env = loadEnv(
      options.mode ?? process.env.NODE_ENV ?? 'development',
      process.cwd(),
      '',
    )
  }

  const path = options.env.PHP_EXECUTABLE_PATH || 'php'
  debug('use PHP path %s', path)

  return path
}

/**
 * Calls an artisan command.
 */
export function callArtisan(
  executable: string,
  ...parameters: (string | undefined)[]
): string {
  debug('call artisan %s with %O', executable, parameters)

  const args = ['artisan', ...parameters.filter(isDefined)]

  if (process.env.VITEST && process.env.TEST_ARTISAN_SCRIPT) {
    return execa.sync(process.env.TEST_ARTISAN_SCRIPT, [executable, ...args], {
      encoding: 'utf-8',
    })?.stdout
  }

  return execa.sync(executable, args)?.stdout
}

/**
 * Calls a shell command.
 */
export function callShell(executable: string, ...parameters: string[]): string {
  debug('call shell %s with %O', executable, parameters)

  if (process.env.VITEST && process.env.TEST_ARTISAN_SCRIPT) {
    return execa.sync(process.env.TEST_ARTISAN_SCRIPT, [
      executable,
      ...parameters,
    ])?.stdout
  }

  return execa.sync(executable, [...parameters])?.stdout
}

/**
 * Prints a warn message.
 */
export function warn(prefix: string, message: string, ...args: any[]) {
  console.warn(
    colorette.bold(
      colorette.yellow(`(!) ${colorette.cyan(prefix)} ${message}`),
    ),
    ...args,
  )
}
