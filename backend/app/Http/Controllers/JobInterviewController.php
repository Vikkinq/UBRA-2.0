<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobInterview\JobInterviewStoreRequest;
use App\Models\JobApplication;
use App\Models\JobInterview;
use App\Models\MdApplicationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

        $interviews = JobInterview::query()
            ->whereHas('jobApplication', fn (Builder $query) =>
                $query->where('user_id', $request->user()->id)
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
}
