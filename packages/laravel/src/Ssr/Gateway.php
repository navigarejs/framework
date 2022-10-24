<?php

namespace Jaulz\Navigare\Ssr;

use Illuminate\Support\Collection;

interface Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Collection  $page
   * @return Response|null
   */
  public function dispatch(Collection $page): ?Response;
}
