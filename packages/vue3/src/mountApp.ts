import { App } from './types'

export default async function mountApp({ id, root }: App): Promise<void> {
  root.mount(`#${id}`)
}
