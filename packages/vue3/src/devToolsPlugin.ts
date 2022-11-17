import { FragmentContext } from './contexts/provideFragmentContext'
import { RouterContext } from './contexts/provideRouterContext'
import { ContextOf } from './types'
import { Router } from '@navigare/core'
import { setupDevtoolsPlugin } from '@vue/devtools-api'
import type { DefineComponent, Plugin } from 'vue'

const label = 'Navigare'

const textColor = 0x000000

const backgroundColor = 0xfc5c7d

const plugin: Plugin = {
  install(root) {
    setupDevtoolsPlugin(
      {
        id: 'navigare/vue3',
        label,
        packageName: 'navigare/vue3',
        homepage: 'https://navigarejs.github.io/framework/',
        app: root as any,
        enableEarlyProxy: true,
      },
      (api) => {
        // Highlight components
        api.on.visitComponentTree(({ treeNode, componentInstance }) => {
          if (!componentInstance.type.navigare) {
            return
          }

          treeNode.tags.push({
            label,
            textColor,
            backgroundColor,
          })
        })

        // Expose information about internal state
        api.on.inspectComponent(({ componentInstance, instanceData }) => {
          // Router
          if ((RouterContext as any) in componentInstance.provides) {
            const context = componentInstance.provides[
              RouterContext as any
            ] as ContextOf<typeof RouterContext>

            instanceData.state.push({
              type: label,
              key: 'location',
              value: context.router.location,
              editable: false,
            })

            instanceData.state.push({
              type: label,
              key: 'page',
              value: context.router.page,
              editable: false,
            })
          }

          // Page fragment
          if ((FragmentContext as any) in componentInstance.provides) {
            const context = componentInstance.provides[
              FragmentContext as any
            ] as ContextOf<typeof FragmentContext>

            instanceData.state.push({
              type: label,
              key: 'fragment',
              value: context,
              editable: false,
            })
          }
        })

        // Trace events
        const router = root.config.globalProperties
          .router as Router<DefineComponent> | null

        if (router) {
          const layerId = 'navigare'
          api.addTimelineLayer({
            id: layerId,
            color: backgroundColor,
            label,
          })

          // Listen to navigation events
          let groupId = 0
          for (const eventName of [
            'before',
            'start',
            'finish',
            'invalid',
            'navigate',
            'progress',
            'error',
            'success',
            'cancel',
            'exception',
          ] as const) {
            router.on(eventName, (event) => {
              api.addTimelineEvent({
                layerId,
                event: {
                  time: Date.now(),
                  data: event.detail,
                  logType:
                    eventName === 'exception'
                      ? 'error'
                      : eventName === 'error'
                      ? 'warning'
                      : 'default',
                  title: event.type,
                  groupId,
                },
              })

              // Once the visit is finished, we create a new group id
              // Note: we cannot use visitId because it would duplicate events
              // during back navigations (i.e. the same visit id)
              if (eventName === 'finish') {
                groupId++
              }
            })
          }
        }
      },
    )
  },
}

export default plugin
