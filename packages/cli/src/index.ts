import { getVersion } from './internals.js'
import { serve } from '@navigare/ssr'
import * as commander from 'commander'
import path from 'path'

const program = new commander.Command().version(getVersion())

program
  .command('serve')
  .description('Run server and render pages.')
  .argument('<string>', 'path to input file', (file) => {
    return path.join(process.cwd(), file)
  })
  .option('-m, --manifest <char>', 'path to manifest file', (file) => {
    return path.join(process.cwd(), file)
  })
  .option('-p, --port <number>', 'port number', '13714')
  .action(async function (input) {
    const { port, manifest } = this.opts()

    const { printUrls } = await serve({
      input,
      manifest,
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
        error: (message) => {
          console.error(message)
        },
      },
    })

    printUrls()
  })

export default program
