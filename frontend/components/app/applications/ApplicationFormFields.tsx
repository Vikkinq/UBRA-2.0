import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FilterOption } from "@/lib/types/job-applications";

export interface ApplicationFormValues {
  companyName: string;
  jobTitle: string;
  jobUrl: string;
  location: string;
  statusId: string;
  employmentTypeId: string;
  sourceId: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  appliedAt: string;
  notes: string;
}

export const emptyApplicationFormValues: ApplicationFormValues = {
  companyName: "",
  jobTitle: "",
  jobUrl: "",
  location: "",
  statusId: "",
  employmentTypeId: "",
  sourceId: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "",
  appliedAt: "",
  notes: "",
};

interface ApplicationFormFieldsProps {
  values: ApplicationFormValues;
  onChange: (values: ApplicationFormValues) => void;
  statusOptions: FilterOption[];
  employmentTypeOptions: FilterOption[];
  sourceOptions: FilterOption[];
}

export function ApplicationFormFields({
  values,
  onChange,
  statusOptions,
  employmentTypeOptions,
  sourceOptions,
}: ApplicationFormFieldsProps) {
  const update = <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="companyName">Company</Label>
        <Input
          id="companyName"
          value={values.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          placeholder="e.g. Northwind Labs"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input
          id="jobTitle"
          value={values.jobTitle}
          onChange={(e) => update("jobTitle", e.target.value)}
          placeholder="e.g. Frontend Engineer"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="statusId">Status</Label>
          <Select value={values.statusId} onValueChange={(value) => update("statusId", value)}>
            <SelectTrigger id="statusId">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label ?? "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="employmentTypeId">Employment Type</Label>
          <Select value={values.employmentTypeId} onValueChange={(value) => update("employmentTypeId", value)}>
            <SelectTrigger id="employmentTypeId">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypeOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label ?? "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sourceId">Source</Label>
          <Select value={values.sourceId} onValueChange={(value) => update("sourceId", value)}>
            <SelectTrigger id="sourceId">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sourceOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label ?? "Untitled"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={values.location}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g. Remote"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryMin">Salary Min</Label>
          <Input
            id="salaryMin"
            type="number"
            inputMode="decimal"
            value={values.salaryMin}
            onChange={(e) => update("salaryMin", e.target.value)}
            placeholder="80000"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryMax">Salary Max</Label>
          <Input
            id="salaryMax"
            type="number"
            inputMode="decimal"
            value={values.salaryMax}
            onChange={(e) => update("salaryMax", e.target.value)}
            placeholder="100000"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="salaryCurrency">Currency</Label>
          <Input
            id="salaryCurrency"
            value={values.salaryCurrency}
            onChange={(e) => update("salaryCurrency", e.target.value.toUpperCase())}
            placeholder="USD"
            maxLength={3}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="appliedAt">Applied Date</Label>
        <Input
          id="appliedAt"
          type="date"
          value={values.appliedAt}
          onChange={(e) => update("appliedAt", e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="jobUrl">Job URL</Label>
        <Input
          id="jobUrl"
          type="url"
          value={values.jobUrl}
          onChange={(e) => update("jobUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anything worth remembering about this application..."
          rows={3}
        />
      </div>
    </div>
  );
}
