<?php

namespace Jaulz\Navigare\Tests\Stubs;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Jaulz\Navigare\Ssr\Gateway;
use Jaulz\Navigare\Ssr\Response;

class FakeGateway implements Gateway
{
  /**
   * Tracks the number of times the 'dispatch' method was called.
   *
   * @var int
   */
  public $times = 0;

  /**
   * Dispatch the Navigare page to the Server Side Rendering engine.
   *
   * @param  Collection  $page
   * @return Response|null
   */
  public function dispatch(Collection $page): ?Response
  {
    $this->times++;

    if (!Config::get('navigare.ssr.enabled', false)) {
      return null;
    }

    return new Response(
      "<meta charset=\"UTF-8\" />\n<title navigare>Example SSR Title</title>\n",
      '<p>This is some example SSR content</p>'
    );
  }
}
