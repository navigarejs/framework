# Server

The first step when installing Navigare is to configure your server-side framework. Navigare ships with an official server-side adapter for Laravel. Other adapters might come in the future as well.

## Install dependencies

Install the Navigare server-side adapters using the preferred package manager for that language or framework.

```sh
composer require navigare/laravel
```

## Root template

Next, setup the root template that will be loaded on the first page visit. This will be used to load your site assets (CSS and JavaScript), and will also insert all the different parts that were generated while your app was rendered. In total there are five different parts which can be accessed via the `@navigare` directive:

- `htmlAttrs` will contain attributes that should be added to the `html` tag
- `headTags` will contain tags that should be added within the `head` tag
- `bodyAttrs` will contain attributes that should be added to the `body` tag
- `bodyTags` will contain tags that should be added within the `body` tag

In summary, the template will look similar to this:

```html
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @navigare('htmlAttrs')>
  <head>
    @vite(['resources/scripts/client.ts'])

    @navigare('headTags')
  </head>
  <body @navigare('bodyAttrs')>
    @navigare

    @navigare('bodyTags')
  </body>
</html>
```

Note that we also use the new recommended Vite directive as well. It points to the input which should also be defined in the `vite.config.ts` (see [Client](/guide/installation/client#add-vite-plugin)).

By default the Laravel adapter will use the `app.blade.php` view. This template should include your assets, as well as the `@navigare` directives. If you'd like to use a different root view, you can change it using `Navigare::setRootView()`.

## Middleware

Next, publish the `HandleNavigareRequests` middleware to your application, which can be done using this artisan command:

```sh
php artisan navigare:middleware
```

Once generated, register the `\App\Http\Middleware\HandleNavigareRequests` middleware in your `App\Http\Kernel`, as the **last** item in your web middleware group.

This middleware provides a `version()` method for setting your asset version, and a `share()` method for setting shared properties. Please see those pages for more information.

Also, if you would like to use real-time validations, you should include
`\Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests` before.

## Creating responses

That's it, you're all ready to go server-side! From here you can start creating Navigare responses. See the responses page for more information.

```php
use Navigare\Navigare;

class EventsController extends Controller
{
  public function show(Event $event)
  {
    return Navigare::render('Event/Show', [
      'event' => $event->only('id', 'title', 'start_date', 'description'),
    ]);
  }
}
```
