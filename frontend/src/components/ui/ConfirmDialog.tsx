import { useEffect, useId, useRef, type ReactNode } from "react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    children: ReactNode;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmVariant?: "primary" | "danger";
    busy?: boolean;
    onConfirm?: () => void;
    onCancel: () => void;
}

function ConfirmDialog({
    open,
    title,
    children,
    cancelLabel = "Cancel",
    confirmLabel,
    confirmVariant = "danger",
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            className="m-auto max-h-[85vh] w-[min(28rem,calc(100%-2rem))] flex-col rounded-2xl border border-border/40 bg-surface p-5 text-body backdrop:bg-header/40 open:flex"
            onCancel={(e) => {
                // Esc closes through our state so the parent stays in sync
                e.preventDefault();
                onCancel();
            }}
        >
            <h2 id={titleId} className="mb-2 text-xl font-semibold text-header">
                {title}
            </h2>
            <div className="mb-5 min-h-0 overflow-y-auto">{children}</div>
            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                {onConfirm && confirmLabel && (
                    <Button variant={confirmVariant} disabled={busy} onClick={onConfirm}>
                        {busy ? <LoadingSpinner className="h-4 w-4" /> : confirmLabel}
                    </Button>
                )}
            </div>
        </dialog>
    );
}

export default ConfirmDialog;
