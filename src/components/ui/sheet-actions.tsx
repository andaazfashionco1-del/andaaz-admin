import { Button } from "./button";

/** Sticky Cancel/Save bar rendered at the bottom of a form inside a Dialog/Sheet body. */
export function SheetActions({
  onCancel,
  saving,
  submitLabel = "Save",
}: {
  onCancel: () => void;
  saving?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="sticky -bottom-5 z-10 -mx-5 mt-2 -mb-5 flex justify-end gap-2 border-t border-line bg-white px-5 py-3">
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button type="submit" loading={saving}>
        {submitLabel}
      </Button>
    </div>
  );
}
