/**
 * This component is used to display the content for member and non-member users.
 * @param isMember - boolean to check if the user is a member
 * @param children - the member content to display
 * @param nonMemberContent - the non-member content to display. Default - DefaultNonMemberContent component
 * @returns if isMember is true, the children will be displayed, otherwise the nonMemberContent will be displayed
 */
export default function MemberVsNonMemberContent({
  isMember,
  children,
  nonMemberContent = <DefaultNonMemberContent />,
}: {
  isMember?: boolean;
  children: React.ReactNode;
  nonMemberContent?: React.ReactNode;
}) {
  if (!isMember) {
    return nonMemberContent;
  }
  return <>{children}</>;
}

function DefaultNonMemberContent() {
  return (
    <div className="text-muted-foreground text-md italic">
      Member stats will be displayed here
    </div>
  );
}
