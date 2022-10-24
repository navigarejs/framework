import { App } from './types'
// import { SSRContext } from 'vue'

export default async function mountApp({ id, app }: App): Promise<void> {
  app.mount(`#${id}`)
}
