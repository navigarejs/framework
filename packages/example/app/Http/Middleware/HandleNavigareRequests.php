<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Navigare\Response as NavigareResponse;

class HandleNavigareRequests extends \Navigare\Middleware
{
  /**
   * Extend response, i.e. with shared fragments.
   *
   * @see https://navigarejs.github.io/framework/
   * @param  \Illuminate\Http\Request  $request
   * @param  \Navigare\Response  $response
   * @return array|void
   */
  public function share(Request $request, NavigareResponse $response): void
  {
    $response->withFallbackHeader('partials/Header', [
      'time' => Carbon::now(),
    ]);

    $response->with([
      'user' => Auth::user(),

      'breadcrumbs' => \Diglactic\Breadcrumbs\Breadcrumbs::generate(),

      'flash' => function () use ($request) {
        return [
          'success' => $request->session()->get('success'),
          'error' => $request->session()->get('error'),
        ];
      },
    ]);
  }
}
