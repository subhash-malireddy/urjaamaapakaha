import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { type User } from "next-auth";
import { signOut } from "@/app/auth";

export function UserProfile({ user }: { user: User | undefined }) {
  if (!user) return null;

  // Get first letter of name or email for avatar fallback
  const getInitial = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/signin" });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.image || "/placeholder.svg?height=32&width=32"}
              alt="Profile"
            />
            <AvatarFallback>{getInitial()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="mr-1">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-muted-foreground line-clamp-1 text-xs">
            {user?.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form
            action={signOutAction}
            className="w-full"
            style={{ padding: "unset" }}
          >
            <Button
              variant="ghost"
              type="submit"
              className="hover:text-destructive hover:bg-destructive/10 w-full cursor-pointer justify-start p-0 text-inherit transition-colors duration-200"
            >
              <LogOut className="mr-2 h-4 w-4 text-inherit" />
              <span>Sign out</span>
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
