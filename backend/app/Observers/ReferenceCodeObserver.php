<?php

namespace App\Observers;

use App\Models\Document;
use App\Models\JobApplication;
use App\Models\JobInterview;
use App\Models\User;
use App\Services\ReferenceCodeService;
use Illuminate\Database\Eloquent\Model;

class ReferenceCodeObserver
{
    public function __construct(private readonly ReferenceCodeService $referenceCodes)
    {
    }

    public function creating(Model $model): void
    {
        [$column, $entity, $prefix] = match (true) {
            $model instanceof User && $model->role === 'Super Admin' => ['user_code', 'admin', 'ADMIN'],
            $model instanceof User => ['user_code', 'user', 'USER'],
            $model instanceof JobApplication => ['job_application_code', 'job_application', 'JA'],
            $model instanceof JobInterview => ['job_interview_code', 'job_interview', 'JI'],
            $model instanceof Document => ['document_code', 'document', 'DOC'],
            default => [null, null, null],
        };

        if ($column !== null && blank($model->getAttribute($column))) {
            $model->setAttribute($column, $this->referenceCodes->next($entity, $prefix));
        }
    }
}
