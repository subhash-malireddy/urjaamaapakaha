import { signIn } from "@/app/auth";

export default function SignInPage() {
  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign In</h1>
          <p className="mt-2 text-gray-600">Sign in to access your account</p>
        </div>
        <form action={handleSignIn} className="mt-8 space-y-6">
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
}
