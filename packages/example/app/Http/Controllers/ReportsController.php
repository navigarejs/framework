<?php

namespace App\Http\Controllers;

use Navigare\Navigare;

class ReportsController extends Controller
{
  public function index()
  {
    return Navigare::render('reports/Index')->left('reports/Sidebar');
  }

  public function show(string $name)
  {
    return Navigare::render('reports/Show')->left('reports/Sidebar');
  }
}
