import { projectsData } from "@/app/lib/data";
import { PortfolioModelCard } from "@/app/components/portfolio/PortfolioModelCard";
import { Button } from "@/app/components/ui/Button";

export function PortfolioView() {
  // Using dummy data for now.
  const pageTitle = "Portfolio Page 1";
  const modelsToShow = projectsData[0].models.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-brown">{pageTitle}</h2>
        <Button variant="gold">Edit Page</Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modelsToShow.map(model => (
          <PortfolioModelCard key={model.id} model={model} />
        ))}
      </div>
    </div>
  );
}
