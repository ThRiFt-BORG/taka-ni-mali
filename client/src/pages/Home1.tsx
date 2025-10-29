import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MapPin, Users, TrendingUp } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

/**
 * Home page - landing page with navigation to main features
 */
export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  // Debugger
  console.log("Auth State:", { isAuthenticated, user });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />}
            <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user?.name || "User"}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-4">
            CE4HOW Taka ni Mali
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Geospatial Waste Management Monitoring & Evaluation Dashboard
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track, analyze, and visualize waste collection data across Kakamega Municipality
            with real-time geospatial insights and comprehensive analytics.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">Interactive Map</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize waste collection sites across Kakamega with Leaflet-based mapping
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <CardTitle className="text-lg">Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analyze waste collection trends with interactive charts and summaries
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <CardTitle className="text-lg">Data Collection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Submit and manage waste collection records securely with authentication
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <CardTitle className="text-lg">Real-time Updates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access live data with real-time synchronization across all dashboards
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-4">Get Started</h3>
          <p className="text-muted-foreground mb-6">
            Choose your role to access the appropriate features:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Public Dashboard */}
            <div className="border border-input rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">View Dashboard</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Access the public dashboard to view aggregated waste collection data,
                interactive maps, and analytics. No authentication required.
              </p>
              <Link href="/dashboard">
                <Button className="w-full">Open Dashboard</Button>
              </Link>
            </div>

            {/* Data Collection */}
            <div className="border border-input rounded-lg p-6">
              <h4 className="text-lg font-semibold mb-2">Submit Data</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you're a data collector, log in to submit waste collection records
                and manage your submissions.
              </p>
              {isAuthenticated && (user?.role === "collector" || user?.role === "admin") ? (
                <Link href="/collector">
                  <Button className="w-full">Submit Collection</Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button className="w-full">Login as Collector</Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">About This System</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Key Features</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Geospatial mapping of waste collection sites</li>
                <li>Real-time data collection and submission</li>
                <li>Comprehensive analytics and reporting</li>
                <li>Role-based access control</li>
                <li>Secure authentication with JWT tokens</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Data Tracked</h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Collection dates and locations</li>
                <li>Waste types (Organic, Inorganic, Mixed)</li>
                <li>Collection volumes and trends</li>
                <li>Waste separation practices</li>
                <li>Collection frequency and patterns</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-input mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>CE4HOW Taka ni Mali - Geospatial Waste Management M&E Dashboard v2</p>
          <p className="mt-2">© 2025 CE4HOW Initiative. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

