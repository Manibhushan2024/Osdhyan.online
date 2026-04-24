<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SupportController extends Controller
{
    public function submitTicket(Request $request): JsonResponse
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'category' => 'nullable|string|in:technical,billing,content,other',
        ]);

        // Queue a support email (simple implementation)
        $user = $request->user();
        $ticketId = 'TKT-' . strtoupper(substr(md5(uniqid()), 0, 8));

        Mail::raw(
            "Support Ticket: {$ticketId}\n\nFrom: {$user->name} ({$user->email})\nCategory: {$request->category}\n\n{$request->message}",
            fn($m) => $m->to(config('mail.from.address'))->subject("Support: {$request->subject}")
        );

        return response()->json([
            'message' => 'Ticket submitted successfully.',
            'ticket_id' => $ticketId,
        ], 201);
    }

    public function getMyTickets(Request $request): JsonResponse
    {
        return response()->json(['data' => []]);
    }
}
