<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\MdApplicationStatus;
use App\Models\MdCompany;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class JobApplicationService
{
    /**
     * @param  array<string, mixed>  $data  Validated application data.
     */
    public function create(User $user, array $data): JobApplication
    {
        return DB::transaction(function () use ($user, $data): JobApplication {
            return $user->jobApplications()->create($this->resolveCompany($data));
        });
    }

    /**
     * @param  array<string, mixed>  $data  Validated application data.
     */
    public function update(JobApplication $application, array $data): JobApplication
    {
        return DB::transaction(function () use ($application, $data): JobApplication {
            $application->update($this->resolveCompany($data));

            return $application;
        });
    }

    public function changeStatus(JobApplication $application, int $statusId): JobApplication
    {
        return DB::transaction(function () use ($application, $statusId): JobApplication {
            $lockedApplication = JobApplication::query()
                ->whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();

            $targetStatus = MdApplicationStatus::query()->findOrFail($statusId);

            $this->recordStatusTransition($lockedApplication, $targetStatus);

            return $lockedApplication;
        });
    }

    public function advanceStatusIfEarlier(JobApplication $application, string $targetStatusKey): JobApplication
    {
        return DB::transaction(function () use ($application, $targetStatusKey): JobApplication {
            $lockedApplication = JobApplication::query()
                ->whereKey($application->id)
                ->lockForUpdate()
                ->firstOrFail();
            $lockedApplication->load('status');

            $targetStatus = MdApplicationStatus::query()
                ->where('key', $targetStatusKey)
                ->firstOrFail();

            if (! $lockedApplication->status || $lockedApplication->status->sort_order >= $targetStatus->sort_order) {
                return $lockedApplication;
            }

            $this->recordStatusTransition($lockedApplication, $targetStatus);

            return $lockedApplication;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function resolveCompany(array $data): array
    {
        if (empty($data['company_id']) && ! empty($data['company_name'])) {
            $company = MdCompany::query()->firstOrCreate(
                ['name' => trim($data['company_name'])],
                ['industry_id' => $data['industry_id'] ?? null]
            );

            $data['company_id'] = $company->id;
            $data['company_name'] = null;
        }

        unset($data['industry_id']);

        return $data;
    }

    private function recordStatusTransition(JobApplication $application, MdApplicationStatus $targetStatus): void
    {
        $application->load('status');
        $currentStatus = $application->status;

        if (! $currentStatus || $currentStatus->is($targetStatus)) {
            return;
        }

        $application->update(['status_id' => $targetStatus->id]);
        $application->history()->create([
            'action' => 'status_changed',
            'from_status_id' => $currentStatus->id,
            'to_status_id' => $targetStatus->id,
            'changed_at' => Carbon::now(config('app.timezone')),
        ]);
    }
}
