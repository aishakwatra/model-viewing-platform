import { projectsData } from "../../app/lib/data";
import { PortfolioModelCard } from "../../app/components/portfolio/PortfolioModelCard";
import { Button } from "../../app/components/ui/Button";

// This is a server component, so we can fetch data directly.
export default function PortfolioPage({ params }: { params: { pageId: string } }) {
  // For now, we'll use a static title and dummy data.
  // Later, the pageId could be used to fetch specific portfolio data.
  const pageTitle = "Portfolio Page 1";

  // Using dummy data: selecting the first 3 models from Project A for display.
  const modelsToShow = projectsData[0].models.slice(0, 3);

  return (
    <div className="min-h-screen bg-beige">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-6 py-8 md:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-brown">{pageTitle}</h1>
          <Button variant="gold">Edit Page</Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modelsToShow.map(model => (
            <PortfolioModelCard key={model.id} model={model} />
          ))}
        </div>
      </div>
    </div>
  );
}
