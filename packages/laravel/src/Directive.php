<?php

namespace Navigare;

class Directive
{
  /**
   * Compiles the "@navigare" directive.
   *
   * @param  string  $expression
   * @return string
   */
  public static function compile($expression): string
  {
    $part = trim(trim($expression), "\'\"") ?: 'appHTML';
    $template = match ($part) {
      'htmlAttributes' => '{!! $__navigareSSR?->htmlAttributes ?? "" !!}',
      'headTags' => '{!! $__navigareSSR?->headTags ?? "" !!}',
      'bodyAttributes' => '{!! $__navigareSSR?->bodyAttributes ?? "" !!}',
      'bodyTags' => '{!! $__navigareSSR?->bodyTags ?? "" !!}',
      'appHTML' => '
        <div 
          id="{{ $__navigareSSR?->id ?? "app" }}" 
          data-base="{{ $__navigareConfiguration->getClientManifest()?->getBase() ?? "/" }}" 
          data-page="{{ json_encode($page->toArray(false)) }}"
        >
          {!! $__navigareSSR?->appHTML ?? "" !!}
        </div>
      ',
      default => '',
    };

    $prefix = '<?php
      if (!isset($__navigareConfiguration)) {
        $__navigareConfiguration = \Navigare\Navigare::getConfiguration();
      }

      if (!isset($__navigareSSR)) {
        $__navigareSSR = app(\Navigare\SSR\Gateway::class)->dispatch(request(), $page);
      }
    ?>';

    return implode(' ', array_map('trim', explode("\n", $prefix . $template)));
  }
}
