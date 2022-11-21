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
    | please visit https://navigarejs.github.io/framework/guide/basics/server-side-rendering
    |
    */
  'ssr' => [
    'enabled' => false,

    'protocol' => 'http',

    'host' => '127.0.0.1',

    'port' => 13715,

    'timeout' => 2,

    'input' => 'resources/scripts/ssr.ts',

    'manifest' => base_path('bootstrap/ssr/manifest.json'),
  ],

  /*
    |--------------------------------------------------------------------------
    | Client
    |--------------------------------------------------------------------------
    |
    | The values described here are used to map 
    |
    */
  'client' => [
    'manifest' => public_path('build/manifest.json'),
  ],

  /*
    |--------------------------------------------------------------------------
    | Components
    |--------------------------------------------------------------------------
    |
    | The values described here are used to locate Navigare components on the
    | filesystem relative to the input file you specified in Vite config.. 
    |
    */
  'components' => [
    'path' => 'resources/scripts/pages',

    'default_extension' => 'vue',
  ],

  /*
    |--------------------------------------------------------------------------
    | Testing
    |--------------------------------------------------------------------------
    |
    | The values described here are used to influence the behaviour of the 
    | testing utilities. For example, you can define whether the framework
    | should check whether the components exist.
    |
    */
  'testing' => [
    'ensure_components_exist' => true,
  ],
];
