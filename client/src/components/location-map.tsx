import { MapPin, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LocationMapProps {
  startLocation: string;
  endLocation: string;
  startCoords?: { lat: number; lng: number };
  endCoords?: { lat: number; lng: number };
}

export function LocationMap({ startLocation, endLocation, startCoords, endCoords }: LocationMapProps) {
  // Mock map - In production, integrate with Google Maps or similar service
  const calculateDistance = () => {
    if (startCoords && endCoords) {
      // Simple distance calculation (not accurate for real use)
      const dx = startCoords.lat - endCoords.lat;
      const dy = startCoords.lng - endCoords.lng;
      const distance = Math.sqrt(dx * dx + dy * dy) * 100; // Mock distance in km
      return Math.round(distance);
    }
    return null;
  };

  const distance = calculateDistance();

  if (!startLocation || !endLocation) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Navigation className="h-5 w-5 mr-2 text-primary" />
          Route Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mock Map Placeholder */}
          <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <MapPin className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Map visualization</p>
              <p className="text-xs">(Google Maps integration)</p>
            </div>
          </div>

          {/* Route Details */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-3 h-3 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-green-800">Pick-up Location</div>
                <div className="text-sm text-green-700">{startLocation}</div>
              </div>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="flex-1 border-t border-dashed border-gray-300"></div>
              <div className="px-3 text-xs text-gray-500 bg-white">
                {distance ? `~${distance} km` : "Route"}
              </div>
              <div className="flex-1 border-t border-dashed border-gray-300"></div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-red-800">Drop-off Location</div>
                <div className="text-sm text-red-700">{endLocation}</div>
              </div>
            </div>
          </div>

          {distance && (
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-800">
                <strong>Estimated Distance:</strong> {distance} km
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Final pricing will be calculated based on actual route and services
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}