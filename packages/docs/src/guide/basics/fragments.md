# Fragments

A [Page](/guide/basics/pages) like we mentioned it before is technically just a `Fragment` with the name `default`. However, there are scenarios when you want to have a persistent header, a side bar or modals. These have their own properties and need to be rendered to different positions within the [Layout](/guide/basics/layouts),

## Responses

If you want to render a component to a different fragment, you have two possibilities. Either you use `withFragment` and pass the name of the fragment as the first parameter, or you use the dynamic approach where you can call `with{NameOfFragment}`, e.g. `withModal`. And then you can pass the properties as the next parameter that are relevant for the fragment only. If you want to share properties across all fragments, you can use the `with` method like below.

```php
use Navigare\Navigare;

class EventsController extends Controller
{
  public function show(Event $event)
  {
    // The responses below render exactly the same,
    // let's start with the short one:
    $response = Navigare::render('Event/Show', [
      'attachments' => $event->attachments->only('id', 'title'),
    ])
      ->withSidebar('Event/Sidebar', [
        'participants' => $event->participants->only('id', 'name'),
      ])
      ->with([
        'event' => $event->only('id', 'title', 'start_date', 'description'),
      ]);

    // This one uses `withFragment` and is the longer approach:
    $response = Navigare::withFragment('default', 'Event/Show', [
      'attachments' => $event->attachments->only('id', 'title'),
    ])
      ->withFragment('sidebar', 'Event/Sidebar', [
        'participants' => $event->participants->only('id', 'name'),
      ])
      ->with([
        'event' => $event->only('id', 'title', 'start_date', 'description'),
      ]);

    return $response;
  }
}
```

## Shared fragments

Sometimes you need persistent fragments like a Header that should not be mounted on every page load. You can use the `extend` method in middleware to define these.

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Navigare\Response as NavigareResponse;

class HandleNavigareRequests extends \Navigare\Middleware
{
  public function extend(Request $request, NavigareResponse $response): void
  {
    $response->withHeader('partials/Header', [
      'time' => Carbon::now(),
    ]);
  }
}
```

## Rendering fragments

We only saw how to define these fragments on the server side but in order to see how these are rendered on the client please have a look at [Layouts](/guide/basics/layouts).
