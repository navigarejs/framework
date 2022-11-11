import { ContextOf } from './types'
import { Page } from '@navigare/core'
import { InjectionKey, provide } from 'vue'

export const PageFragmentContext: InjectionKey<{
  name: string | null
  properties: Page['properties'] & Record<string, any>
  rawRoute: Page['rawRoute']
  parameters: Page['parameters']
  defaults: Page['defaults']
  location: Page['location']
}> = Symbol('PageFragmentContext')

export default function providePageFragmentContext(
  context: ContextOf<typeof PageFragmentContext>,
): ContextOf<typeof PageFragmentContext> {
  // Provide context
  provide(PageFragmentContext, context)

  return context
}
