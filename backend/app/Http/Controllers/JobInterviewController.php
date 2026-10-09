<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobInterview\JobInterviewStoreRequest;
use App\Http\Requests\JobInterview\JobInterviewUpdateRequest;
use App\Models\JobInterview;
use App\Models\MdApplicationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class JobInterviewController extends Controller
{
    private const RESPONSE_RELATIONS = [
        'jobApplication.company:id,name',
        'jobApplication.status:id,name',
    ];

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('perPage', 15), 1), 100);
        $filters = $request->validate([
            'scheduledDate' => ['sometimes', 'date_format:Y-m-d'],
            'scheduledFrom' => ['sometimes', 'date_format:Y-m-d'],
            'scheduledTo' => [
                'sometimes',
                'date_format:Y-m-d',
                function (string $attribute, mixed $value, \Closure $fail) use ($request): void {
                    $scheduledFrom = $request->input('scheduledFrom');
                    if (is_string($scheduledFrom) && is_string($value) && $value < $scheduledFrom) {
                        $fail('The scheduled to date must be on or after the scheduled from date.');
                    }
                },
            ],
        ]);

        $interviews = JobInterview::query()
            ->whereHas('jobApplication', fn (Builder $query) =>
                $query->where('user_id', $request->user()->id)
            )
            ->when($filters['scheduledDate'] ?? null, fn (Builder $query, string $date) =>
                $query->whereDate('scheduled_at', $date)
            )
            ->when($filters['scheduledFrom'] ?? null, fn (Builder $query, string $date) =>
                $query->whereDate('scheduled_at', '>=', $date)
            )
            ->when($filters['scheduledTo'] ?? null, fn (Builder $query, string $date) =>
                $query->whereDate('scheduled_at', '<=', $date)
            )
            ->with(self::RESPONSE_RELATIONS)
            ->orderBy('scheduled_at')
            ->orderByDesc('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'data' => $interviews->items(),
            'meta' => [
                'total' => $interviews->total(),
                'perPage' => $interviews->perPage(),
                'currentPage' => $interviews->currentPage(),
                'lastPage' => $interviews->lastPage(),
                'from' => $interviews->firstItem(),
                'to' => $interviews->lastItem(),
            ],
        ]);
    }

    public function store(JobInterviewStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (! empty($data['scheduled_at'])) {
            $data['scheduled_at'] = Carbon::parse($data['scheduled_at'], config('app.timezone'));
        }

        $interview = DB::transaction(function () use ($request, $data) {
            $application = $request->user()
                ->jobApplications()
                ->whereKey($data['job_application_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $interview = $application->interviews()->create(
                collect($data)->except('job_application_id')->all()
            );

            $interviewStatus = MdApplicationStatus::query()
                ->where('name', 'Interview')
                ->firstOrFail();

            $currentStatus = MdApplicationStatus::query()
                ->find($application->status_id);

            if ($currentStatus && $currentStatus->sort_order < $interviewStatus->sort_order) {
                $application->update(['status_id' => $interviewStatus->id]);

                $application->history()->create([
                    'action' => 'status_changed',
                    'from_status_id' => $currentStatus->id,
                    'to_status_id' => $interviewStatus->id,
                    'changed_at' => now(),
                ]);
            }

            return $interview;
        });

        return response()->json(
            $interview->load(self::RESPONSE_RELATIONS),
            201
        );
    }

    public function update(JobInterviewUpdateRequest $request, int $id): JsonResponse
    {
        $interview = JobInterview::query()
            ->whereKey($id)
            ->whereHas('jobApplication', fn (Builder $query) =>
                $query->where('user_id', $request->user()->id)
            )
            ->firstOrFail();

        $data = $request->validated();
        if (array_key_exists('scheduled_at', $data) && $data['scheduled_at'] !== null) {
            $data['scheduled_at'] = Carbon::parse($data['scheduled_at'], config('app.timezone'));
        }

        $interview->update($data);

        return response()->json($interview->load(self::RESPONSE_RELATIONS));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $interview = JobInterview::query()
            ->whereKey($id)
            ->whereHas('jobApplication', fn (Builder $query) =>
                $query->where('user_id', $request->user()->id)
            )
            ->firstOrFail();

        $interview->delete();

        return response()->json(null, 204);
    }
}
