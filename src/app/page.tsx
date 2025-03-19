import Image from "next/image";
import Link from "next/link";
import { auth } from "./auth";
import { ROLES_OBJ, type Role } from "@/lib/roles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  const userRole = session?.user?.role || null;

  // Helper function to get a human-readable role name with appropriate styling
  const getRoleBadge = (role: Role | null) => {
    if (!role) return null;

    const badgeClasses = {
      [ROLES_OBJ.ADMIN]: "bg-purple-100 text-purple-800 border-purple-200",
      [ROLES_OBJ.MEMBER]: "bg-blue-100 text-blue-800 border-blue-200",
      [ROLES_OBJ.GUEST]: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`ml-2 rounded-full border px-2 py-1 text-xs font-medium ${badgeClasses[role]}`}
      >
        {role.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="grid items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]">
      {/* <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start"> */}
      <Image
        className="dark:invert"
        src="/next.svg"
        alt="Next.js logo"
        width={180}
        height={38}
        priority
      />

      {/* Authentication Status */}
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-4 text-xl font-bold">Authentication Status</h2>
        {isAuthenticated ? (
          <div>
            <p className="mb-2 flex items-center font-medium text-green-600">
              ✓ Authenticated as {session?.user?.name}
              {getRoleBadge(userRole)}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Email: {session?.user?.email}
              </p>
            </div>
            <div className="mt-4 flex gap-4">
              <Link
                href="/protected"
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Protected Page
              </Link>
              <Link
                href="/auth/signout"
                className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
              >
                Sign Out
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 font-medium text-red-600">✗ Not authenticated</p>
            <Link
              href="/auth/signin"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Role Information */}
      {isAuthenticated && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Role:</span>{" "}
                {userRole?.toUpperCase()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Permissions:</span>
              </p>
              <ul className="list-inside list-disc text-sm">
                {userRole === ROLES_OBJ.ADMIN && (
                  <>
                    <li>View devices and usage data</li>
                    <li>Control devices (turn on/off)</li>
                    <li>Add/delete devices</li>
                    <li>Manage users</li>
                  </>
                )}
                {userRole === ROLES_OBJ.MEMBER && (
                  <>
                    <li>View devices and usage data</li>
                    <li>Control devices (turn on/off)</li>
                  </>
                )}
                {userRole === ROLES_OBJ.GUEST && (
                  <>
                    <li>View devices and usage data (read-only)</li>
                  </>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <ol className="list-inside list-decimal text-center font-[family-name:var(--font-geist-mono)] text-sm sm:text-left">
        <li className="mb-2">
          Get started by editing{" "}
          <code className="rounded bg-black/[.05] px-1 py-0.5 font-semibold dark:bg-white/[.06]">
            src/app/page.tsx
          </code>
          .
        </li>
        <li>Save and see your changes instantly.</li>
      </ol>

      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <a
          className="bg-foreground text-background flex h-10 items-center justify-center gap-2 rounded-full border border-solid border-transparent px-4 text-sm transition-colors hover:bg-[#383838] sm:h-12 sm:px-5 sm:text-base dark:hover:bg-[#ccc]"
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            className="dark:invert"
            src="/vercel.svg"
            alt="Vercel logomark"
            width={20}
            height={20}
          />
          Deploy now
        </a>
        <a
          className="flex h-10 items-center justify-center rounded-full border border-solid border-black/[.08] px-4 text-sm transition-colors hover:border-transparent hover:bg-[#f2f2f2] sm:h-12 sm:min-w-44 sm:px-5 sm:text-base dark:border-white/[.145] dark:hover:bg-[#1a1a1a]"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read our docs
        </a>
      </div>
      {/* </main> */}
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
