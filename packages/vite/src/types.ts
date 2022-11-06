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
   * Interval that determines how often the routes and configuration will be refreshed.
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
   * Defines the build ID that will be used as a base to generate
   * deterministic chunk names.
   */
  buildId?: string | number
}

export interface ResolvedOptions {
  /**
   * Source of routes and configuration.
   */
  routes: Adapter | RawRoutes | string

  /**
   * Interval that determines how often the routes and configuration will be refreshed.
   */
  interval: number | false

  /**
   * Path to PHP executable.
   */
  php?: string

  /**
   * A configuration object or a path to a configuration file.
   * Setting to false disables reading the configuration file path from the `CONFIG_PATH_NAVIGARE` environment variable.
   */
  configuration: Adapter | Configuration | string

  /**
   * Defines the build ID that will be used as a base to generate
   * deterministic chunk names.
   */
  buildId: string | number
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
