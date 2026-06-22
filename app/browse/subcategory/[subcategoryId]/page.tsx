import BrowseSubcategoryProducts from "@/components/browse/BrowseSubcategoryProducts";
import BrowseSidebar from "@/components/browse/BrowseSidebar";

type BrowseSubcategoryPageProps = {
  params: Promise<{
    subcategoryId: string;
  }>;
};

export default async function BrowseSubcategoryPage({
  params,
}: BrowseSubcategoryPageProps) {
  const resolvedParams = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <BrowseSidebar />
          <BrowseSubcategoryProducts subcategoryId={resolvedParams.subcategoryId} />
        </div>
      </main>
    </div>
  );
}
