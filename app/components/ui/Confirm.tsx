import { Card } from "./Card";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, onConfirm, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-brown">{title}</h2>
        <div className="mt-2 text-sm text-brown/80">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brown" onClick={onConfirm}>
            Confirm Change
          </Button>
        </div>
      </Card>
    </div>
  );
}
