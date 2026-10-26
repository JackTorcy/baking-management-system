import { useEffect, useRef, type ReactNode } from "react";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    children: ReactNode;
    cancelLabel?: string;
    confirmLabel?: string;
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
    busy = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby="confirm-dialog-title"
            className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-border/40 bg-surface p-5 text-body backdrop:bg-header/40"
            onCancel={(e) => {
                // Esc closes through our state so the parent stays in sync
                e.preventDefault();
                onCancel();
            }}
        >
            <h2 id="confirm-dialog-title" className="mb-2 text-xl font-semibold text-header">
                {title}
            </h2>
            <div className="mb-5">{children}</div>
            <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>
                    {cancelLabel}
                </Button>
                {onConfirm && confirmLabel && (
                    <Button variant="danger" disabled={busy} onClick={onConfirm}>
                        {busy ? <LoadingSpinner className="h-4 w-4" /> : confirmLabel}
                    </Button>
                )}
            </div>
        </dialog>
    );
}

export default ConfirmDialog;
