import { Express } from 'express-serve-static-core'
import { ViteDevServer, LogOptions, LogErrorOptions } from 'vite'

export interface Server {
  app: Express
  vite: ViteDevServer | undefined
  restart: () => Promise<void>
  printUrls: () => void
}

export interface Options {
  input: string
  host: string
  port: number
  logger: Logger
  id: string
  htmlAttrs: string
  headTags: string
  bodyAttrs: string
  bodyTags: string
}

export interface Logger {
  info(msg: string, options?: LogOptions): void
  warn(msg: string, options?: LogOptions): void
  warnOnce(msg: string, options?: LogOptions): void
  error(msg: string, options?: LogErrorOptions): void
}
