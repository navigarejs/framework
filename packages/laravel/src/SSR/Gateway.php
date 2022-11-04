<?php

namespace Navigare\SSR;

use Illuminate\Http\Request;
use Navigare\View\Page;

interface Gateway
{
  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Request  $request
   * @param  Page  $page
   * @return Response|null
   */
  public function dispatch(Request $request, Page $page): Response|null;
}
