<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faq_items', function (Blueprint $table): void {
            $table->id();
            $table->string('category', 80);
            $table->string('summary', 255);
            $table->text('detail');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['category', 'sort_order']);
        });

        $categories = [
            'BOOKING' => [
                ['How do I book a session?', 'You can book a session through our booking page.'],
                ['Do you accept walk-ins?', 'Walk-ins are subject to studio availability, so booking ahead is recommended.'],
                ['How early should I book?', 'We recommend booking at least one week in advance.'],
            ],
            'PAYMENT' => [
                ['What payment methods do you accept?', 'We accept major cards and other available payment options at checkout.'],
                ['Is the reservation fee refundable?', 'Reservation fees follow the terms in our booking policy.'],
                ['When is the balance due?', 'The remaining balance is due before the session begins.'],
            ],
            'STUDIO' => [
                ['What is included with the studio rental?', 'Your rental includes the selected studio space and included equipment.'],
                ['Can I bring a production team?', 'You can bring your production team within the booking capacity.'],
                ['Do you provide equipment?', 'Available equipment depends on the studio package you choose.'],
            ],
            'SHOOT' => [
                ['Can I schedule a photo shoot?', 'Our studio can be booked for photo and video shoots.'],
                ['Can I bring my own photographer?', 'You are welcome to bring your own photographer or creative team.'],
                ['How long can a shoot last?', 'Shoot length depends on the package and studio availability.'],
            ],
            'DELIVERY' => [
                ['When will I receive my files?', 'Delivery timing depends on the selected service and project scope.'],
                ['How are files delivered?', 'Completed files are delivered through a digital download link.'],
                ['Can I request revisions?', 'Revision options depend on the service included in your booking.'],
            ],
            'POLICIES' => [
                ['What is your cancellation policy?', 'Cancellation terms are outlined in our booking policy.'],
                ['Can I reschedule my session?', 'Rescheduling requests are handled according to availability and policy.'],
                ['Where can I read your studio policies?', 'Our current studio policies are available before you confirm a booking.'],
            ],
        ];

        $now = now();
        $items = [];
        foreach ($categories as $category => $questions) {
            foreach ($questions as $index => [$summary, $detail]) {
                $items[] = [
                    'category' => $category,
                    'summary' => $summary,
                    'detail' => $detail,
                    'sort_order' => $index,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('faq_items')->insert($items);
    }

    public function down(): void
    {
        Schema::dropIfExists('faq_items');
    }
};
