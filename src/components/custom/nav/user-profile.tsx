import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn } from "lucide-react";
import Link from "next/link";

interface ProfileMenuProps {
  isLoggedIn?: boolean;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

export function UserProfile({ isLoggedIn = false, user }: ProfileMenuProps) {
  if (!isLoggedIn) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/signin">
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image || "/placeholder.svg?height=32&width=32"}
              alt="Profile"
            />
            <AvatarFallback>
              {user?.name.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm leading-none font-medium">{user?.name}</p>
          <p className="text-muted-foreground text-xs leading-none">
            {user?.email}
          </p>
        </div>
        <DropdownMenuItem className="mt-2 cursor-pointer">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
