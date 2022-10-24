<?php

namespace Jaulz\Navigare;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\Facade;

/**
 * @method static void setRootView(string $name)
 * @method static void share($key, $value = null)
 * @method static void extend(Closure $callback)
 * @method static array getShared(string $key = null, $default = null)
 * @method static array flushShared()
 * @method static void version($version)
 * @method static int|string getVersion()
 * @method static LazyProp lazy(Closure $callback)
 * @method static Response render($component, array|Arrayable $props = [])
 * @method static \Symfony\Component\HttpFoundation\Response location(string $url)
 *
 * @see \Navigare\ResponseFactory
 */
class Navigare extends Facade
{
  protected static function getFacadeAccessor(): string
  {
    return ResponseFactory::class;
  }
}
