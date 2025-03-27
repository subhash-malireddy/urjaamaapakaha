import { TableCell, TableRow } from "@/components/ui/table";

interface EmptyTableContentProps {
  colSpan: number;
  message: string;
}

export function EmptyTableContent({
  colSpan,
  message,
}: EmptyTableContentProps) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="text-muted-foreground h-24 text-center"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}
