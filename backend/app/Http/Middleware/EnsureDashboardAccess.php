<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDashboardAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(in_array($request->user()?->role, ['Admin', 'Staff'], true), 403, 'Dashboard access required.');

        return $next($request);
    }
}
