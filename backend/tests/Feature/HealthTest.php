<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_root_and_health_endpoints_respond(): void
    {
        $this->getJson('/')->assertOk()->assertJson(['status' => 'ok']);
        $this->getJson('/api/health')->assertOk()->assertJson(['status' => 'ok']);
        $this->get('/up')->assertOk();
    }
}
