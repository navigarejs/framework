# Redirects

When making a non-GET Navigare request, via `<navigare-link>` or manually, be sure to always respond with a proper Navigare response.

For example, if you're creating a new user, have your "store" endpoint return a redirect back to a standard GET endpoint, such as your user index page.

Navigare will automatically follow this redirect and update the page accordingly. Here's a simplified example.

```php
<?php

use Navigare\Navigare;

class UsersController extends Controller
{
  public function index()
  {
    return Navigare::render('Users/Index', [
      'users' => User::all(),
    ]);
  }

  public function store()
  {
    User::create(
      Request::validate([
        'name' => ['required', 'max:50'],
        'email' => ['required', 'max:50', 'email'],
      ])
    );

    return Redirect::route('users.index');
  }
}
```

## 303 response code

Note, when redirecting after a `PUT`, `PATCH` or `DELETE` request you must use a 303 response code, otherwise the subsequent request will not be treated as a `GET` request. A 303 redirect is the same as a 302 except that the follow-up request is explicitly changed to a `GET` request.

If you're using one of our official server-side adapters, redirects will automatically be converted.

## External redirects

Sometimes it's necessary to redirect to an external website, or even another non-Inertia endpoint in your app, within an Inertia request. This is possible using a server-side initiated `window.location` visit.

```php
return Navigare::location($url);
```

This will generate a `409 Conflict` response, which includes the destination URL in the `X-Navigare-Location` header. Client-side, Navigare will detect this response and automatically do a `window.location = url` visit.
