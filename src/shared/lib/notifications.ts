import { toast } from "sonner";

export const notify = {
  success: (title: string, description?: string, duration?: number) => {
    toast.success(title, {
      description,
      duration: duration ?? 3000,
    });
  },

  error: (title: string, error?: unknown, duration?: number) => {
    let description = "Something went wrong";

    if (typeof error === "string") {
      description = error;
    } else if (error instanceof Error) {
      description = error.message;
    }

    toast.error(title, {
      description,
      duration: duration ?? 5000,
    });
  },

  warning: (title: string, description: string, duration?: number) => {
    toast.warning(title, {
      description,
      duration: duration ?? 3000,
    });
  },
};
