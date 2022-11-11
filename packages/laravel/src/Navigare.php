<?php

namespace Navigare;

use Closure;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Support\Facades\Facade;
use Navigare\View\DeferredProperty;
use Navigare\View\LazyProperty;

/**
 * @method static self setRootView(string $name)
 * @method static self rootView(string $name)
 * @method static self setConfiguration(string $name)
 * @method static Configuration getConfiguration()
 * @method static self setVersion(Closure|string|null $version)
 * @method static self version(Closure|string|null $version)
 * @method static string getVersion($version)
 * @method static self extend(Closure $callback)
 * @method static LazyProperty lazy(Closure $callback)
 * @method static DeferredProperty deferred(Closure $callback)
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
