<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

use App\Http\Requests\CareerProfile\CareerProfileUpdateRequest;
use App\Http\Requests\CareerProfile\CareerProfilePhotoRequest;

use App\Services\CareerProfileService;

class CareerProfileController extends Controller
{
    public function __construct(private readonly CareerProfileService $career)
    {
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json($this->career->getForUser($request->user()));
    }

    public function update(CareerProfileUpdateRequest $request): JsonResponse
    {
        $careerProfile = $this->career->update($request->user(), $request->validated());

        return response()->json($careerProfile);
    }

    public function updatePhoto(CareerProfilePhotoRequest $request): JsonResponse
    {
        $careerProfile = $this->career->updatePhoto($request->user(), $request->file('photo'));

        return response()->json(['photo_url' => $careerProfile->photo_url]);
    }

    public function destroyPhoto(Request $request): Response
    {
        $this->career->deletePhoto($request->user());

        return response()->noContent();
    }
}
