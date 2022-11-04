import { Page, RenderedApp } from '@navigare/core'
import { Express } from 'express-serve-static-core'
import { ViteDevServer, LogOptions, LogErrorOptions, Manifest } from 'vite'

export interface Server {
  app: Express
  restart: () => Promise<void>
  printUrls: () => void
}

export interface Logger {
  info(msg: string, options?: LogOptions): void
  warn(msg: string, options?: LogOptions): void
  warnOnce(msg: string, options?: LogOptions): void
  error(msg: string, options?: LogErrorOptions): void
}

export type RenderApp = (
  page: Page,
  manifest: Manifest,
  vite?: ViteDevServer,
) => Promise<RenderedApp>
