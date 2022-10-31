<?php

use Navigare\RawRoutes;

if (!function_exists('navigare')) {
  /**
   * Access Navigare via helper.
   *
   * @param  null|string  $component
   * @param  array|\Illuminate\Contracts\Support\Arrayable  $props
   * @return \Navigare\ResponseFactory|\Navigare\Response
   */
  function navigare($component = null, $props = [])
  {
    $instance = \Navigare\Navigare::getFacadeRoot();

    if ($component) {
      return $instance->render($component, $props);
    }

    return $instance;
  }
}

if (!function_exists('rawRoute')) {
  /**
   * Get raw route via helper.
   *
   * @param Route|string $route
   * @return ?mixed
   */
  function rawRoute($route)
  {
    return RawRoutes::get($route);
  }
}
