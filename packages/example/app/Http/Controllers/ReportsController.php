<?php

namespace App\Http\Controllers;

use Navigare\Navigare;

class ReportsController extends Controller
{
  public function index()
  {
    return Navigare::render('reports/Index')->withLeft('reports/Sidebar');
  }

  public function show(string $name)
  {
    return Navigare::render('reports/Show')->withLeft('reports/Sidebar');
  }

  public function settings()
  {
    return Navigare::withModal('reports/Settings')->extends(
      route('reports.index')
    );
  }
}
