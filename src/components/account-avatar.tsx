import type { User } from "@supabase/supabase-js";
import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AccountAvatar({ user, className = "" }: { user: User | null; className?: string }) {
  const name: unknown = user?.user_metadata["full_name"];
  const photo: unknown = user?.user_metadata["avatar_url"];
  return <Avatar className={`border border-primary/40 ${className}`}>
    {typeof photo === "string" && photo.startsWith("https://") ? <AvatarImage src={photo} alt="Your profile" /> : null}
    <AvatarFallback className="bg-primary/10 text-primary">{typeof name === "string" && name.trim() ? name.trim().slice(0, 1).toUpperCase() : <UserRound className="size-5" />}</AvatarFallback>
  </Avatar>;
}