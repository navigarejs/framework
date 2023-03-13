import { getVersion } from './internals.js'
import { isDefined } from '@navigare/core'
import { serve } from '@navigare/ssr'
import { LogOptions } from '@navigare/ssr'
import colorette from 'colorette'
import * as commander from 'commander'

const program = new commander.Command().version(getVersion())

const log = (message: string, options: LogOptions = {}) => {
  const now = new Date()
  const time = options.timestamp
    ? `${colorette.grey(
        now.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        }),
      )} ${colorette.white(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        }),
      )}`
    : ''

  console.log([time, message].filter(isDefined).join(' '))
}

program
  .command('serve')
  .description('Run server and offer endpoint to render pages.')
  .option('-p, --port <number>', 'port number', '13715')
  .action(async function () {
    const { port } = this.opts()

    const { printUrls } = await serve({
      port: Number(port),
      logger: {
        info: (message, options) => {
          log(message, options)
        },
        warn: (message, options) => {
          log(message, options)
        },
        warnOnce: (message, options) => {
          log(message, options)
        },
        error: (message, options) => {
          if (options?.error) {
            log(options?.error.stack || options?.error.message, options)
            return
          }

          log(message, options)
        },
      },
    })

    printUrls()
  })

export default program
