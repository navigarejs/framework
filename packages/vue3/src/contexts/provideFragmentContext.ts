import { ContextOf } from './../types'
import { Page } from '@navigare/core'
import { InjectionKey, provide } from 'vue'

export const FragmentContext: InjectionKey<{
  name: string | null
  properties: Page['properties'] & Record<string, any>
  rawRoute: Page['rawRoute']
  parameters: Page['parameters']
  defaults: Page['defaults']
  location: Page['location']
}> = Symbol('FragmentContext')

export default function provideFragmentContext(
  context: ContextOf<typeof FragmentContext>,
): ContextOf<typeof FragmentContext> {
  // Provide context
  provide(FragmentContext, context)

  return context
}
