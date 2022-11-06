<?php

namespace App\Http\Controllers;

use Navigare\Navigare;

class ReportsController extends Controller
{
  public function index()
  {
    return Navigare::render('Reports/Index');
  }
}
