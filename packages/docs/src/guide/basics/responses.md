# Responses

In your controller, provide both the name of the JavaScript page component, as well as any properties for the page.

In this example we're passing a single prop, called event, which contains four attributes (`id`, `title`, `start_date` and `description`) to the `Event/Show` page component.

```php
<?php

use Navigare\Navigare;

class EventsController extends Controller
{
  public function show(Event $event)
  {
    return Navigare::render('Event/Show', [
      'event' => $event->only('id', 'title', 'start_date', 'description'),
    ]);

    // Alternatively, you can use the navigare() helper
    return navigare('Event/Show', [
      'event' => $event->only('id', 'title', 'start_date', 'description'),
    ]);
  }
}
```

To make an Navigare response, use the Navigare render function. This method takes the component name, and allows you to pass properties. To ensure that pages load quickly, only return the minimum data required for the page.

:::warning
Be aware that all data returned from the controllers will be visible client-side, so be sure to omit sensitive information.
:::

## Root template data

There are situations where you may want to access the page in your root Blade template. The page instance is available via the `$page` variable.

## Maximum response size

To enable client-side history navigation, all Navigare server responses are stored in the browser's history state. It's good to be aware that some browsers impose a size limit on how much data can be saved there. For example, [Firefox](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) has a size limit of 640k characters (and throws a _NS_ERROR_ILLEGAL_VALUE_ error if you exceed it). This is generally much more than you'll ever need, but it's good to be aware of this when building an Navigare application.
