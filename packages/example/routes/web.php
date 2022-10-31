<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Validator;
use Navigare\Navigare;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
  return redirect(route('vue.root'));
})->name('root');

// Vue
Route::as('vue.')
  ->prefix('vue')
  ->group(function () {
    Route::get('', function () {
      return redirect(route('vue.home'));
    })->name('root');

    Route::get('home/{name?}', function (string $name = 'Julian') {
      return Navigare::render('Home', [
        'greeting' => fn() => collect([
          'Hi',
          'Good day',
          'Hallo',
          'Salut',
          'Gruezi',
          'Servus',
          'Hola',
        ])
          ->random(1)
          ->first(),
        'name' => $name,
      ]);
    })->name('home');

    Route::get('redirect', function () {
      return redirect(route('vue.long'));
    })->name('redirect');

    Route::get('modal', function (string $name = 'Julian') {
      return Navigare::modal('Modal', [
        'name' => $name,
      ])->extends(
        route('vue.home', [
          'name' => $name,
        ])
      );
    })->name('modal');

    Route::get('second-modal', function (string $name = 'Julian') {
      return Navigare::modal('SecondModal', [
        'name' => $name,
      ])->extends(
        route('vue.home', [
          'name' => $name,
        ])
      );
    })->name('second-modal');

    Route::as('nested.')
      ->prefix('nested')
      ->group(function () {
        Route::get('', function () {
          return Navigare::render('nested/Index', [])
            ->layout('nested')
            ->navigation('partials/Navigation');
        })->name('index');

        Route::get('details/{id}', function (string $id) {
          return Navigare::render('nested/Details', [
            'id' => $id,
          ])
            ->layout('nested')
            ->navigation('partials/Navigation');
        })->name('details');
      });

    Route::get('long', function () {
      return Navigare::render('Long', []);
    })->name('long');

    Route::get('form', function () {
      return Navigare::render('Form', []);
    })->name('form');

    Route::post('form', function (Request $request) {
      $validator = Validator::make($request->all(), [
        'name' => 'required|between:8,20',
      ]);

      if ($validator->fails()) {
        return back()->withErrors($validator);
      }

      return redirect(
        route('vue.home', [
          'name' => $request->input('name'),
        ])
      );
    })->name('form.submit');
  });
