<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Mockery tsy vendorisé tao amin'ity projet ity (tsy required-dev).
     * $this->artisan(...) amin'ny fitsapana (nampiasain'ny RefreshDatabase
     * mba hanao migrate:fresh) dia mila Mockery raha "mocké" ny console
     * output — esorina eto mba handeha mivantana ny commande, tsy misy
     * fikasihana amin'ny valiny.
     */
    public $mockConsoleOutput = false;
}