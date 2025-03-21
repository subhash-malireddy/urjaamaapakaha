import { signOut } from "@/app/auth";

export default function SignOutPage() {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Sign Out</h1>
          <p className="mt-2 text-gray-600">
            Are you sure you want to sign out?
          </p>
        </div>
        <form action={handleSignOut} className="mt-8 space-y-6">
          <button
            type="submit"
            className="group relative flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
