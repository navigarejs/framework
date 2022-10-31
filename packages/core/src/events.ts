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

export const createErrorEvent: EventTrigger<'error'> = (visit, errors) => {
  return createEvent('error', { detail: { visit, errors } })
}

export const createExceptionEvent: EventTrigger<'exception'> = (
  visit,
  exception,
) => {
  return createEvent('exception', {
    cancelable: true,
    detail: { visit, exception },
  })
}

export const createFinishEvent: EventTrigger<'finish'> = (visit) => {
  return createEvent('finish', { detail: { visit } })
}

export const createInvalidEvent: EventTrigger<'invalid'> = (
  visit,
  response,
) => {
  return createEvent('invalid', {
    cancelable: true,
    detail: { visit, response },
  })
}

export const createNavigateEvent: EventTrigger<'navigate'> = (
  page,
  pages,
  pageIndex,
  replace,
) => {
  return createEvent('navigate', {
    detail: { visit: page.visit, page, pages, pageIndex, replace },
  })
}

export const createProgressEvent: EventTrigger<'progress'> = (
  visit,
  progress,
) => {
  return createEvent('progress', { detail: { visit, progress } })
}

export const createStartEvent: EventTrigger<'start'> = (visit) => {
  return createEvent('start', { detail: { visit } })
}

export const createSuccessEvent: EventTrigger<'success'> = (visit, page) => {
  return createEvent('success', { detail: { visit, page } })
}
