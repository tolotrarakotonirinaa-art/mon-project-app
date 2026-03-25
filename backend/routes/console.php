<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Services\MockDataStore;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Commande pour réinitialiser les données mock
Artisan::command('mock:reset', function () {
    MockDataStore::reset();
    $this->info('✅ Données mock réinitialisées !');
})->purpose('Réinitialiser les données mock à leur état initial');

// Commande pour afficher les données
Artisan::command('mock:show {collection?}', function (string $collection = 'users') {
    $data = MockDataStore::get($collection);
    $this->table(
        array_keys($data[0] ?? []),
        array_map(fn($i) => array_values($i), array_slice($data, 0, 5))
    );
})->purpose('Afficher les données mock d\'une collection');
