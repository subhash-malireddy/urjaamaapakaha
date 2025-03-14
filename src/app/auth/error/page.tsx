import Link from "next/link";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const error = resolvedSearchParams.error || "An unknown error occurred";

  let errorMessage = "An unknown error occurred during authentication.";

  switch (error) {
    case "AccessDenied":
      errorMessage = "You do not have permission to access this resource.";
      break;
    case "Configuration":
      errorMessage = "There is a problem with the server configuration.";
      break;
    case "Verification":
      errorMessage = "The verification link may have been used or is invalid.";
      break;
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "OAuthAccountNotLinked":
    case "Callback":
      errorMessage = "There was a problem with the OAuth authentication.";
      break;
    case "Default":
    default:
      errorMessage = "An unexpected error occurred during authentication.";
      break;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Authentication Error
          </h1>
          <p className="mt-4 text-gray-700">{errorMessage}</p>
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
