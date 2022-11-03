<?php

namespace Navigare\SSR;

use Navigare\View\Page;

interface Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Page $page): Response|null;
}
