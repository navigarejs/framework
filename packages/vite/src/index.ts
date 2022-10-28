import { getConfiguration } from './configuration'
import { getRoutes, writeTypes } from './routes'
import { Options, Adapter, Configuration, Plugin } from './types'
import generate from '@babel/generator'
import { parse } from '@babel/parser'
import traverse, { NodePath } from '@babel/traverse'
import {
  isImportSpecifier,
  isIdentifier,
  isCallExpression,
  identifier,
  isStringLiteral,
  isMemberExpression,
  CallExpression,
  callExpression,
  Expression,
  ArgumentPlaceholder,
  JSXNamespacedName,
  SpreadElement,
  Program,
  importDeclaration,
  importSpecifier,
  stringLiteral,
} from '@babel/types'
import { RawRoutes, throwError } from '@navigare/core'
import { Server as SSRServer, serveSSR } from '@navigare/ssr'
import makeDebugger from 'debug'
import defaultsDeep from 'lodash.defaultsdeep'
import { createRequire } from 'module'
import path from 'path'
import { createLogger, loadEnv, Logger } from 'vite'

const require = createRequire(import.meta.url)

const debug = makeDebugger('navigare:laravel:index')

export default function createNavigarePlugin(options: Options = {}): Plugin {
  defaultsDeep(options, {
    routes: Adapter.Laravel,
    configuration: Adapter.Laravel,
    interval: 15000,
  })
  let currentRoutes: RawRoutes | null = null
  let currentConfiguration: Configuration | null = null
  let ssr = false
  let ssrServer: SSRServer | undefined = undefined
  let logger: Logger | undefined = undefined

  return {
    name: 'navigare',

    enforce: 'post',

    buildEnd() {
      // Nothing yet
    },

    closeBundle() {
      // Nothing yet
    },

    async config(configuration, { mode, command }) {
      const serving = command === 'serve'

      // Create logger
      logger = createLogger(configuration.logLevel, {
        allowClearScreen: configuration.clearScreen,
        customLogger: configuration.customLogger,
        prefix: 'navigare',
      })

      // Enable manifest
      configuration.build = {
        ...configuration.build,
        manifest: true,
      }

      // Set SSR mode
      ssr = !!configuration.build?.ssr
      debug('set SSR mode to %s', ssr)

      // Update SSR config
      if (ssr) {
        configuration.ssr = configuration.ssr || {}
        configuration.ssr.external = [
          ...(configuration.ssr?.external || []),

          ...(serving
            ? [
                // Core
                ...[
                  'lodash.clonedeep',
                  'lodash.debounce',
                  'lodash.get',
                  'lodash.isarray',
                  'lodash.isequal',
                  'lodash.isboolean',
                  'lodash.isfunction',
                  'lodash.isnumber',
                  'lodash.isobject',
                  'lodash.isstring',
                  'lodash.issymbol',
                  'lodash.merge',
                  'lodash.uniq',
                ],
                // Vue3
                ...['vue', 'lodash.isequal'],
              ]
            : []),
        ]
      }

      // Loads .env
      const env = loadEnv(mode, process.cwd(), '')

      // Read routes regularly in case no routes were provided
      const updateRoutes = async () => {
        try {
          currentRoutes = await getRoutes(options, env)
          debug('read routes: %O', currentRoutes)

          // Write types
          if (currentRoutes) {
            // await writeTypes(currentConfiguration?.types.path, currentRoutes)
            await writeTypes(
              path.join(
                require.resolve('@navigare/core'),
                '..',
                '..',
                'routes.d.ts',
              ),
              currentRoutes,
            )
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message)
          }
        }

        // Update routes in a while again
        const interval = Number(options.interval)
        if (serving && interval > 0) {
          setTimeout(updateRoutes, interval)
        }
      }
      await updateRoutes()

      // Read configuration regularly in case no routes were provided
      const updateConfiguration = async () => {
        try {
          currentConfiguration = await getConfiguration(options, env)
          debug('read configuration: %O', currentConfiguration)
        } catch (error) {
          if (error instanceof Error) {
            console.error(error.message)
          }
        }

        // Update configuration in a while again
        const interval = Number(options.interval)
        if (serving && interval > 0) {
          setTimeout(updateConfiguration, interval)
        }
      }
      await updateConfiguration()
    },

    async configureServer(server) {
      // In case we are already in SSR mode, we don't need to start the server
      if (ssr) {
        // Catch uncaught exceptions
        process.on('uncaughtException', (error) => {
          logger?.error(
            `We observed an uncaught exception. Did you try to access a global variable like "window" which is not available in Node environment?
    ${error.stack}`,
            {
              clear: true,
              timestamp: true,
              error: error,
            },
          )
        })

        return
      }

      // Start SSR server
      debug('serving SSR at %s', currentConfiguration?.ssr.port)
      ssrServer = await serveSSR({
        logger,
        port: currentConfiguration?.ssr.port,
      })

      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          ssrServer?.printUrls()
        }, 25)
      })
    },

    async transform(code: string, id: string) {
      if (!code.includes('route')) {
        return
      }

      if (id.includes('node_modules')) {
        return
      }

      // Parse code
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
      })

      let changed = false
      const replaceArgumentWithRoute = (routeCall: CallExpression) => {
        if (!isStringLiteral(routeCall.arguments[0])) {
          /*console.log(routeCall)
          throwError(
            'the first parameter of "route" function must be a string literal',
            routeCall.arguments,
          )*/
          return
        }

        const routeName = routeCall.arguments[0].value
        const route = currentRoutes?.[routeName]
        if (!route) {
          throwError(`"${routeName}" is not a valid route name`)
        }

        routeCall.arguments[0] = identifier(
          JSON.stringify(currentRoutes![routeCall.arguments[0].value]),
        )
        changed = true
      }
      const replaceWithRouteCall = (
        program: NodePath<Program>,
        path: NodePath,
        args: (
          | Expression
          | ArgumentPlaceholder
          | JSXNamespacedName
          | SpreadElement
        )[],
      ) => {
        const routeIdentifier = program.scope.generateUidIdentifier('route')
        const [importDeclarationPath] = program.unshiftContainer(
          'body',
          importDeclaration(
            [importSpecifier(routeIdentifier, identifier('route'))],
            stringLiteral('@navigare/core'),
          ),
        )
        program.scope.registerDeclaration(importDeclarationPath)

        const binding = program.scope.getBinding(routeIdentifier.name)
        const [routeCallExpressionPath] = path.replaceWith(
          callExpression(routeIdentifier, args),
        )
        binding?.reference(routeCallExpressionPath.get('callee'))

        // Remember that we changed something, so we can output the new formatted AST later
        changed = true
      }

      traverse(ast, {
        Program(path) {
          const program = path

          // Turn special cases into route(...) calls:
          // - _ctx.route(...)
          // - $setup.route(...)
          // - __unref(route)(...)
          const objectIdentifierNames = ['_ctx', '$setup']
          const calleeIdentifierNames = ['_unref']
          const propertyIdentifierNames = ['route']

          traverse(ast, {
            CallExpression(path) {
              const { callee } = path.node

              // Member expressions like _ctx.route(...) or $setup.route(...)
              if (isMemberExpression(callee)) {
                if (!isIdentifier(callee.object)) {
                  return
                }

                if (!isIdentifier(callee.property)) {
                  return
                }

                if (!objectIdentifierNames.includes(callee.object.name)) {
                  return
                }

                if (!propertyIdentifierNames.includes(callee.property.name)) {
                  return
                }

                replaceWithRouteCall(program, path, path.node.arguments)
                return
              }

              // Call expressions like __unref(route)(...)
              if (isCallExpression(callee)) {
                if (!isIdentifier(callee.callee)) {
                  return
                }

                if (!calleeIdentifierNames.includes(callee.callee.name)) {
                  return
                }

                if (!isIdentifier(callee.arguments[0])) {
                  return
                }

                if (
                  !propertyIdentifierNames.includes(callee.arguments[0].name)
                ) {
                  return
                }

                replaceWithRouteCall(program, path, path.node.arguments)
                return
              }
            },
          })

          // Catch function calls like route(...)
          traverse(ast, {
            ImportDeclaration(path) {
              const { specifiers, source } = path.node

              if (source.value !== '@navigare/core') {
                return
              }

              // Check if the route function was imported
              const routeIdentifiers = specifiers
                .map((specifier) => {
                  if (!isImportSpecifier(specifier)) {
                    return null
                  }

                  if (!isIdentifier(specifier.imported)) {
                    return null
                  }

                  if (specifier.imported.name !== 'route') {
                    return null
                  }

                  return specifier.local.name
                })
                .filter((identifier): identifier is string => !!identifier)

              for (const routeIdentifier of routeIdentifiers) {
                const binding = program.scope?.getBinding(routeIdentifier)
                for (const reference of binding?.referencePaths ?? []) {
                  if (!isCallExpression(reference.parent)) {
                    return
                  }

                  replaceArgumentWithRoute(reference.parent)
                }
              }
            },
          })
        },
      })

      if (!changed) {
        return
      }

      // Return updated code
      const updatedCode = generate(ast, {}, code).code

      return updatedCode
    },
  }
}
