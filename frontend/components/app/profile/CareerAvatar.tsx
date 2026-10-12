import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/career-profile";

interface CareerAvatarProps {
  name: string;
  photoUrl: string | null;
  className?: string;
}

export function CareerAvatar({ name, photoUrl, className }: CareerAvatarProps) {
  return (
    <Avatar className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt={`${name}'s profile photo`} />}
      <AvatarFallback className="bg-primary/10 font-medium text-primary">{getUserInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
