import { getVersion } from './internals.js'
import { serve } from '@navigare/ssr'
import * as commander from 'commander'

const program = new commander.Command().version(getVersion())

program
  .command('serve')
  .description('Run server and offer endpoint to render pages.')
  .option('-p, --port <number>', 'port number', '13715')
  .action(async function () {
    const { port } = this.opts()

    const { printUrls } = await serve({
      port: Number(port),
      logger: {
        info: (message) => {
          console.info(message)
        },
        warn: (message) => {
          console.warn(message)
        },
        warnOnce: (message) => {
          console.warn(message)
        },
        error: (message, { error } = {}) => {
          if (error) {
            console.error(error.stack)
          }

          console.error(message)
        },
      },
    })

    printUrls()
  })

export default program
