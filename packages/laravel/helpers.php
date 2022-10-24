<?php

if (!function_exists('navigare')) {
  /**
   * Navigare helper.
   *
   * @param  null|string  $component
   * @param  array|\Illuminate\Contracts\Support\Arrayable  $props
   * @return \Navigare\ResponseFactory|\Navigare\Response
   */
  function navigare($component = null, $props = [])
  {
    $instance = \Jaulz\Navigare\Navigare::getFacadeRoot();

    if ($component) {
      return $instance->render($component, $props);
    }

    return $instance;
  }
}
