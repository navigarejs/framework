<?php

namespace App\Http\Controllers;

use Navigare\Navigare;

class DashboardController extends Controller
{
  public function index()
  {
    return Navigare::render('Dashboard/Index');
  }
}
