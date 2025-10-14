import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

export function SnapshotCard() {
  return (
    <Card className="p-3">
      <div className="aspect-[4/3] rounded-xl bg-beige border border-brown/15" />
      <div className="pt-3">
        <Button variant="gold" className="w-full">Download</Button>
      </div>
    </Card>
  );
}
