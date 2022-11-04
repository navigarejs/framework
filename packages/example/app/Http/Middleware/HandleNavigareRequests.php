<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Navigare\Response as NavigareResponse;

class HandleNavigareRequests extends \Navigare\Middleware
{
  /**
   * Extend response, i.e. with shared fragments.
   *
   * @see https://navigarejs.github.io/framework/extend-response
   * @param  \Illuminate\Http\Request  $request
   * @param  \Navigare\Response  $response
   * @return void
   */
  public function extend(Request $request, NavigareResponse $response): void
  {
    $response->header('partials/Header', [
      'time' => Carbon::now(),
    ]);
  }
}
