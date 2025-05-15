import type { LucideIcon} from "lucide-react";
import { RefreshCw, User, Droplet, Lock, ChevronLeft, ChevronRight } from "lucide-react";

interface IconProps {
  name: "refresh" | "user" | "droplet" | "lock" | "chevron-left" | "chevron-right";
  className?: string;
}

export function Icon({ name, className = "" }: IconProps) {
  const icons: Record<IconProps["name"], LucideIcon> = {
    refresh: RefreshCw,
    user: User,
    droplet: Droplet,
    lock: Lock,
    "chevron-left": ChevronLeft,
    "chevron-right": ChevronRight,
  };

  const IconComponent = icons[name];
  return <IconComponent className={className} />;
}
