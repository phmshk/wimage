import { toast } from "sonner";

export const notify = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      duration: 3000,
    });
  },

  error: (title: string, error?: unknown) => {
    let description = "Something went wrong";

    if (typeof error === "string") {
      description = error;
    } else if (error instanceof Error) {
      description = error.message;
    }

    toast.error(title, {
      description,
      duration: 5000,
    });
  },
};
