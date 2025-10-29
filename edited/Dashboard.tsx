import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import MapView from "@/components/MapView";
import ChartView from "@/components/ChartView";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  siteName: string;
  wasteType: string;
  volume: number;
  date: Date;
}

/**
 * Public Dashboard page - displays aggregated waste collection data
 * with filtering, map visualization, and charts
 */
export default function Dashboard() {
  const [filters, setFilters] = useState({
    siteName: "",
    wasteType: undefined as any,
    startDate: "",
    endDate: "",
  });

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  // Fetch filtered collections
  const { data: collections, isLoading: collectionsLoading } = trpc.collections.filtered.useQuery(
    filters
  );

  // Fetch summary statistics
  const { data: summary } = trpc.collections.summary.useQuery();

  // Fetch dashboard data (trends and markers)
  const { data: dashboardData } = trpc.collections.dashboardData.useQuery();

  // Convert dashboard markers to MapMarker format
  const mapMarkers: MapMarker[] = dashboardData?.markers?.map((m: any) => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    siteName: m.siteName,
    wasteType: m.wasteType,
    volume: m.volume,
    date: new Date(m.date),
  })) || [];

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    // Filter to this site
    setFilters((prev) => ({ ...prev, siteName: marker.siteName }));
  };

  const handleResetFilters = () => {
    setFilters({
      siteName: "",
      wasteType: undefined,
      startDate: "",
      endDate: "",
    });
    setSelectedMarker(null);
  };

  if (collectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Waste Management Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and analyze waste collection data across Kakamega Municipality
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalRecords || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Volume (tons)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalVolume?.toFixed(2) || "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Waste Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>Organic: {summary?.byWasteType?.Organic || 0}</div>
                <div>Inorganic: {summary?.byWasteType?.Inorganic || 0}</div>
                <div>Mixed: {summary?.byWasteType?.Mixed || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Filters and Table */}
          <div className="space-y-6">
            {/* Filter Section */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Waste Type</label>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.wasteType || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, wasteType: e.target.value || undefined })
                    }
                  >
                    <option value="">All Types</option>
                    <option value="Organic">Organic</option>
                    <option value="Inorganic">Inorganic</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  />
                </div>

                <Button className="w-full" onClick={handleResetFilters}>
                  Reset Filters
                </Button>

                {selectedMarker && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                    <p className="font-semibold text-blue-900">Selected: {selectedMarker.siteName}</p>
                    <p className="text-blue-800">Type: {selectedMarker.wasteType}</p>
                    <p className="text-blue-800">Volume: {selectedMarker.volume} tons</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Records ({collections?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Date</th>
                        <th className="text-left py-2 px-2">Site</th>
                        <th className="text-left py-2 px-2">Type</th>
                        <th className="text-left py-2 px-2">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collections && collections.length > 0 ? (
                        collections.slice(0, 10).map((record: any) => (
                          <tr key={record.id} className="border-b hover:bg-muted">
                            <td className="py-2 px-2">
                              {new Date(record.collectionDate).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2">{record.siteName}</td>
                            <td className="py-2 px-2">{record.wasteType}</td>
                            <td className="py-2 px-2">{record.totalVolume} tons</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-muted-foreground">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Map and Chart */}
          <div className="space-y-6">
            {/* Map Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Geospatial Map</CardTitle>
              </CardHeader>
              <CardContent>
                <MapView />
              </CardContent>
            </Card>

            {/* Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Collection Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartView
                  data={dashboardData?.trendData || {}}
                  title="Weekly Waste Collection Volume"
                  chartType="line"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

