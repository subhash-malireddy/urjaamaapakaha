import { signIn } from "@/app/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  async function handleSignIn() {
    "use server";
    console.log(
      "🚀 ~ process.env.GOOGLE_CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID,
    );
    console.log(
      "🚀 ~ process.env.GOOGLE_CLIENT_SECRET:",
      process.env.GOOGLE_CLIENT_SECRET,
    );
    console.log(
      "🚀 ~ process.env.NEXTAUTH_SECRET:",
      process.env.NEXTAUTH_SECRET,
    );
    console.log("🚀 ~ process.env.NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSignIn} className="space-y-6">
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
            >
              Sign in with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
