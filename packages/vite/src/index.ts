import { getConfiguration } from './configuration'
import { getRoutes, writeTypes } from './routes'
import { Options, Adapter, Configuration, Plugin } from './types'
import _generate from '@babel/generator'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import type { NodePath } from '@babel/traverse'
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
import { RawRoute, RawRoutes, throwError } from '@navigare/core'
import { Server as SSRServer, serveSSR } from '@navigare/ssr'
import crypto from 'crypto'
import makeDebugger from 'debug'
import getPort from 'get-port'
import globby from 'globby'
import cloneDeep from 'lodash.clonedeep'
import defaultsDeep from 'lodash.defaultsdeep'
import get from 'lodash.get'
import isArray from 'lodash.isarray'
import isObject from 'lodash.isobject'
import isString from 'lodash.isstring'
import { createRequire } from 'module'
import path from 'path'
import { ConfigEnv, createLogger, createServer, loadEnv, Logger } from 'vite'

// Annoying workaround to circumvent ESM/CJS confusion
// See: https://github.com/babel/babel/issues/13855#issuecomment-945123514
const traverse = (
  'default' in _traverse ? get(_traverse, 'default') : _traverse
) as typeof _traverse
const generate = (
  'default' in _generate ? get(_generate, 'default') : _generate
) as typeof _generate

const require = createRequire(import.meta.url)

const debug = makeDebugger('navigare:laravel:index')

