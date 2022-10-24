import { route } from '@navigare/core'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Component',

  setup() {
    const rawRoute = route('welcome' as never)

    return {
      rawRoute,
    }
  },

  render(props: any) {
    return (
      <>
        <div>Hello World</div>
        <div>{props.rawRoute}</div>
        <div>{route('welcome' as never)}</div>
      </>
    )
  },
})
