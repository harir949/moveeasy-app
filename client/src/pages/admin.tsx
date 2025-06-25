import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Truck, Phone, Mail, MapPin, Calendar, Clock, Package, Image } from "lucide-react";
import { format } from "date-fns";
import type { Booking } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Status updated",
        description: "The booking status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Truck className="text-primary text-2xl" />
              <h1 className="text-xl font-bold text-gray-900">MoveEasy Admin</h1>
            </div>
            <Badge variant="secondary">
              {bookings?.length || 0} Total Bookings
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Management</h2>
          <p className="text-gray-600">Manage customer booking requests and update their status.</p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
              <p className="text-gray-500">Customer bookings will appear here when they submit requests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Booking #{booking.id}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted {format(new Date(booking.createdAt), "PPp")}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Name:</span>
                        <span>{booking.fullName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a href={`tel:${booking.phoneNumber}`} className="text-primary hover:underline">
                          {booking.phoneNumber}
                        </a>
                      </div>
                      {booking.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${booking.email}`} className="text-primary hover:underline">
                            {booking.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Move Details */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Move Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">From:</p>
                          <p className="text-gray-600">{booking.startLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">To:</p>
                          <p className="text-gray-600">{booking.endLocation}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">Move Type:</p>
                          <p className="text-gray-600 capitalize">{booking.moveType.replace('-', ' ')}</p>
                        </div>
                        {booking.homeSize && (
                          <div>
                            <p className="font-medium">Home Size:</p>
                            <p className="text-gray-600 capitalize">{booking.homeSize.replace('-', ' ')}</p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Items to Move:</p>
                        <p className="text-gray-600">{booking.itemsDescription}</p>
                      </div>
                      {booking.specialRequirements && (
                        <div>
                          <p className="font-medium">Special Requirements:</p>
                          <p className="text-gray-600">{booking.specialRequirements}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Schedule */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Schedule</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Date:</span>
                        <span>{format(new Date(booking.selectedDate), "PPP")}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Time:</span>
                        <span className="capitalize">{booking.timePreference}</span>
                      </div>
                    </div>
                    {booking.additionalNotes && (
                      <div className="mt-3">
                        <p className="font-medium">Additional Notes:</p>
                        <p className="text-gray-600">{booking.additionalNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Photos */}
                  {(booking.housePhotos.length > 0 || booking.itemsPhotos.length > 0) && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Image className="h-4 w-4 mr-2" />
                          Photos
                        </h4>
                        <div className="space-y-4">
                          {booking.housePhotos.length > 0 && (
                            <div>
                              <p className="font-medium text-sm text-gray-700 mb-2">House Photos ({booking.housePhotos.length})</p>
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {booking.housePhotos.map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`House photo ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {booking.itemsPhotos.length > 0 && (
                            <div>
                              <p className="font-medium text-sm text-gray-700 mb-2">Items Photos ({booking.itemsPhotos.length})</p>
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {booking.itemsPhotos.map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`Items photo ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg border"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                      disabled={booking.status === "confirmed" || updateStatusMutation.isPending}
                      variant="default"
                      size="sm"
                    >
                      Confirm
                    </Button>
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                      disabled={booking.status === "completed" || updateStatusMutation.isPending}
                      variant="secondary"
                      size="sm"
                    >
                      Mark Complete
                    </Button>
                    <Button
                      onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                      disabled={booking.status === "cancelled" || updateStatusMutation.isPending}
                      variant="destructive"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
