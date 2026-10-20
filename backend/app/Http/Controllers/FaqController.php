<?php

namespace App\Http\Controllers;

use App\Models\FaqItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'faqs' => FaqItem::query()
                ->orderBy('category')
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get(['id', 'category', 'summary', 'detail', 'sort_order']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateFaq($request);
        $faq = FaqItem::query()->create($validated);

        return response()->json(['faq' => $faq], 201);
    }

    public function update(Request $request, FaqItem $faq): JsonResponse
    {
        $faq->update($this->validateFaq($request));

        return response()->json(['faq' => $faq->fresh()]);
    }

    public function destroy(FaqItem $faq): JsonResponse
    {
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted.']);
    }

    /**
     * @return array{category: string, summary: string, detail: string, sort_order: int}
     */
    private function validateFaq(Request $request): array
    {
        return $request->validate([
            'category' => ['required', 'string', 'max:80'],
            'summary' => ['required', 'string', 'max:255'],
            'detail' => ['required', 'string', 'max:10000'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);
    }
}
