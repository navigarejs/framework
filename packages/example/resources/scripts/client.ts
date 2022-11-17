import createApp from './createApp'
import { mountApp } from '@navigare/vue3'

createApp().then((app) => {
  mountApp(app)
})
