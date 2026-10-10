<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReferenceCodeService
{
    public function next(string $entity, string $prefix): string
    {
        $now = Carbon::now(config('app.timezone'));
        $year = $now->year;

        $sequence = DB::transaction(function () use ($entity, $year, $now): int {
            DB::table('reference_code_counters')->insertOrIgnore([
                'entity' => $entity,
                'year' => $year,
                'last_value' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $counter = DB::table('reference_code_counters')
                ->where('entity', $entity)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            $nextValue = $counter->last_value + 1;

            DB::table('reference_code_counters')
                ->where('id', $counter->id)
                ->update([
                    'last_value' => $nextValue,
                    'updated_at' => $now,
                ]);

            return $nextValue;
        });

        return sprintf('%s-%d-%04d', $prefix, $year, $sequence);
    }
}
