import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Loader = ({ className, size = "md" }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 z-50">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-benin-green/20 border-t-benin-green mb-4",
          sizeClasses[size],
          className
        )}
      />
      <div className="text-lg text-gray-600 dark:text-gray-400">Chargement...</div>
    </div>
  );
};

export default Loader; 