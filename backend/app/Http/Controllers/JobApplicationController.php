<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;

use Illuminate\Http\Request;
use App\Http\Requests\JobApplication\JobApplicationStoreRequest;
use App\Http\Requests\JobApplication\JobApplicationUpdateRequest;

use App\Models\JobApplication;
use App\Models\MdApplicationStatus;
use App\Models\MdEmploymentType;
use App\Models\MdJobSource;

class JobApplicationController extends Controller
{
    //
    protected function sortableColumns(): array
    {
        return [
            'jobTitle' => 'job_title',
            'appliedAt' => 'applied_at',
            'createdAt' => 'created_at',
            'salaryMin' => 'salary_min',
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = min(max((int) $request->integer('perPage', 15), 1), 100);
        $sortField = $request->string('sortField', 'createdAt')->toString();
        $sortOrder = (int) $request->integer('sortOrder', -1);
        $sortColumn = $this->sortableColumns()[$sortField] ?? 'created_at';
        $sortDirection = $sortOrder === 1 ? 'asc' : 'desc';

        $query = $request->user()
            ->jobApplications()
            ->with(['company:id,name', 'status:id,name', 'employmentType:id,name', 'source:id,name'])
            ->when($request->filled('search'), function (Builder $query) use ($request) {
                $search = $request->string('search')->toString();

                $query->where(function (Builder $sub) use ($search) {
                    $sub->where('job_title', 'ilike', "%{$search}%")
                        ->orWhere('company_name', 'ilike', "%{$search}%")
                        ->orWhereHas('company', fn (Builder $c) => $c->where('name', 'ilike', "%{$search}%"));
                });
            })
            ->when($request->filled('statusId'), function (Builder $query) use ($request) {
                $query->where('status_id', (int) $request->integer('statusId'));
            })
            ->when($request->filled('employmentTypeId'), function (Builder $query) use ($request) {
                $query->where('employment_type_id', (int) $request->integer('employmentTypeId'));
            })
            ->when($request->filled('sourceId'), function (Builder $query) use ($request) {
                $query->where('source_id', (int) $request->integer('sourceId'));
            })
            ->when($request->filled('companyId'), function (Builder $query) use ($request) {
                $query->where('company_id', (int) $request->integer('companyId'));
            })
            ->when($request->filled('appliedFrom'), function (Builder $query) use ($request) {
                $query->whereDate('applied_at', '>=', $request->string('appliedFrom')->toString());
            })
            ->when($request->filled('appliedTo'), function (Builder $query) use ($request) {
                $query->whereDate('applied_at', '<=', $request->string('appliedTo')->toString());
            })
            ->orderBy($sortColumn, $sortDirection)
            ->orderByDesc('id');

        $applications = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'data' => $applications->items(),
            'meta' => [
                'total' => $applications->total(),
                'perPage' => $applications->perPage(),
                'currentPage' => $applications->currentPage(),
                'lastPage' => $applications->lastPage(),
                'from' => $applications->firstItem(),
                'to' => $applications->lastItem(),
            ],
            'filters' => [
                'search' => $request->string('search')->toString(),
                'statusId' => $request->input('statusId'),
                'employmentTypeId' => $request->input('employmentTypeId'),
                'sourceId' => $request->input('sourceId'),
                'companyId' => $request->input('companyId'),
                'appliedFrom' => $request->string('appliedFrom')->toString(),
                'appliedTo' => $request->string('appliedTo')->toString(),
                'sortField' => $sortField,
                'sortOrder' => $sortOrder,
            ],
            'statuses' => MdApplicationStatus::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name'])
                ->map(fn (MdApplicationStatus $status) => [
                    'label' => $status->name,
                    'value' => $status->id,
                ])
                ->values(),
            'employmentTypes' => MdEmploymentType::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name'])
                ->map(fn (MdEmploymentType $type) => [
                    'label' => $type->name,
                    'value' => $type->id,
                ])
                ->values(),
            'sources' => MdJobSource::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'name'])
                ->map(fn (MdJobSource $source) => [
                    'label' => $source->name,
                    'value' => $source->id,
                ])
                ->values(),
        ]);
    }

    public function store(JobApplicationStoreRequest $request)
    {
        $jobApplication = $request->user()->jobApplications()->create($request->validated());

        return response()->json($jobApplication->load(['company', 'status']), 201);
    }

    public function show(JobApplication $jobApplication)
    {
        $this->authorizeOwnership($jobApplication);

        return $jobApplication->load(['company', 'status', 'employmentType', 'source', 'interviews', 'documents']);
    }

    public function update(JobApplicationUpdateRequest $request, JobApplication $jobApplication)
    {
        $this->authorizeOwnership($jobApplication);

        $jobApplication->update($request->validated());

        return $jobApplication->load(['company', 'status', 'employmentType', 'source']);
    }

    public function destroy(JobApplication $jobApplication)
    {
        $this->authorizeOwnership($jobApplication);

        $jobApplication->delete();

        return response()->json(null, 204);
    }

    protected function authorizeOwnership(JobApplication $jobApplication): void
    {
        abort_unless($jobApplication->user_id === request()->user()->id, 403);
    }
}
