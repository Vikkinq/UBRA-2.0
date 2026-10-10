<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

use App\Http\Requests\JobInterview\JobInterviewStoreRequest;
use App\Http\Requests\JobInterview\JobInterviewUpdateRequest;

use App\Models\JobInterview;

use App\Services\JobInterviewService;

class JobInterviewController extends Controller
{
    private const RESPONSE_RELATIONS = [
        'jobApplication.company:id,name',
        'jobApplication.status:id,name',
    ];

    public function __construct(private readonly JobInterviewService $interviews)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('perPage', 15), 1), 100);
        $filters = $request->validate([
            'scheduledDate' => ['sometimes', 'date_format:Y-m-d'],
            'scheduledFrom' => ['sometimes', 'date_format:Y-m-d'],
            'scheduledTo' => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:scheduledFrom'],
        ]);

        $interviews = JobInterview::query()
            ->ownedBy($request->user()->id)
            ->when($filters['scheduledDate'] ?? null, fn (Builder $query, string $date) =>
                $query->whereBetween('scheduled_at', [
                    $this->startOfDay($date),
                    $this->endOfDay($date),
                ])
            )
            ->when($filters['scheduledFrom'] ?? null, fn (Builder $query, string $date) =>
                $query->where('scheduled_at', '>=', $this->startOfDay($date))
            )
            ->when($filters['scheduledTo'] ?? null, fn (Builder $query, string $date) =>
                $query->where('scheduled_at', '<=', $this->endOfDay($date))
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
        $interview = $this->interviews->create($request->user(), $request->validated());

        return response()->json(
            $interview->load(self::RESPONSE_RELATIONS),
            201
        );
    }

    public function update(JobInterviewUpdateRequest $request, int $id): JsonResponse
    {
        $interview = JobInterview::query()
            ->ownedBy($request->user()->id)
            ->whereKey($id)
            ->firstOrFail();

        $interview = $this->interviews->update($interview, $request->validated());

        return response()->json($interview->load(self::RESPONSE_RELATIONS));
    }

    public function destroy(Request $request, int $id): Response
    {
        $interview = JobInterview::query()
            ->ownedBy($request->user()->id)
            ->whereKey($id)
            ->firstOrFail();

        $this->interviews->delete($interview);

        return response()->noContent();
    }

    private function startOfDay(string $date): Carbon
    {
        return Carbon::parse($date, config('app.timezone'))->startOfDay();
    }

    private function endOfDay(string $date): Carbon
    {
        return Carbon::parse($date, config('app.timezone'))->endOfDay();
    }
}