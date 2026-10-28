<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * API routes must answer guests with a JSON 401, not a 500 from a redirect to
 * a "login" route that does not exist, whatever Accept header the client sends.
 */
class ApiJsonErrorsTest extends TestCase
{
    public function test_guest_without_accept_header_gets_json_401(): void
    {
        $this->get('/api/exams')
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_guest_with_json_accept_header_gets_json_401(): void
    {
        $this->getJson('/api/exams')->assertStatus(401);
    }

    public function test_unknown_api_route_is_json_404(): void
    {
        $this->get('/api/no-such-route')
            ->assertStatus(404)
            ->assertHeader('Content-Type', 'application/json');
    }
}
