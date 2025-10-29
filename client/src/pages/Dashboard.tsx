import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
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

// --- THE FIX IS HERE ---
// Correctly define the type for a collection record.
// `collectionDate` is a `Date` object, not a string, after tRPC processes it.
type CollectionRecord = {
  id: number;
  siteName: string;
  wasteType: "Organic" | "Inorganic" | "Mixed";
  collectionDate: Date; // Changed from `string` to `Date`
  totalVolume: string;
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    siteName: "",
    wasteType: undefined as any,
    startDate: "",
    endDate: "",
    minVolume: "",
    maxVolume: "",
    wasteSeparated: undefined as boolean | undefined,
    minCollections: "",
    minOrganicVolume: "",
  });

  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const { data: collections, isLoading: collectionsLoading } = trpc.collections.filtered.useQuery(
    filters
  );

  const { data: mapData } = trpc.collections.dashboardData.useQuery();

  const mapMarkers: MapMarker[] = mapData?.markers?.map((m: any) => ({
    id: m.id,
    lat: m.lat,
    lng: m.lng,
    siteName: m.siteName,
    wasteType: m.wasteType,
    volume: m.volume,
    date: new Date(m.date),
  })) || [];

  const filteredSummary = useMemo(() => {
    if (!collections) {
      return { totalRecords: 0, totalVolume: 0, byWasteType: {} };
    }
    return {
      totalRecords: collections.length,
      totalVolume: collections.reduce((sum, r) => sum + parseFloat(r.totalVolume), 0),
      byWasteType: collections.reduce((acc, r) => {
        acc[r.wasteType] = (acc[r.wasteType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }, [collections]);

  const filteredTrendData = useMemo(() => {
    if (!collections) {
      return {};
    }
    return collections.reduce((acc, r) => {
      const dateStr = r.collectionDate.toISOString().split("T")[0];
      acc[dateStr] = (acc[dateStr] || 0) + parseFloat(r.totalVolume);
      return acc;
    }, {} as Record<string, number>);
  }, [collections]);

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setFilters({
      siteName: marker.siteName,
      wasteType: undefined,
      startDate: "",
      endDate: "",
      minVolume: "",
      maxVolume: "",
      wasteSeparated: undefined,
      minCollections: "",
      minOrganicVolume: "",
    });
  };

  const handleResetFilters = () => {
    setFilters({
      siteName: "",
      wasteType: undefined,
      startDate: "",
      endDate: "",
      minVolume: "",
      maxVolume: "",
      wasteSeparated: undefined,
      minCollections: "",
      minOrganicVolume: "",
    });
    setSelectedMarker(null);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSelectedMarker(null);
    setFilters((prev) => ({
      ...prev,
      siteName: "",
      [name]: value || undefined,
    }));
  };

  if (collectionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{backgroundColor: '#006400'}}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Waste Management Dashboard
          </h1>
          <p className="text-gray-200">
            Monitor and analyze waste collection data across Kakamega Municipality
          </p>
        </div>
        <div className="flex space-x-4 mb-8">
          <Link href="/">
            <Button variant="outline"
            className="bg-white border-primary text-primary hover:bg-primary/10">Home</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSummary.totalRecords}</div>
            </CardContent>
          </Card>
          <Card className="bg-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Volume (tons)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSummary.totalVolume.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Waste Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div>Organic: {filteredSummary.byWasteType?.Organic || 0}</div>
                <div>Inorganic: {filteredSummary.byWasteType?.Inorganic || 0}</div>
                <div>Mixed: {filteredSummary.byWasteType?.Mixed || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="bg-amber-300">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                {/* Waste Type */}
                <div>
                  <label className="block text-sm font-medium mb-2">Waste Type</label>
                  <select
                    name="wasteType"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.wasteType || ""}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Organic">Organic</option>
                    <option value="Inorganic">Inorganic</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                {/* Waste Separated */}
                <div>
                  <label className="block text-sm font-medium mb-2">Waste Separated</label>
                  <select
                    name="wasteSeparated"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={filters.wasteSeparated === undefined ? "any" : String(filters.wasteSeparated)}
                    onChange={(e) => {
                      setSelectedMarker(null);
                      setFilters({
                        ...filters,
                        siteName: "",
                        wasteSeparated: e.target.value === "any" ? undefined : e.target.value === "true",
                      });
                    }}
                  >
                    <option value="any">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Volume Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Volume (tons)</label>
                    <input
                      type="number"
                      name="minVolume"
                      placeholder="e.g., 5"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.minVolume}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Volume (tons)</label>
                    <input
                      type="number"
                      name="maxVolume"
                      placeholder="e.g., 20"
                      className="w-full px-3 py-2 border border-input rounded-md"
                      value={filters.maxVolume}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                
                {/* Reset Button */}
                <Button className="w-full bg-white border-primary text-primary hover:bg-green-50" onClick={handleResetFilters}>
                  Reset Filters
                </Button>

                {/* Selected Marker Info Box */}
                {selectedMarker && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                    <p className="font-semibold text-blue-900">Selected Site: {selectedMarker.siteName}</p>
                    <p className="text-blue-800">Showing data for this site only.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-300">
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
                        collections.slice(0, 10).map((record: CollectionRecord) => (
                          <tr key={record.id} className="border-b hover:bg-muted">
                            <td className="py-2 px-2">
                              {/* Now that it's a Date object, we can call methods directly */}
                              {record.collectionDate.toLocaleDateString()}
                            </td>
                            <td className="py-2 px-2">{record.siteName}</td>
                            <td className="py-2 px-2">{record.wasteType}</td>
                            <td className="py-2 px-2">{record.totalVolume} tons</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-muted-foreground">
                            No records found for the selected filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Geospatial Map</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <MapView
                  markers={mapMarkers}
                  onMarkerClick={handleMarkerClick}
                  selectedMarker={selectedMarker}
                />
             </CardContent>
            </Card>
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>{selectedMarker ? `Trends for ${selectedMarker.siteName}` : 'Overall Collection Trends'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartView
                  data={filteredTrendData}
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