import { Card } from "./Card";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLabel?: string;
  onCancelLabel?: string;
  onConfirm?: () => void;
  title: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  hideActions?: boolean; // Add this prop
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  onConfirmLabel = "Confirm Change",
  onCancelLabel = "Cancel",
  size = "medium",
  hideActions = false, // Default to false
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-sm",
    medium: "max-w-md",
    large: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className={`w-full ${sizeClasses[size]} p-6 max-h-[90vh] overflow-y-auto`}>
        <h2 className="text-lg font-semibold text-brown">{title}</h2>
        <div className="mt-2 text-sm text-brown/80">{children}</div>
        
        {/* Conditionally render the actions footer */}
        {!hideActions && (
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {onCancelLabel}
            </Button>
            {onConfirm && (
              <Button variant="brown" onClick={onConfirm}>
                {onConfirmLabel}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}