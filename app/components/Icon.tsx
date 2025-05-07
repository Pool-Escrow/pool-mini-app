import { LucideIcon, RefreshCw, User, BookOpen, Lock } from "lucide-react";

interface IconProps {
  name: "refresh" | "user" | "droplet" | "lock";
  className?: string;
}

export function Icon({ name, className = "" }: IconProps) {
  const icons: Record<IconProps["name"], LucideIcon> = {
    refresh: RefreshCw,
    user: User,
    droplet: BookOpen,
    lock: Lock,
  };

  const IconComponent = icons[name];
  return <IconComponent className={className} />;
}
