<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 */
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    'anchor-js' => [
        'version' => '5.0.0',
    ],
    'simplebar' => [
        'version' => '6.2.6',
    ],
    'can-use-dom' => [
        'version' => '0.1.0',
    ],
    'simplebar-core' => [
        'version' => '1.2.5',
    ],
    'simplebar/dist/simplebar.min.css' => [
        'version' => '6.2.6',
        'type' => 'css',
    ],
    'lodash-es' => [
        'version' => '4.17.21',
    ],
    'simplebar-core/dist/simplebar.min.css' => [
        'version' => '1.2.5',
        'type' => 'css',
    ],
    'is_js' => [
        'version' => '0.9.0',
    ],
    'lodash' => [
        'version' => '4.17.21',
    ],
    'bootstrap' => [
        'version' => '5.3.3',
    ],
    '@popperjs/core' => [
        'version' => '2.11.8',
    ],
    'bootstrap/dist/css/bootstrap.min.css' => [
        'version' => '5.3.3',
        'type' => 'css',
    ],
    '@hotwired/stimulus' => [
        'version' => '3.2.2',
    ],
    'jquery' => [
        'version' => '3.7.1',
    ],
    'lazysizes' => [
        'version' => '5.3.2',
    ],
];
