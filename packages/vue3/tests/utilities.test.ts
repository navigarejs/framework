import { getVNodeText } from '../src/utilities'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, render } from 'vue'

describe('getVNodeText', () => {
  it('returns text of built-in components', () => {
    const vnode = h('div', {}, 'Test')

    expect(getVNodeText(vnode)).toEqual('Test')

    expect(getVNodeText([vnode])).toEqual('Test')

    expect(getVNodeText(() => [vnode])).toEqual('Test')
  })

  it('returns text of nested components', () => {
    const vnode = h('div', {}, h('div', {}, 'Deep Test'))

    expect(getVNodeText(vnode)).toEqual('Deep Test')

    expect(getVNodeText([vnode])).toEqual('Deep Test')

    expect(getVNodeText(() => [vnode])).toEqual('Deep Test')
  })

  /*it('returns text of custom components', () => {
    const CustomComponent = defineComponent({
      props: {
        text: {
          type: String,
        },
      },

      setup(props) {
        return () => {
          return h('div', {}, props.text)
        }
      },
    })

    const vnode = h('div', {}, h(CustomComponent, { text: 'Custom Test' }))

    expect(getVNodeText(vnode)).toEqual('Custom Test')

    expect(getVNodeText([vnode])).toEqual('Custom Test')

    expect(getVNodeText(() => [vnode])).toEqual('Custom Test')
  })*/
})
