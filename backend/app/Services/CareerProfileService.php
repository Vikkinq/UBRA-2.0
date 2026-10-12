<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

use RuntimeException;
use Throwable;

use App\Models\CareerProfile;
use App\Models\User;

class CareerProfileService
{
    public function getForUser(User $user): CareerProfile
    {
        return $user->careerProfile()->firstOrCreate()->load([
            'experiences.employmentType',
            'educations',
            'skills',
        ]);
    }

    /**
     * Update career profile fields and synchronize any supplied child collections.
     * A supplied experiences, educations, or skills array is treated as the complete collection.
     *
     * @param array<string, mixed> $data
     */
    public function update(User $user, array $data): CareerProfile
    {
        return DB::transaction(function () use ($user, $data): CareerProfile {
            $careerProfile = $user->careerProfile()->firstOrCreate();

            $profileFields = collect($data)->except(['experiences', 'educations', 'skills'])->all();
            $careerProfile->fill($profileFields);
            $careerProfile->save();

            if (array_key_exists('experiences', $data)) {
                $this->syncExperiences($careerProfile, $data['experiences']);
            }

            if (array_key_exists('educations', $data)) {
                $this->syncEducations($careerProfile, $data['educations']);
            }

            if (array_key_exists('skills', $data)) {
                $this->syncSkills($careerProfile, $data['skills']);
            }

            return $careerProfile->load([
                'experiences.employmentType',
                'educations',
                'skills',
            ]);
        });
    }

    /**
     * @param array<int, array<string, mixed>> $experiences
     */
    private function syncExperiences(CareerProfile $careerProfile, array $experiences): void
    {
        $retainedIds = [];

        foreach (array_values($experiences) as $sortOrder => $experienceData) {
            $experienceId = $experienceData['id'] ?? null;
            unset($experienceData['id']);
            $experienceData['sort_order'] = $sortOrder;

            if ($experienceData['is_current'] ?? false) {
                $experienceData['end_date'] = null;
            }

            if ($experienceId !== null) {
                $experience = $careerProfile->experiences()->whereKey($experienceId)->firstOrFail();
                $experience->update($experienceData);
                $retainedIds[] = $experience->id;
                continue;
            }

            $experience = $careerProfile->experiences()->create($experienceData);
            $retainedIds[] = $experience->id;
        }

        $careerProfile->experiences()->whereNotIn('id', $retainedIds)->delete();
    }

    /**
     * @param array<int, array<string, mixed>> $educations
     */
    private function syncEducations(CareerProfile $careerProfile, array $educations): void
    {
        $retainedIds = [];

        foreach (array_values($educations) as $sortOrder => $educationData) {
            $educationId = $educationData['id'] ?? null;
            unset($educationData['id']);
            $educationData['sort_order'] = $sortOrder;

            if ($educationData['is_currently_enrolled'] ?? false) {
                $educationData['end_date'] = null;
            }

            if ($educationId !== null) {
                $education = $careerProfile->educations()->whereKey($educationId)->firstOrFail();
                $education->update($educationData);
                $retainedIds[] = $education->id;
                continue;
            }

            $education = $careerProfile->educations()->create($educationData);
            $retainedIds[] = $education->id;
        }

        $careerProfile->educations()->whereNotIn('id', $retainedIds)->delete();
    }

    /**
     * @param array<int, array<string, mixed>> $skills
     */
    private function syncSkills(CareerProfile $careerProfile, array $skills): void
    {
        $retainedIds = [];

        foreach (array_values($skills) as $sortOrder => $skillData) {
            $skillId = $skillData['id'] ?? null;
            $name = trim($skillData['name']);
            $skillData = [
                'name' => $name,
                'sort_order' => $sortOrder,
            ];

            if ($skillId !== null) {
                $skill = $careerProfile->skills()->whereKey($skillId)->firstOrFail();
                $skill->update($skillData);
                $retainedIds[] = $skill->id;
                continue;
            }

            $skill = $careerProfile->skills()->create($skillData);
            $retainedIds[] = $skill->id;
        }

        $careerProfile->skills()->whereNotIn('id', $retainedIds)->delete();
    }

    // Career Profile Photos
    public function updatePhoto(User $user, UploadedFile $file): CareerProfile
    {
        $careerProfile = $user->careerProfile()->firstOrCreate();
        $oldPath = $careerProfile->photo_path;
        $disk = Storage::disk(CareerProfile::PHOTO_DISK);

        // store() generates a random filename, so the client controls nothing about the path
        $newPath = $file->store("career-photos/{$user->id}", CareerProfile::PHOTO_DISK);

        if ($newPath === false) {
            throw new RuntimeException('Failed to store the uploaded photo.');
        }

        try {
            $careerProfile->photo_path = $newPath;
            $careerProfile->save();
        } catch (Throwable $e) {
            $disk->delete($newPath); // don't leave an orphaned file behind
            throw $e;
        }

        // Delete the old file only after the new one is safely saved
        if ($oldPath) {
            $disk->delete($oldPath);
        }

        return $careerProfile;
    }

    public function deletePhoto(User $user): void
    {
        $careerProfile = $user->careerProfile()->firstOrCreate();
        $path = $careerProfile->photo_path;

        $careerProfile->photo_path = null;
        $careerProfile->save();

        if ($path) {
            Storage::disk(CareerProfile::PHOTO_DISK)->delete($path);
        }
    }
}
