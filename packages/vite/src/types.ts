import { RawRoutes } from '@navigare/core'
import { Plugin as VitePlugin } from 'vite'

export type Plugin = VitePlugin & {}

export enum Adapter {
  Laravel,
}

export type Configuration = {
  ssr: {
    enabled: boolean
    protocol: string
    port: number
    host: string
    timeout: number
    input: string
    manifest: string
  }
  client: {
    manifest: string
  }
  components: {
    path: string
    default_extension: string
  }
  testing: {
    ensure_pages_exist: boolean
  }
}

export interface CommandsConfiguration {
  artisan: Record<string, string[]> | string[]
  shell: Record<string, string[]> | string[]
}

export interface Options {
  /**
   * Source of routes and configuration.
   */
  routes?: Adapter | RawRoutes | string

  /**
   * Interval that determines how often the routes will be refreshed.
   */
  interval?: number | false

  /**
   * Path to PHP executable.
   */
  php?: string

  /**
   * A configuration object or a path to a configuration file.
   * Setting to false disables reading the configuration file path from the `CONFIG_PATH_NAVIGARE` environment variable.
   */
  configuration?: Adapter | Configuration | string

  /**
   * Whether to allow overrides from the base configuration. If false, base
   * options will be ignored, so stuff like `--host 0.0.0.0` won't work.
   *
   * @default true
   */
  allowOverrides?: boolean

  /**
   * List of file changes to listen to.
   */
  watch?: WatchInput[] | WatchOptions
}

export interface WatchOptions {
  reloadOnBladeUpdates?: boolean
  reloadOnControllerUpdates?: boolean
  reloadOnConfigUpdates?: boolean
  input?: WatchInput[]
}

export interface WatchInputHandlerParameters {
  file: string
}

export interface WatchInput {
  condition: (file: string) => boolean
  handle: (parameters: WatchInputHandlerParameters) => void
}

export interface PhpFinderOptions {
  /**
   * Actual path to PHP. This will be used instead of
   */
  path?: string

  /**
   * Custom environment variables.
   */
  env?: any

  /**
   * Either `production` or `development`. Used for loading the environment.
   */
  mode?: string
}
