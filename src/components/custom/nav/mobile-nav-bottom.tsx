import { NavLinks } from "./nav-links";

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="bg-background fixed right-0 bottom-0 left-0 z-50 border-t md:hidden">
      <div className="flex h-14 items-center justify-around">
        <NavLinks
          isAdmin={isAdmin}
          itemClassName="flex h-full w-full flex-col items-center justify-center gap-0 text-xs"
          showIcons={true}
          iconClassName="mb-0.5 h-5 w-5"
        />
      </div>
    </div>
  );
}
