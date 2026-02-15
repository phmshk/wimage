import { useTheme } from "@/entities/theme";
import { Toaster } from "sonner";

export const ToastProvider = () => {
  const theme = useTheme();

  return <Toaster theme={theme} richColors position="bottom-left" />;
};
