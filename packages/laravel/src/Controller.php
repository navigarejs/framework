<?php

namespace Navigare;

use Illuminate\Http\Request;

class Controller
{
  public function __invoke(Request $request, string $parameter): Response
  {
    return Navigare::render(
      $request->route()->defaults['component'],
      $request->route()->defaults['props']
    );
  }
}
