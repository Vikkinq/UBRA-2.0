"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { BookOpen, BriefcaseBusiness, Check, ExternalLink, MapPin, Pencil, Plus, X } from "lucide-react";

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

function FormField({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

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
      setProfile((current) =>
        current
          ? {
              ...current,
              experiences: response.data.experiences ?? [],
            }
          : current,
      );
      setIsExperienceEditing(false);
      notify.edit("Experience Updated", { description: "Your work experience has been saved." });
    } catch (error) {
      setExperienceError(getApiErrorMessage(error));
    } finally {
      setIsSavingExperience(false);
    }
  }

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
      setProfile((current) =>
        current
          ? {
              ...current,
              educations: response.data.educations ?? [],
            }
          : current,
      );
      setIsEducationEditing(false);
      notify.edit("Education Updated", { description: "Your education has been saved." });
    } catch (error) {
      setEducationError(getApiErrorMessage(error));
    } finally {
      setIsSavingEducation(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <AppHeader title="Career Profile" description="A home for your professional story." />
        <div className="flex min-h-56 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (loadError || !profile || !user) {
    return (
      <div className="flex flex-col gap-6">
        <AppHeader title="Career Profile" description="A home for your professional story." />
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive" role="alert">
          {loadError ?? "Couldn't load your career profile."}
        </div>
      </div>
    );
  }

  const socialLinks = getCareerProfileSocialLinks(profile);

  return (
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-6">
      <AppHeader title="Career Profile" description="A home for your professional story." />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(17rem,0.6fr)_minmax(0,2fr)] xl:gap-8">
        <aside className="flex flex-col">
          <Card>
            <CardHeader className="flex flex-col items-center gap-4 text-center">
              <CareerAvatar name={user.name} photoUrl={profile.photo_url} className="size-44 text-4xl sm:size-48" />
              <div className="w-full min-w-0">
                <CardTitle className="break-words text-xl">{user.name}</CardTitle>
                <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                {!isProfileEditing && profile.professional_title && <p className="mt-3 text-sm font-medium text-primary">{profile.professional_title}</p>}
                {!isProfileEditing && profile.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-4 shrink-0" /> {profile.location}
                  </p>
                )}
              </div>
              {!isProfileEditing && (
                <Button variant="outline" size="sm" className="gap-2" onClick={startProfileEdit}>
                  <Pencil className="size-3.5" /> Edit profile
                </Button>
              )}
            </CardHeader>

            <CardContent className="border-t border-border pt-4">
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
                  {profileError && (
                    <p role="alert" className="text-sm text-destructive">
                      {profileError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" disabled={isSavingProfile} onClick={() => setIsProfileEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSavingProfile}>
                      <Check className="size-4" /> {isSavingProfile ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  {profile.summary ? (
                    <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{profile.summary}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Add a short summary to introduce your professional background.</p>
                  )}
                  {profile.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
                  {socialLinks.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-border pt-4">
                      {socialLinks.map((link) => (
                        <a
                          key={link.label}
                          href={link.value}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-primary"
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
            <CardHeader>
              <div className="flex flex-row items-center justify-between gap-3">
                <CardTitle className="text-lg">Skills</CardTitle>

                {!isSkillsEditing && profile.skills.length > 0 && (
                  <Button variant="ghost" size="icon" aria-label="Edit skills" onClick={startSkillsEdit}>
                    <Pencil className="size-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isSkillsEditing ? (
                <form onSubmit={saveSkills} className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {skillDraft.map((skill, index) => (
                      <span
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
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
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
                    <Button type="button" variant="outline" className="gap-2" onClick={addSkill} disabled={!newSkill.trim()}>
                      <Plus className="size-4" /> Add skill
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Enter after each skill. Up to {CAREER_PROFILE_SKILL_LIMIT}.</p>
                  {skillsError && (
                    <p role="alert" className="text-sm text-destructive">
                      {skillsError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" disabled={isSavingSkills} onClick={() => setIsSkillsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSavingSkills}>
                      <Check className="size-4" /> {isSavingSkills ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </form>
              ) : profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill.id} className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm text-foreground">
                      {skill.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-5">
                  <p className="text-sm text-muted-foreground">No skills added yet.</p>
                  <Button size="sm" className="gap-2" onClick={startSkillsEdit}>
                    <Plus className="size-4" /> Add your first skill
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CareerSectionHeader
              icon={<BriefcaseBusiness className="size-4" />}
              title="Experience"
              description="Your work history and professional experience."
              action={
                !isExperienceEditing && profile.experiences.length > 0 ? (
                  <Button variant="ghost" size="icon" aria-label="Edit experience" onClick={startExperienceEdit}>
                    <Pencil className="size-4" />
                  </Button>
                ) : undefined
              }
            />
            <CardContent className="p-0">
              {isExperienceEditing ? (
                <form onSubmit={saveExperiences} className="flex flex-col gap-5 p-5">
                  {experienceDraft.map((experience, index) => (
                    <div key={experience.id ?? `new-${index}`} className="rounded-lg border border-border p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Experience {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove experience ${index + 1}`}
                          onClick={() => setExperienceDraft((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Job title">
                          <Input
                            required
                            maxLength={255}
                            value={experience.job_title}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, job_title: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Company">
                          <Input
                            required
                            maxLength={255}
                            value={experience.company_name}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, company_name: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Location">
                          <Input
                            maxLength={255}
                            value={experience.location}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, location: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Start date">
                          <Input
                            required
                            type="date"
                            value={experience.start_date}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, start_date: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="End date">
                          <Input
                            type="date"
                            disabled={experience.is_current}
                            value={experience.end_date}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, end_date: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={experience.is_current}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, is_current: event.target.checked } : item)),
                              )
                            }
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
                            value={experience.description}
                            onChange={(event) =>
                              setExperienceDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-fit gap-2" onClick={addExperience}>
                    <Plus className="size-4" /> Add experience
                  </Button>
                  {experienceError && (
                    <p role="alert" className="text-sm text-destructive">
                      {experienceError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" disabled={isSavingExperience} onClick={() => setIsExperienceEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSavingExperience}>
                      <Check className="size-4" /> {isSavingExperience ? "Saving..." : "Save experience"}
                    </Button>
                  </div>
                </form>
              ) : profile.experiences.length > 0 ? (
                <div className="divide-y divide-border">
                  {profile.experiences.map((experience) => (
                    <article key={experience.id} className="flex gap-4 p-5">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                        <BriefcaseBusiness className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground">{experience.job_title}</h3>
                        <p className="mt-0.5 text-sm text-foreground">
                          {experience.company_name}
                          {experience.location ? ` · ${experience.location}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatCareerDateRange(experience.start_date, experience.end_date, experience.is_current)}
                          {experience.employment_type?.name ? ` · ${experience.employment_type.name}` : ""}
                        </p>
                        {experience.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{experience.description}</p>}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 p-5">
                  <p className="text-sm text-muted-foreground">Add your work history to show the experience behind your skills.</p>
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
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CareerSectionHeader
              icon={<BookOpen className="size-4" />}
              title="Education"
              description="Schools, degrees, and learning."
              action={
                !isEducationEditing && profile.educations.length > 0 ? (
                  <Button variant="ghost" size="icon" aria-label="Edit education" onClick={startEducationEdit}>
                    <Pencil className="size-4" />
                  </Button>
                ) : undefined
              }
            />
            <CardContent className="p-0">
              {isEducationEditing ? (
                <form onSubmit={saveEducations} className="flex flex-col gap-5 p-5">
                  {educationDraft.map((education, index) => (
                    <div key={education.id ?? `new-${index}`} className="rounded-lg border border-border p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">Education {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove education ${index + 1}`}
                          onClick={() => setEducationDraft((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Education level">
                          <Input
                            required
                            maxLength={100}
                            placeholder="e.g. Bachelor's degree"
                            value={education.education_level}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, education_level: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Institution">
                          <Input
                            required
                            maxLength={255}
                            value={education.institution_name}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, institution_name: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Degree">
                          <Input
                            maxLength={255}
                            value={education.degree}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, degree: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Field of study">
                          <Input
                            maxLength={255}
                            value={education.field_of_study}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, field_of_study: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Location">
                          <Input
                            maxLength={255}
                            value={education.location}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, location: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="Start date">
                          <Input
                            type="date"
                            value={education.start_date}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, start_date: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <FormField label="End date">
                          <Input
                            type="date"
                            disabled={education.is_currently_enrolled}
                            value={education.end_date}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, end_date: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                        <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground">
                          <input
                            type="checkbox"
                            checked={education.is_currently_enrolled}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, is_currently_enrolled: event.target.checked } : item)),
                              )
                            }
                            className="size-4 accent-primary"
                          />
                          I’m currently enrolled
                        </label>
                        <FormField label="Description" className="sm:col-span-2">
                          <Textarea
                            maxLength={5000}
                            value={education.description}
                            onChange={(event) =>
                              setEducationDraft((items) =>
                                items.map((item, itemIndex) => (itemIndex === index ? { ...item, description: event.target.value } : item)),
                              )
                            }
                          />
                        </FormField>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="outline" className="w-fit gap-2" onClick={addEducation}>
                    <Plus className="size-4" /> Add education
                  </Button>
                  {educationError && (
                    <p role="alert" className="text-sm text-destructive">
                      {educationError}
                    </p>
                  )}
                  <div className="flex justify-end gap-2 border-t border-border pt-4">
                    <Button type="button" variant="outline" disabled={isSavingEducation} onClick={() => setIsEducationEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="gap-2" disabled={isSavingEducation}>
                      <Check className="size-4" /> {isSavingEducation ? "Saving..." : "Save education"}
                    </Button>
                  </div>
                </form>
              ) : profile.educations.length > 0 ? (
                <div className="divide-y divide-border">
                  {profile.educations.map((education) => (
                    <article key={education.id} className="flex gap-4 p-5">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground">{education.institution_name}</h3>
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
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3 p-5">
                  <p className="text-sm text-muted-foreground">Add your education history to complete your profile.</p>
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
