<?php

return [
  /*
    |--------------------------------------------------------------------------
    | Server Side Rendering
    |--------------------------------------------------------------------------
    |
    | These options configures if and how Navigare uses Server Side Rendering
    | to pre-render the initial visits made to your application's pages.
    |
    | Do note that enabling these options will NOT automatically make SSR work,
    | as a separate rendering service needs to be available. To learn more,
    | please visit https://jaulz.github.io/navigare/server-side-rendering
    |
    */
  'ssr' => [
    'enabled' => true,

    'url' => 'http://127.0.0.1:13714/',
  ],

  /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | The values described here are used to locate Navigare components on the
    | filesystem. For instance, when using `assertNavigare`, the assertion
    | attempts to locate the component as a file relative to any of the
    | paths AND with any of the extensions specified here.
    |
    */
  'testing' => [
    'ensure_pages_exist' => true,

    'page_paths' => [resource_path('js/pages')],

    'page_extensions' => ['js', 'jsx', 'svelte', 'ts', 'tsx', 'vue'],
  ],

  /*
    |--------------------------------------------------------------------------
    | Types
    |--------------------------------------------------------------------------
    |
    | The values described here are used to define the types for Typescript
    | which will automatically be generated by Navigare.
    |
    */
  'types' => [
    'path' => resource_path('scripts/routes.d.ts'),
  ],
];
