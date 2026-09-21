import { toast } from "sonner";

// One place for app-wide notifications. The <Toaster /> itself is mounted once in
// the root layout; after that, call `notify.success(...)` from anywhere.

export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  info: (message: string, description?: string) => toast.info(message, { description }),
};

/** Pulls Laravel's `message` out of an axios error, or returns the fallback. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const message = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  return typeof message === "string" && message ? message : fallback;
}
