<?php

namespace Navigare\Ssr;

use Illuminate\Support\Collection;
use Navigare\Page;

interface Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Page $page): ?Response;
}
