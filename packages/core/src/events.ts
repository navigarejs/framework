import { Event, EventDetails, EventNames, EventTrigger } from './types'

export const createEvent = <TEventName extends EventNames>(
  name: TEventName,
  options: CustomEventInit<EventDetails<TEventName>>,
): Event<TEventName> => {
  return new CustomEvent(name, {
    ...options,
    detail: Object.freeze(options.detail),
  })
}

export const createBeforeEvent: EventTrigger<'before'> = (visit) => {
  return createEvent('before', { cancelable: true, detail: { visit } })
}

export const createCancelEvent: EventTrigger<'cancel'> = (visit) => {
  return createEvent('cancel', { cancelable: true, detail: { visit } })
}

export const createErrorEvent: EventTrigger<'error'> = (errors) => {
  return createEvent('error', { detail: { errors } })
}

export const createExceptionEvent: EventTrigger<'exception'> = (exception) => {
  return createEvent('exception', { cancelable: true, detail: { exception } })
}

export const createFinishEvent: EventTrigger<'finish'> = (visit) => {
  return createEvent('finish', { detail: { visit } })
}

export const createInvalidEvent: EventTrigger<'invalid'> = (response) => {
  return createEvent('invalid', { cancelable: true, detail: { response } })
}

export const createNavigateEvent: EventTrigger<'navigate'> = (
  page,
  pages,
  pageIndex,
  replace,
) => {
  return createEvent('navigate', {
    detail: { page, pages, pageIndex, replace },
  })
}

export const createProgressEvent: EventTrigger<'progress'> = (progress) => {
  return createEvent('progress', { detail: { progress } })
}

export const createStartEvent: EventTrigger<'start'> = (visit) => {
  return createEvent('start', { detail: { visit } })
}

export const createSuccessEvent: EventTrigger<'success'> = (page) => {
  return createEvent('success', { detail: { page } })
}