export default function createNavigarePlugin(options: Options = {}): Plugin {
  defaultsDeep(options, {
    routes: Adapter.Laravel,
    configuration: Adapter.Laravel,
    interval: 15000,
  })
  let currentRoutes: RawRoutes = isObject(options.routes) ? options.routes : {}
  let currentConfiguration: Configuration | null = isObject(
    options.configuration,
  )
    ? options.configuration
    : null
  let currentComponents: string[] = []
  let ssr = false
  let ssrServer: SSRServer | undefined = undefined
  let logger: Logger | undefined = undefined
  let environment: ConfigEnv = {
    mode: 'production',
    command: 'build',
  }
  const currentUsedRoutes: Record<string, string[]> = {}
  const files: Record<string, string> = {}
  const buildId = Math.random().toString()
  const getChunkName = (name: string) => {
    const hash = crypto
      .createHash('md5')
      .update(`${buildId}-${name}`)
      .digest('hex')

    return `${hash}.mjs`
  }

  return {
    name: 'navigare',

    enforce: 'post',

    buildEnd() {
      // Nothing yet
    },

    closeBundle() {
      // Nothing yet
    },

    async config(configuration, _environment) {
      environment = _environment

      // Create logger
      logger = createLogger(configuration.logLevel, {
        allowClearScreen: configuration.clearScreen,
        customLogger: configuration.customLogger,
        prefix: 'navigare',
      })

      // Loads .env
      const env = loadEnv(environment.mode, process.cwd(), '')

      // Set SSR mode
      ssr = !!configuration.build?.ssr
      debug('set SSR mode to %s', ssr)

      // Read routes regularly in case no routes were provided
      const updateRoutes = async () => {
        try {
          currentRoutes = await getRoutes(options, env, ssr)
          debug('read routes: %O', currentRoutes)

          // Write types
          if (currentRoutes) {
            // await writeTypes(currentConfiguration?.types.path, currentRoutes)
            await writeTypes(
              path.join(
                require.resolve('@navigare/core'),
                '..',
                '..',
                'types',
                'routes.d.ts',
              ),
              currentRoutes,
            )
          }
        } catch (error) {
          if (error instanceof Error) {
            logger?.error(error.message)
          }
        }

        // Update routes in a while again
        const interval = Number(options.interval)
        if (environment.command === 'serve' && interval > 0) {
          setTimeout(updateRoutes, interval)
        }
      }
      await updateRoutes()

      // Read configuration regularly in case no configuration was provided
      const updateConfiguration = async () => {
        try {
          currentConfiguration = await getConfiguration(options, env)
          debug('read configuration: %O', currentConfiguration)
        } catch (error) {
          if (error instanceof Error) {
            logger?.error(error.message)
          }
        }

        // Update configuration in a while again
        const interval = Number(options.interval)
        if (environment.command === 'serve' && interval > 0) {
          setTimeout(updateConfiguration, interval)
        }
      }
      await updateConfiguration()

      // Read components regularly
      const updateComponents = async () => {
        try {
          currentComponents = await globby(
            `${currentConfiguration?.components.path}/**/*`,
          )
          debug('read components: %O', currentComponents)
        } catch (error) {
          if (error instanceof Error) {
            logger?.error(error.message)
          }
        }

        // Update components in a while again
        const interval = Number(options.interval)
        if (environment.command === 'serve' && interval > 0) {
          setTimeout(updateComponents, interval)
        }
      }
      await updateComponents()

      // Enable manifest and extend input with all the pages that were used
      const input = ssr
        ? currentConfiguration?.ssr.input
        : configuration.build?.rollupOptions?.input
      configuration.build = {
        ...configuration.build,
        ssr: ssr,
        rollupOptions: {
          ...configuration.build?.rollupOptions,
          input: Object.values({
            // Cast existing input into object
            ...(isArray(input)
              ? input.reduce((cumulatedInput, name) => {
                  return {
                    ...cumulatedInput,
                    [name]: name,
                  }
                }, {})
              : isObject(input)
              ? input
              : isString(input)
              ? {
                  [input]: input,
                }
              : {}),
          }),
          output: {
            ...configuration.build?.rollupOptions?.output,
            chunkFileNames: (chunkInfo) => {
              if (
                chunkInfo.type !== 'chunk' ||
                !chunkInfo.isEntry ||
                !chunkInfo.facadeModuleId
              ) {
                return '[name]-[hash].mjs'
              }

              const id = path.relative(process.cwd(), chunkInfo.facadeModuleId)
              return getChunkName(id)
            },
          },
        },
        manifest: true,
        // ssrManifest: true,
      }

      // Update SSR config
      if (ssr) {
        configuration.ssr = configuration.ssr || {}
        configuration.ssr.external = [
          ...(configuration.ssr?.external || []),

          ...(environment.command === 'serve'
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
    },

    async configureServer(server) {
      // In case we are already in SSR mode, we don't need to start the server
      if (ssr) {
        return
      }

      // Create SSR server
      const vite = await createServer({
        build: {
          ssr: true,
        },
        server: {
          middlewareMode: true,
          hmr: {
            port: await getPort(),
          },
        },
        appType: 'custom',
      })

      // Start SSR server
      debug('serving SSR at %s', currentConfiguration?.ssr.port)
      ssrServer = await serveSSR({
        logger,
        port: currentConfiguration?.ssr.port,
        vite,
      })

      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          ssrServer?.printUrls()
        }, 25)
      })
    },

    /*moduleParsed(module) {
      if (!module.isEntry) {
        return
      }

       module.dynamicImporters.push([
        "resources/scripts/pages/Home.vue",
       ]) 
    },*/

    buildStart() {
      // Include all possible components in final build
      if (environment.command === 'build') {
        for (const component of currentComponents) {
          files[component] = this.emitFile({
            type: 'chunk',
            id: component,
            preserveSignature: 'exports-only',
          })
        }
      }
    },

    async transform(code: string, id: string) {
      let updatedCode = code
      const usedRoutes: string[] = []

      // Only replace routes when the source code contains "route" and is not a module from node_modules
      if (code.includes('route') && !id.includes('node_modules')) {
        let manipulated = false

        // Parse code
        const ast = parse(updatedCode, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        })

        const replaceArgumentWithRoute = (routeCall: CallExpression) => {
          if (!isStringLiteral(routeCall.arguments[0])) {
            /*console.log(routeCall)
          throwError(
            'the first parameter of "route" function must be a string literal',
            routeCall.arguments,
          )*/
            return
          }

          // Extract route name
          const routeName = routeCall.arguments[0].value
          const rawRoute: RawRoute | undefined = cloneDeep(
            currentRoutes?.[routeName],
          )
          if (!rawRoute) {
            throwError(`"${routeName}" is not a valid route name`)
          }

          // Update path of used components based on the build manifest
          if (environment.command === 'build' && isObject(rawRoute)) {
            rawRoute.components = rawRoute.components?.map((component) => {
              return {
                ...component,
                path: getChunkName(component.path),
              }
            })
          }

          // Replace route name with the raw route
          routeCall.arguments[0] = identifier(JSON.stringify(rawRoute))

          // Remember that we used the route and also indicate that we manipulated the AST
          usedRoutes.push(routeName)
          manipulated = true
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
          manipulated = true
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

        if (manipulated) {
          updatedCode = generate(ast, {}).code
        }
      }

      // Remember all used routes per module
      currentUsedRoutes[id] = usedRoutes

      return updatedCode
    },
  }
}
