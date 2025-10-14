import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { BadgeApproved } from "./ui/Badge";

export function ModelMeta() {
  return (
    <Card className="p-5">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">Royal Palace Wedding</h3>
          <p className="text-sm text-brown/70">Wedding Collection A</p>
        </div>

        <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
          <dt className="text-brown/70">Version:</dt><dd className="font-medium">2.5</dd>
          <dt className="text-brown/70">Updated:</dt><dd>March 25, 2024</dd>
          <dt className="text-brown/70">Status:</dt><dd><BadgeApproved /></dd>
        </dl>

        <div className="space-y-2 pt-1">
          <Button variant="gold" className="w-full">Download Snapshots</Button>
          <Button variant="brown" className="w-full">Download 3D File</Button>
        </div>
      </div>
    </Card>
  );
}
