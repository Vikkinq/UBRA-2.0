<?php

namespace App\Services;

use App\Models\JobInterview;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class JobInterviewService
{
    private const INTERVIEW_STATUS_KEY = 'interview';

    public function __construct(private readonly JobApplicationService $applications)
    {
    }

    /**
     * @param  array<string, mixed>  $data  Validated data, including job_application_id.
     */
    public function create(User $user, array $data): JobInterview
    {
        $data = $this->normalize($data);

        return DB::transaction(function () use ($user, $data) {
            $application = $user
                ->jobApplications()
                ->whereKey($data['job_application_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $interview = $application->interviews()->create(
                collect($data)
                    ->except('job_application_id')
                    ->put('user_id', $user->id)
                    ->all()
            );

            $this->applications->advanceStatusIfEarlier($application, self::INTERVIEW_STATUS_KEY);

            return $interview;
        });
    }

    /**
     * @param  array<string, mixed>  $data  Validated data.
     */
    public function update(JobInterview $interview, array $data): JobInterview
    {
        $interview->update($this->normalize($data));

        return $interview;
    }

    public function delete(JobInterview $interview): void
    {
        $interview->delete();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function normalize(array $data): array
    {
        if (! empty($data['scheduled_at'])) {
            $data['scheduled_at'] = Carbon::parse($data['scheduled_at'], config('app.timezone'));
        }

        return $data;
    }

}
