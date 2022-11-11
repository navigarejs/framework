<?php

namespace App\Http\Controllers;

use App\Http\Requests\Contacts\StoreRequest;
use App\Http\Requests\Contacts\UpdateRequest;
use App\Models\Contact;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Request;
use Illuminate\Validation\Rule;
use Navigare\Navigare;

class ContactsController extends Controller
{
  public function index()
  {
    return Navigare::render('contacts/Index', [
      'filters' => Request::all('search', 'trashed'),
      'contacts' => Auth::user()
        ->account->contacts()
        ->with('organization')
        ->orderBy('updated_at', 'DESC')
        ->filter(Request::only('search', 'trashed'))
        ->paginate(10)
        ->withQueryString()
        ->through(
          fn($contact) => [
            'id' => $contact->id,
            'name' => $contact->name,
            'phone' => $contact->phone,
            'city' => $contact->city,
            'deleted_at' => $contact->deleted_at,
            'organization' => $contact->organization
              ? $contact->organization->only('name')
              : null,
          ]
        ),
    ]);
  }

  public function create()
  {
    return Navigare::modal('contacts/Create', [
      'organizations' => Auth::user()
        ->account->organizations()
        ->orderBy('name')
        ->get()
        ->map->only('id', 'name'),
    ])->extends(route('contacts.index'));
  }

  public function store(StoreRequest $request)
  {
    Auth::user()
      ->account->contacts()
      ->create($request->validated());

    return Redirect::route('contacts.index')->with(
      'success',
      'Contact created.'
    );
  }

  public function edit(Contact $contact)
  {
    return Navigare::render('contacts/Edit', [
      'contact' => [
        'id' => $contact->id,
        'first_name' => $contact->first_name,
        'last_name' => $contact->last_name,
        'organization_id' => $contact->organization_id,
        'email' => $contact->email,
        'phone' => $contact->phone,
        'address' => $contact->address,
        'city' => $contact->city,
        'region' => $contact->region,
        'country' => $contact->country,
        'postal_code' => $contact->postal_code,
        'deleted_at' => $contact->deleted_at,
      ],
      'organizations' => Auth::user()
        ->account->organizations()
        ->orderBy('name')
        ->get()
        ->map->only('id', 'name'),
    ]);
  }

  public function update(UpdateRequest $request, Contact $contact)
  {
    $contact->update($request->validated());

    return Redirect::back()->with('success', 'Contact updated.');
  }

  public function destroy(Contact $contact)
  {
    $contact->delete();

    return Redirect::back()->with('success', 'Contact deleted.');
  }

  public function restore(Contact $contact)
  {
    $contact->restore();

    return Redirect::back()->with('success', 'Contact restored.');
  }
}
