<?php

namespace App\Http\Controllers;

use App\Http\Requests\Users\StoreRequest;
use App\Http\Requests\Users\UpdateRequest;
use App\Models\User;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Navigare\Navigare;

class UsersController extends Controller
{
  public function index()
  {
    return Navigare::render('users/Index', [
      'filters' => Request::all('search', 'role', 'trashed'),
      'users' => Auth::user()
        ->account->users()
        ->orderBy('updated_at', 'DESC')
        ->filter(Request::only('search', 'role', 'trashed'))
        ->get()
        ->transform(
          fn($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'owner' => $user->owner,
            'photo' => $user->photo_path
              ? URL::route('image', [
                'path' => $user->photo_path,
                'w' => 40,
                'h' => 40,
                'fit' => 'crop',
              ])
              : null,
            'deleted_at' => $user->deleted_at,
          ]
        ),
    ]);
  }

  public function create()
  {
    return Navigare::withModal('users/Create')->extends(route('users.index'));
  }

  public function store(StoreRequest $request)
  {
    Auth::user()
      ->account->users()
      ->create([
        ...$request->safe()->except(['photo']),
        'photo_path' => Request::file('photo')
          ? Request::file('photo')->store('users')
          : null,
      ]);

    return Redirect::route('users.index')->with('success', 'User created.');
  }

  public function edit(User $user)
  {
    return Navigare::render('users/Edit', [
      'user' => [
        'id' => $user->id,
        'first_name' => $user->first_name,
        'last_name' => $user->last_name,
        'email' => $user->email,
        'owner' => $user->owner,
        'photo' => $user->photo_path
          ? URL::route('image', [
            'path' => $user->photo_path,
            'w' => 60,
            'h' => 60,
            'fit' => 'crop',
          ])
          : null,
        'deleted_at' => $user->deleted_at,
      ],
    ]);
  }

  public function update(UpdateRequest $request, User $user)
  {
    if ($user->isDemoUser()) {
      return Redirect::back()->with(
        'error',
        'Updating the demo user is not allowed.'
      );
    }

    $user->update(
      $request->safe()->only(['first_name', 'last_name', 'email', 'owner'])
    );

    if (Request::has('photo')) {
      if (Request::file('photo')) {
        $user->update(['photo_path' => Request::file('photo')->store('users')]);
      } else {
        $user->update(['photo_path' => null]);
      }
    }

    if (Request::get('password')) {
      $user->update(['password' => $request->validated('password')]);
    }

    return Redirect::back()->with('success', 'User updated.');
  }

  public function destroy(User $user)
  {
    if (App::environment('demo') && $user->isDemoUser()) {
      return Redirect::back()->with(
        'error',
        'Deleting the demo user is not allowed.'
      );
    }

    $user->delete();

    return Redirect::back()->with('success', 'User deleted.');
  }

  public function restore(User $user)
  {
    $user->restore();

    return Redirect::back()->with('success', 'User restored.');
  }
}
