<?php

use App\Models\Contact;
use App\Models\Organization;
use App\Models\User;
use Diglactic\Breadcrumbs\Breadcrumbs;
use Diglactic\Breadcrumbs\Generator as BreadcrumbTrail;

// Auth
Breadcrumbs::for('auth.login', function (BreadcrumbTrail $trail) {
  $trail->push('Login', route('auth.login'));
});

Breadcrumbs::for('auth.logout', function (BreadcrumbTrail $trail) {
  $trail->push('Logout', route('auth.logout'));
});

// Dashboard
Breadcrumbs::for('dashboard.index', function (BreadcrumbTrail $trail) {
  $trail->push('Dashboard', route('dashboard.index'));
});

// Reports
Breadcrumbs::for('reports.index', function (BreadcrumbTrail $trail) {
  $trail->push('Reports', route('reports.index'));
});

Breadcrumbs::for('reports.show', function (
  BreadcrumbTrail $trail,
  string $name
) {
  $trail->parent('reports.index');

  $trail->push(
    $name,
    route('reports.show', [
      'name' => $name,
    ])
  );
});

// Organizations
Breadcrumbs::for('organizations.index', function (BreadcrumbTrail $trail) {
  $trail->push('Organizations', route('organizations.index'));
});

Breadcrumbs::for('organizations.create', function (BreadcrumbTrail $trail) {
  $trail->parent('organizations.index');

  $trail->push('Create Organization', route('organizations.create'));
});

Breadcrumbs::for('organizations.edit', function (
  BreadcrumbTrail $trail,
  Organization $organization
) {
  $trail->parent('organizations.index');

  $trail->push(
    $organization->name,
    route('organizations.edit', [
      'organization' => $organization,
    ])
  );
});

// Contacts
Breadcrumbs::for('contacts.index', function (BreadcrumbTrail $trail) {
  $trail->push('Contacts', route('contacts.index'));
});

Breadcrumbs::for('contacts.create', function (BreadcrumbTrail $trail) {
  $trail->parent('contacts.index');

  $trail->push('Create Contact', route('contacts.create'));
});

Breadcrumbs::for('contacts.edit', function (
  BreadcrumbTrail $trail,
  Contact $contact
) {
  $trail->parent('contacts.index');

  $trail->push(
    $contact->name,
    route('contacts.edit', [
      'contact' => $contact,
    ])
  );
});

// Users
Breadcrumbs::for('users.index', function (BreadcrumbTrail $trail) {
  $trail->push('Users', route('users.index'));
});

Breadcrumbs::for('users.create', function (BreadcrumbTrail $trail) {
  $trail->parent('users.index');

  $trail->push('Create User', route('users.create'));
});

Breadcrumbs::for('users.edit', function (BreadcrumbTrail $trail, User $user) {
  $trail->parent('users.index');

  $trail->push(
    $user->name,
    route('users.edit', [
      'user' => $user,
    ])
  );
});
