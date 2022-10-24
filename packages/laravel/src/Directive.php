<?php

namespace Jaulz\Navigare;

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
      'htmlAttrs' => '{!! $__navigareSsr->htmlAttrs !!}',
      'headTags' => '{!! $__navigareSsr->headTags !!}',
      'bodyAttrs' => '{!! $__navigareSsr->bodyAttrs !!}',
      'bodyTags' => '{!! $__navigareSsr->bodyTags !!}',
      'appHTML'
        => '<div id="{{ $__navigareSsr->id }}" data-page="{{ json_encode($page) }}">{!! $__navigareSsr->appHTML !!}</div>',
      default => '',
    };

    $prefix = '<?php
        if (!isset($__navigareSsr)) {
            $__navigareSsr = app(\Jaulz\Navigare\Ssr\Gateway::class)->dispatch($page);
        } ?>';

    return implode(' ', array_map('trim', explode("\n", $prefix . $template)));
  }
}
