"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { AlertCircle, BookOpen, BriefcaseBusiness, Check, ExternalLink, Mail, MapPin, Pencil, Phone, Plus, Sparkles, X } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { CareerAvatar } from "@/components/app/profile/CareerAvatar";
import { CareerSectionHeader } from "@/components/app/profile/CareerSectionHeader";
import { getApiErrorMessage, notify } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import {
  CAREER_PROFILE_SKILL_LIMIT,
  CAREER_PROFILE_SOCIAL_FIELDS,
  EMPTY_CAREER_EDUCATION_FIELDS,
  EMPTY_CAREER_EXPERIENCE_FIELDS,
  EMPTY_CAREER_PROFILE_FIELDS,
  formatCareerDateRange,
  getCareerProfileSocialLinks,
  normalizeSkillName,
  toCareerEducationFields,
  toCareerExperienceFields,
  toCareerProfileFields,
} from "@/lib/career-profile";
import type { CareerEducationFields, CareerExperienceFields, CareerProfile, CareerProfileFields, CareerSkill, CurrentUser } from "@/lib/types/career-profile";

/* -------------------------------------------------------------------------- */
/*  Small UI helpers                                                          */
/* -------------------------------------------------------------------------- */

function FormField({ label, required, children, className = "" }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium text-foreground ${className}`}>
      <span>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-destructive">
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

function FormActions({ saving, onCancel, saveLabel = "Save" }: { saving: boolean; onCancel: () => void; saveLabel?: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-border pt-4">
      <Button type="button" variant="outline" disabled={saving} onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" className="gap-2" disabled={saving}>
        <Check className="size-4" /> {saving ? "Saving..." : saveLabel}
      </Button>
    </div>
  );
}

function EmptyState({ icon, text, action }: { icon: ReactNode; text: string; action: ReactNode }) {
  return (
    <div className="m-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <p className="max-w-sm text-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

function TimelineItem({ icon, isLast, children }: { icon: ReactNode; isLast: boolean; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">{icon}</div>
        {!isLast && <div className="mt-2 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>
      <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-6"}`}>{children}</div>
    </li>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{children}</span>;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function ProfileSkeleton() {
  return (
    <div
      className="grid items-start gap-6 lg:grid-cols-[minmax(17rem,0.6fr)_minmax(0,2fr)] xl:gap-8"
      role="status"
      aria-busy="true"
      aria-label="Loading your profile"
    >
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-6">
        <SkeletonBlock className="size-40 rounded-full" />
        <SkeletonBlock className="h-5 w-40" />
        <SkeletonBlock className="h-4 w-52" />
        <SkeletonBlock className="mt-4 h-20 w-full" />
      </div>
      <div className="flex flex-col gap-6">
        {[0, 1].map((key) => (
          <div key={key} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-4 w-64" />
            <SkeletonBlock className="h-16 w-full" />
            <SkeletonBlock className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function updateAt<T>(items: T[], index: number, patch: Partial<T>): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}

/* -------------------------------------------------------------------------- */
/*  Payload helpers                                                           */
/* -------------------------------------------------------------------------- */

function getExperiencePayload(values: CareerExperienceFields[]) {
  return values.map(({ id, ...experience }) => ({
    ...(id ? { id } : {}),
    ...experience,
    location: experience.location || null,
    end_date: experience.is_current ? null : experience.end_date || null,
    description: experience.description || null,
  }));
}

function getEducationPayload(values: CareerEducationFields[]) {
  return values.map(({ id, ...education }) => ({
    ...(id ? { id } : {}),
    ...education,
    degree: education.degree || null,
    field_of_study: education.field_of_study || null,
    location: education.location || null,
    start_date: education.start_date || null,
    end_date: education.is_currently_enrolled ? null : education.end_date || null,
    description: education.description || null,
  }));
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function CareerProfilePage() {
  const [profile, setProfile] = useState<CareerProfile | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [profileDraft, setProfileDraft] = useState<CareerProfileFields>(EMPTY_CAREER_PROFILE_FIELDS);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [isSkillsEditing, setIsSkillsEditing] = useState(false);
  const [skillDraft, setSkillDraft] = useState<CareerSkill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isSavingSkills, setIsSavingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const [isExperienceEditing, setIsExperienceEditing] = useState(false);
  const [experienceDraft, setExperienceDraft] = useState<CareerExperienceFields[]>([]);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [experienceError, setExperienceError] = useState<string | null>(null);

  const [isEducationEditing, setIsEducationEditing] = useState(false);
  const [educationDraft, setEducationDraft] = useState<CareerEducationFields[]>([]);
  const [isSavingEducation, setIsSavingEducation] = useState(false);
  const [educationError, setEducationError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setLoadError(null);
      try {
        const [profileResponse, userResponse] = await Promise.all([api.get<CareerProfile>("/career-profile"), api.get<CurrentUser>("/user")]);
        if (!cancelled) {
          setProfile({
            ...profileResponse.data,
            skills: profileResponse.data.skills ?? [],
            experiences: profileResponse.data.experiences ?? [],
            educations: profileResponse.data.educations ?? [],
          });
          setUser(userResponse.data);
        }
      } catch (error) {
        if (!cancelled) setLoadError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------- Profile -------------------------------- */

  function startProfileEdit() {
    if (!profile) return;
    setProfileDraft(toCareerProfileFields(profile));
    setProfileError(null);
    setIsProfileEditing(true);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    try {
      const response = await api.patch<CareerProfile>("/career-profile", profileDraft);
      setProfile({
        ...response.data,
        skills: response.data.skills ?? profile?.skills ?? [],
        experiences: response.data.experiences ?? profile?.experiences ?? [],
        educations: response.data.educations ?? profile?.educations ?? [],
      });
      setIsProfileEditing(false);
      notify.edit("Profile Updated", { description: "Your profile details have been saved." });
    } catch (error) {
      setProfileError(getApiErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  }

  /* -------------------------------- Skills -------------------------------- */

  function startSkillsEdit() {
    setSkillDraft(profile?.skills.map((skill) => ({ ...skill })) ?? []);
    setNewSkill("");
    setSkillsError(null);
    setIsSkillsEditing(true);
  }

  function addSkill() {
    const name = newSkill.trim();
    if (!name) return;
    if (skillDraft.some((skill) => normalizeSkillName(skill.name) === normalizeSkillName(name))) {
      setSkillsError("That skill is already on your list.");
      return;
    }
    if (skillDraft.length >= CAREER_PROFILE_SKILL_LIMIT) {
      setSkillsError(`You can add up to ${CAREER_PROFILE_SKILL_LIMIT} skills.`);
      return;
    }

    setSkillDraft((skills) => [...skills, { id: 0, name, sort_order: skills.length }]);
    setNewSkill("");
    setSkillsError(null);
  }

  function handleSkillInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  async function saveSkills(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingSkills(true);
    setSkillsError(null);
    try {
      const skills = skillDraft.map((skill) => (skill.id > 0 ? { id: skill.id, name: skill.name } : { name: skill.name }));
      const response = await api.patch<CareerProfile>("/career-profile", { skills });
      setProfile((current) => (current ? { ...current, skills: response.data.skills ?? [] } : current));
      setIsSkillsEditing(false);
      setNewSkill("");
      notify.edit("Skills Updated", { description: "Your skill list has been saved." });
    } catch (error) {
      setSkillsError(getApiErrorMessage(error));
    } finally {
      setIsSavingSkills(false);
    }
  }

  /* ------------------------------ Experience ------------------------------ */

  function startExperienceEdit() {
    setExperienceDraft(profile?.experiences.map(toCareerExperienceFields) ?? []);
    setExperienceError(null);
    setIsExperienceEditing(true);
  }

  function addExperience() {
    setExperienceDraft((experiences) => [...experiences, { ...EMPTY_CAREER_EXPERIENCE_FIELDS }]);
  }

  async function saveExperiences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingExperience(true);
    setExperienceError(null);
    try {
      const response = await api.patch<CareerProfile>("/career-profile", {
        experiences: getExperiencePayload(experienceDraft),
      });
      setProfile((current) => (current ? { ...current, experiences: response.data.experiences ?? [] } : current));
      setIsExperienceEditing(false);
      notify.edit("Experience Updated", { description: "Your work experience has been saved." });
    } catch (error) {
      setExperienceError(getApiErrorMessage(error));
    } finally {
      setIsSavingExperience(false);
    }
  }

  /* ------------------------------ Education ------------------------------- */

  function startEducationEdit() {
    setEducationDraft(profile?.educations.map(toCareerEducationFields) ?? []);
    setEducationError(null);
    setIsEducationEditing(true);
  }

  function addEducation() {
    setEducationDraft((educations) => [...educations, { ...EMPTY_CAREER_EDUCATION_FIELDS }]);
  }

  async function saveEducations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingEducation(true);
    setEducationError(null);
    try {
      const response = await api.patch<CareerProfile>("/career-profile", {
        educations: getEducationPayload(educationDraft),
      });
      setProfile((current) => (current ? { ...current, educations: response.data.educations ?? [] } : current));
      setIsEducationEditing(false);
      notify.edit("Education Updated", { description: "Your education has been saved." });
    } catch (error) {
      setEducationError(getApiErrorMessage(error));
    } finally {
      setIsSavingEducation(false);
    }
  }

  /* ------------------------------- States --------------------------------- */

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
        <AppHeader title="Career Profile" description="A home for your professional story." />
        <ProfileSkeleton />
      </div>
    );
  }

  if (loadError || !profile || !user) {
    return (
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
        <AppHeader title="Career Profile" description="A home for your professional story." />
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{loadError ?? "Couldn't load your career profile."}</span>
        </div>
      </div>
    );
  }

  const socialLinks = getCareerProfileSocialLinks(profile);
  const editIconButton = "text-muted-foreground hover:text-foreground";

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
      <AppHeader title="Career Profile" description="A home for your professional story." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(17rem,0.6fr)_minmax(0,2fr)] xl:gap-8">
        {/* ------------------------------ Sidebar ------------------------------ */}
        <aside className="flex flex-col lg:sticky lg:top-6">
          <Card>
            <CardHeader className="flex flex-col items-center gap-4 text-center">
              <CareerAvatar name={user.name} photoUrl={profile.photo_url} className="size-36 text-4xl ring-4 ring-primary/10 sm:size-44" />
              <div className="w-full min-w-0">
                <CardTitle className="break-words text-xl">{user.name}</CardTitle>
                {!isProfileEditing && profile.professional_title && <p className="mt-1.5 text-sm font-medium text-primary">{profile.professional_title}</p>}
                <div className="mt-3 flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
                  <p className="flex max-w-full items-center gap-1.5">
                    <Mail className="size-4 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {!isProfileEditing && profile.location && (
                    <p className="flex max-w-full items-center gap-1.5">
                      <MapPin className="size-4 shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </p>
                  )}
                  {!isProfileEditing && profile.phone && (
                    <p className="flex max-w-full items-center gap-1.5">
                      <Phone className="size-4 shrink-0" />
                      <span className="truncate">{profile.phone}</span>
                    </p>
                  )}
                </div>
              </div>
              {!isProfileEditing && (
                <Button variant="outline" size="sm" className="w-full gap-2 sm:w-auto" onClick={startProfileEdit}>
                  <Pencil className="size-3.5" /> Edit profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="border-t border-border pt-5">
              {isProfileEditing ? (
                <form onSubmit={saveProfile} className="flex flex-col gap-4">
                  <FormField label="Professional title">
                    <Input
                      maxLength={255}
                      placeholder="e.g. Product Designer"
                      value={profileDraft.professional_title}
                      onChange={(event) => setProfileDraft((values) => ({ ...values, professional_title: event.target.value }))}
                    />
                  </FormField>
                  <FormField label="Location">
                    <Input
                      maxLength={255}
                      placeholder="City or region"
                      value={profileDraft.location}
                      onChange={(event) => setProfileDraft((values) => ({ ...values, location: event.target.value }))}
                    />
                  </FormField>
                  <FormField label="Phone">
                    <Input
                      maxLength={50}
                      type="tel"
                      placeholder="Phone number"
                      value={profileDraft.phone}
                      onChange={(event) => setProfileDraft((values) => ({ ...values, phone: event.target.value }))}
                    />
                  </FormField>
                  <FormField label="Summary">
                    <Textarea
                      maxLength={5000}
                      rows={5}
                      placeholder="A short introduction about your professional background..."
                      value={profileDraft.summary}
                      onChange={(event) => setProfileDraft((values) => ({ ...values, summary: event.target.value }))}
                    />
                  </FormField>
                  {CAREER_PROFILE_SOCIAL_FIELDS.map(({ field, label }) => (
                    <FormField key={field} label={label}>
                      <Input
                        type="url"
                        maxLength={255}
                        placeholder="https://"
                        value={profileDraft[field]}
                        onChange={(event) => setProfileDraft((values) => ({ ...values, [field]: event.target.value }))}
                      />
                    </FormField>
                  ))}
                  <FormError message={profileError} />
                  <FormActions saving={isSavingProfile} onCancel={() => setIsProfileEditing(false)} />
                </form>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">About</h3>
                    {profile.summary ? (
                      <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{profile.summary}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Add a short summary to introduce your professional background.</p>
                    )}
                  </div>
                  {socialLinks.length > 0 && (
                    <div className="flex flex-col gap-1 border-t border-border pt-4">
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Links</h3>
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.value}
                          target="_blank"
                          rel="noreferrer"
                          className="-mx-2 inline-flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <ExternalLink className="size-3.5 shrink-0" />
                          <span className="truncate">{link.label}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <Separator className="mx-auto w-[calc(100%-3rem)]" />

            {/* ------------------------------ Skills ------------------------------ */}
            <CardHeader>
              <div className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-primary" /> Skills
                </CardTitle>
                {!isSkillsEditing && profile.skills.length > 0 && (
                  <Button variant="ghost" size="icon" className={editIconButton} aria-label="Edit skills" onClick={startSkillsEdit}>
                    <Pencil className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isSkillsEditing ? (
                <form onSubmit={saveSkills} className="flex flex-col gap-4">
                  {skillDraft.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {skillDraft.map((skill, index) => (
                        <li
                          key={skill.id > 0 ? `skill-${skill.id}` : `new-skill-${index}`}
                          className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-primary/5 py-1 pl-3 pr-1 text-sm text-foreground"
                        >
                          {skill.name}
                          <button
                            type="button"
                            aria-label={`Remove ${skill.name}`}
                            className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => setSkillDraft((skills) => skills.filter((_, skillIndex) => skillIndex !== index))}
                          >
                            <X className="size-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <Input
                      aria-label="Add a skill"
                      maxLength={255}
                      placeholder="Type a skill and press Enter"
                      value={newSkill}
                      onKeyDown={handleSkillInputKeyDown}
                      onChange={(event) => {
                        setNewSkill(event.target.value);
                        setSkillsError(null);
                      }}
                    />
                    <Button type="button" variant="outline" className="shrink-0 gap-1.5" onClick={addSkill} disabled={!newSkill.trim()}>
                      <Plus className="size-4" /> Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {skillDraft.length}/{CAREER_PROFILE_SKILL_LIMIT} skills · Press Enter to add each one.
                  </p>
                  <FormError message={skillsError} />
                  <FormActions saving={isSavingSkills} onCancel={() => setIsSkillsEditing(false)} />
                </form>
              ) : profile.skills.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <li key={skill.id} className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground">
                      {skill.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-5">
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  <Button size="sm" className="gap-2" onClick={startSkillsEdit}>
                    <Plus className="size-4" /> Add your first skill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* ----------------------------- Main column ---------------------------- */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* ---------------------------- Experience ---------------------------- */}
          <Card>
            <CareerSectionHeader
              icon={<BriefcaseBusiness className="size-4" />}
              title="Experience"
              description="Your work history and professional experience."
              action={
                !isExperienceEditing && profile.experiences.length > 0 ? (
                  <Button variant="ghost" size="icon" className={editIconButton} aria-label="Edit experience" onClick={startExperienceEdit}>
                    <Pencil className="size-4" />
                  </Button>
                ) : undefined
              }
            />
            <CardContent className="p-0">
              {isExperienceEditing ? (
                <form onSubmit={saveExperiences} className="flex flex-col gap-5 p-5">
                  {experienceDraft.map((experience, index) => (
                    <fieldset key={experience.id ?? `new-${index}`} className="rounded-xl border border-border bg-muted/10 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <legend className="float-left text-sm font-semibold">Experience {index + 1}</legend>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove experience ${index + 1}`}
                          onClick={() => setExperienceDraft((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="clear-both grid gap-4 sm:grid-cols-2">
                        <FormField label="Job title" required>
                          <Input
                            required
                            maxLength={255}
                            value={experience.job_title}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { job_title: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Company" required>
                          <Input
                            required
                            maxLength={255}
                            value={experience.company_name}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { company_name: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Location" className="sm:col-span-2">
                          <Input
                            maxLength={255}
                            value={experience.location}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { location: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Start date" required>
                          <Input
                            required
                            type="date"
                            value={experience.start_date}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { start_date: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="End date">
                          <Input
                            type="date"
                            disabled={experience.is_current}
                            value={experience.end_date}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { end_date: event.target.value }))}
                          />
                        </FormField>
                        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-foreground sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={experience.is_current}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { is_current: event.target.checked }))}
                            className="size-4 accent-primary"
                          />
                          I currently work here
                        </label>
                        {experience.employment_type_id && (
                          <p className="text-xs text-muted-foreground sm:col-span-2">
                            Employment type: {profile.experiences.find((item) => item.id === experience.id)?.employment_type?.name ?? "Saved"}
                          </p>
                        )}
                        <FormField label="Description" className="sm:col-span-2">
                          <Textarea
                            maxLength={5000}
                            rows={4}
                            value={experience.description}
                            onChange={(event) => setExperienceDraft((items) => updateAt(items, index, { description: event.target.value }))}
                          />
                        </FormField>
                      </div>
                    </fieldset>
                  ))}
                  <Button type="button" variant="outline" className="w-fit gap-2" onClick={addExperience}>
                    <Plus className="size-4" /> Add experience
                  </Button>
                  <FormError message={experienceError} />
                  <FormActions saving={isSavingExperience} saveLabel="Save experience" onCancel={() => setIsExperienceEditing(false)} />
                </form>
              ) : profile.experiences.length > 0 ? (
                <ol className="flex flex-col p-5">
                  {profile.experiences.map((experience, index) => (
                    <TimelineItem key={experience.id} icon={<BriefcaseBusiness className="size-4" />} isLast={index === profile.experiences.length - 1}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold text-foreground">{experience.job_title}</h3>
                        {experience.is_current && <Badge>Current</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-foreground">
                        {experience.company_name}
                        {experience.location ? ` · ${experience.location}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCareerDateRange(experience.start_date, experience.end_date, experience.is_current)}
                        {experience.employment_type?.name ? ` · ${experience.employment_type.name}` : ""}
                      </p>
                      {experience.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{experience.description}</p>}
                    </TimelineItem>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon={<BriefcaseBusiness className="size-5" />}
                  text="Add your work history to show the experience behind your skills."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        startExperienceEdit();
                        setExperienceDraft([{ ...EMPTY_CAREER_EXPERIENCE_FIELDS }]);
                      }}
                    >
                      <Plus className="size-4" /> Add experience
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* ----------------------------- Education ----------------------------- */}
          <Card>
            <CareerSectionHeader
              icon={<BookOpen className="size-4" />}
              title="Education"
              description="Schools, degrees, and learning."
              action={
                !isEducationEditing && profile.educations.length > 0 ? (
                  <Button variant="ghost" size="icon" className={editIconButton} aria-label="Edit education" onClick={startEducationEdit}>
                    <Pencil className="size-4" />
                  </Button>
                ) : undefined
              }
            />
            <CardContent className="p-0">
              {isEducationEditing ? (
                <form onSubmit={saveEducations} className="flex flex-col gap-5 p-5">
                  {educationDraft.map((education, index) => (
                    <fieldset key={education.id ?? `new-${index}`} className="rounded-xl border border-border bg-muted/10 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <legend className="float-left text-sm font-semibold">Education {index + 1}</legend>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove education ${index + 1}`}
                          onClick={() => setEducationDraft((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="clear-both grid gap-4 sm:grid-cols-2">
                        <FormField label="Education level" required>
                          <Input
                            required
                            maxLength={100}
                            placeholder="e.g. Bachelor's degree"
                            value={education.education_level}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { education_level: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Institution" required>
                          <Input
                            required
                            maxLength={255}
                            value={education.institution_name}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { institution_name: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Degree">
                          <Input
                            maxLength={255}
                            value={education.degree}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { degree: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Field of study">
                          <Input
                            maxLength={255}
                            value={education.field_of_study}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { field_of_study: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Location" className="sm:col-span-2">
                          <Input
                            maxLength={255}
                            value={education.location}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { location: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="Start date">
                          <Input
                            type="date"
                            value={education.start_date}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { start_date: event.target.value }))}
                          />
                        </FormField>
                        <FormField label="End date">
                          <Input
                            type="date"
                            disabled={education.is_currently_enrolled}
                            value={education.end_date}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { end_date: event.target.value }))}
                          />
                        </FormField>
                        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-sm text-foreground sm:col-span-2">
                          <input
                            type="checkbox"
                            checked={education.is_currently_enrolled}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { is_currently_enrolled: event.target.checked }))}
                            className="size-4 accent-primary"
                          />
                          I’m currently enrolled
                        </label>
                        <FormField label="Description" className="sm:col-span-2">
                          <Textarea
                            maxLength={5000}
                            rows={4}
                            value={education.description}
                            onChange={(event) => setEducationDraft((items) => updateAt(items, index, { description: event.target.value }))}
                          />
                        </FormField>
                      </div>
                    </fieldset>
                  ))}
                  <Button type="button" variant="outline" className="w-fit gap-2" onClick={addEducation}>
                    <Plus className="size-4" /> Add education
                  </Button>
                  <FormError message={educationError} />
                  <FormActions saving={isSavingEducation} saveLabel="Save education" onCancel={() => setIsEducationEditing(false)} />
                </form>
              ) : profile.educations.length > 0 ? (
                <ol className="flex flex-col p-5">
                  {profile.educations.map((education, index) => (
                    <TimelineItem key={education.id} icon={<BookOpen className="size-4" />} isLast={index === profile.educations.length - 1}>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="font-semibold text-foreground">{education.institution_name}</h3>
                        {education.is_currently_enrolled && <Badge>Enrolled</Badge>}
                      </div>
                      <p className="mt-0.5 text-sm text-foreground">
                        {[education.degree, education.field_of_study].filter(Boolean).join(" · ") || education.education_level}
                      </p>
                      {education.education_level && (education.degree || education.field_of_study) && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{education.education_level}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatCareerDateRange(education.start_date, education.end_date, education.is_currently_enrolled)}
                        {education.location ? ` · ${education.location}` : ""}
                      </p>
                      {education.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{education.description}</p>}
                    </TimelineItem>
                  ))}
                </ol>
              ) : (
                <EmptyState
                  icon={<BookOpen className="size-5" />}
                  text="Add your education history to complete your profile."
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        startEducationEdit();
                        setEducationDraft([{ ...EMPTY_CAREER_EDUCATION_FIELDS }]);
                      }}
                    >
                      <Plus className="size-4" /> Add education
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
