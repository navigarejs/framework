<?php

namespace App\Http\Controllers;

use App\Http\Requests\Organizations\StoreRequest;
use App\Http\Requests\Organizations\UpdateRequest;
use App\Models\Organization;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Session;
use Navigare\Navigare;

class OrganizationsController extends Controller
{
  public function index()
  {
    return Navigare::render('organizations/Index', [
      'filters' => Request::all('search', 'trashed'),
      'organizations' => Navigare::deferred(function () {
        sleep(1);

        return Auth::user()
          ->account->organizations()
          ->orderBy('updated_at', 'DESC')
          ->filter(Request::only('search', 'trashed'))
          ->paginate(10)
          ->withQueryString()
          ->through(
            fn($organization) => [
              'id' => $organization->id,
              'name' => $organization->name,
              'phone' => $organization->phone,
              'city' => $organization->city,
              'deleted_at' => $organization->deleted_at,
            ]
          );
      }),
    ]);
  }

  public function create()
  {
    return Navigare::withModal('organizations/Create')->extends(
      route('organizations.index')
    );
  }

  public function store(StoreRequest $request)
  {
    $organization = Auth::user()
      ->account->organizations()
      ->create($request->validated());

    if ($request->input('from_contact_create')) {
      $redirect = Redirect::route('contacts.create');

      Session::flash('organization_id', $organization->id);
    } else {
      $redirect = Redirect::back();
    }

    return $redirect->with('success', 'Organization created.');
  }

  public function edit(Organization $organization)
  {
    return Navigare::render('organizations/Edit', [
      'organization' => [
        'id' => $organization->id,
        'name' => $organization->name,
        'email' => $organization->email,
        'phone' => $organization->phone,
        'address' => $organization->address,
        'city' => $organization->city,
        'region' => $organization->region,
        'country' => $organization->country,
        'postal_code' => $organization->postal_code,
        'deleted_at' => $organization->deleted_at,
      ],
      'contacts' => $organization
        ->contacts()
        ->orderByName()
        ->get()
        ->map->only('id', 'name', 'city', 'phone'),
    ]);
  }

  public function update(UpdateRequest $request, Organization $organization)
  {
    $organization->update($request->validated());

    return Redirect::back()->with('success', 'Organization updated.');
  }

  public function destroy(Organization $organization)
  {
    $organization->delete();

    return Redirect::back()->with('success', 'Organization deleted.');
  }

  public function restore(Organization $organization)
  {
    $organization->restore();

    return Redirect::back()->with('success', 'Organization restored.');
  }
}
