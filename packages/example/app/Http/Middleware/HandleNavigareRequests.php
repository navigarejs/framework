<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Jaulz\Navigare\Response as NavigareResponse;

class HandleNavigareRequests extends \Jaulz\Navigare\Middleware
{
  /**
   * Sets the root template that's loaded on the first page visit.
   *
   * @see https://inertiajs.com/server-side-setup#root-template
   *
   * @param  Request  $request
   * @return string
   */
  public function getRootView(Request $request)
  {
    $route = $request->route();

    return Str::before($route->getName(), '.');
  }

  /**
   * Determines the current asset version.
   *
   * @see https://jaulz.github.io/navigare/asset-versioning
   * @param  \Illuminate\Http\Request  $request
   * @return string|null
   */
  public function version(Request $request): ?string
  {
    return parent::version($request);
  }

  /**
   * Extend response, i.e. with shared fragments.
   *
   * @see https://jaulz.github.io/navigare/extend-response
   * @param  \Illuminate\Http\Request  $request
   * @param  \Jaulz\Navigare\Response  $response
   * @return void
   */
  public function extend(Request $request, NavigareResponse $response): void
  {
    $response->header('partials/Header', [
      'time' => Carbon::now(),
    ]);
  }
}
