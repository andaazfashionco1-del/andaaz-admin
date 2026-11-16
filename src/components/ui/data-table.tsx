import { cn } from "@/lib/format";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  /** Hide this column's label in the mobile card layout (e.g. primary/name column). */
  hideMobileLabel?: boolean;
  /** Skip this column entirely on mobile. */
  hideOnMobile?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Slot rendered at the top-right of each mobile card (usually row actions). */
  mobileActions?: (row: T) => React.ReactNode;
  caption: string;
};

/** Table on desktop, stacked cards on mobile. */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  mobileActions,
  caption,
}: DataTableProps<T>) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line bg-paper/60 text-xs tracking-wide text-muted uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cn("px-4 py-3 font-semibold", col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("transition", onRowClick && "cursor-pointer hover:bg-paper/60")}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="flex flex-col gap-3 md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li
            key={getRowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "rounded-2xl border border-line bg-white p-4",
              onRowClick && "cursor-pointer active:bg-paper/60",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) =>
                    col.hideMobileLabel ? (
                      <dd key={col.key} className="col-span-2 min-w-0">
                        {col.cell(row)}
                      </dd>
                    ) : (
                      <div key={col.key} className="contents">
                        <dt className="text-xs font-semibold text-muted uppercase">{col.header}</dt>
                        <dd className="min-w-0 text-right">{col.cell(row)}</dd>
                      </div>
                    ),
                  )}
              </dl>
              {mobileActions && (
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  {mobileActions(row)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
