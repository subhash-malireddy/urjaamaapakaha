import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
import { signOut } from "@/auth";

export function UserProfile({ user }: { user: User | undefined }) {
  if (!user) return null;

  const signOutAction = async () => {
    "use server";
    await signOut({ redirectTo: "/signin" });
  };

  const getUserInitials = () => {
    return (user.name || user.email)?.slice(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hover:bg-accent relative h-8 w-8 cursor-pointer rounded-full transition-all duration-100 hover:scale-125"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
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
