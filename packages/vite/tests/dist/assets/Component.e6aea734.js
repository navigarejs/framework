import {
  defineComponent,
  createVNode,
  Fragment,
  createTextVNode,
} from '../../../../../../node_modules/vue/dist/vue.runtime.esm-bundler.js'
import { route } from '@navigare/core'

defineComponent({
  name: 'Component',
  setup() {
    const rawRoute = route({
      name: 'welcome',
      uri: 'welcome/{name?}',
      method: 'GET',
      methods: ['GET', 'HEAD'],
      domain: 'navigare.test',
      bindings: { name: null },
      components: ['pages/Welcome.vue'],
    })
    return {
      rawRoute,
    }
  },
  render(props) {
    return createVNode(Fragment, null, [
      createVNode('div', null, [createTextVNode('Hello World')]),
      createVNode('div', null, [props.rawRoute]),
      createVNode('div', null, [
        route({
          name: 'welcome',
          uri: 'welcome/{name?}',
          method: 'GET',
          methods: ['GET', 'HEAD'],
          domain: 'navigare.test',
          bindings: { name: null },
          components: ['pages/Welcome.vue'],
        }),
      ]),
    ])
  },
})
