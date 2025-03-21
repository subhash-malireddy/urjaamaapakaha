import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full">
        <span className="text-primary-foreground font-bold">U</span>
      </div>
      <span className="text-foreground font-bold">Urjaamapakaha</span>
    </Link>
  );
}
