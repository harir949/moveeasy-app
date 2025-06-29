import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Building, Car, MoveUp } from "lucide-react";
import { CalendarComponent } from "./calendar-component";
import { PhotoUpload } from "./photo-upload";
import { LocationAutocomplete } from "./location-autocomplete";
import { LocationMap } from "./location-map";
import { RoomItemsSelector } from "./room-items-selector";
import { insertBookingSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";

type FormData = z.infer<typeof insertBookingSchema>;

const steps = [
  { id: 1, title: "Contact Info", description: "We'll use this information to contact you about your move." },
  { id: 2, title: "Move Details", description: "Tell us about your locations, items, and requirements." },
  { id: 3, title: "Photos", description: "Help us provide an accurate estimate by uploading photos of your items and rooms." },
  { id: 4, title: "Schedule", description: "Select your preferred moving date. We'll call you to confirm the exact time." }
];

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      fullName: "",
      countryCode: "+30",
      phoneNumber: "",
      email: "",
      startLocation: "",
      endLocation: "",
      pickupFloor: "",
      dropoffFloor: "",
      pickupParking: false,
      dropoffParking: false,
      pickupElevator: false,
      dropoffElevator: false,
      moveType: "",
      customMoveType: "",
      selectedRooms: {},
      itemsDescription: "",
      homeSize: "",
      specialRequirements: "",
      selectedDate: "",
      timePreference: "flexible",
      additionalNotes: "",
      housePhotos: [],
      itemsPhotos: []
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "housePhotos" || key === "itemsPhotos") {
          if (Array.isArray(value)) {
            value.forEach((file: File) => {
              formData.append(key, file);
            });
          }
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      return response.json();
    },
    onSuccess: () => {
      setShowConfirmation(true);
      toast({
        title: "Booking submitted!",
        description: "We'll call you within 24 hours to confirm your booking details.",
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

  const validateStep = async (step: number) => {
    const fieldsToValidate: (keyof FormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate.push("fullName", "phoneNumber");
        break;
      case 2:
        fieldsToValidate.push("startLocation", "endLocation", "moveType");
        break;
      case 3:
        // Photos are optional, no validation needed
        break;
      case 4:
        fieldsToValidate.push("selectedDate", "timePreference");
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data: FormData) => {
    createBookingMutation.mutate(data);
  };

  const resetForm = () => {
    form.reset();
    setCurrentStep(1);
    setShowConfirmation(false);
  };

  const progressWidth = (currentStep / 4) * 100;

  return (
    <>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Book Your Move</h2>
          <span className="text-sm text-gray-500">Step {currentStep} of 4</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progressWidth}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {steps.map((step) => (
            <span key={step.id}>{step.title}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <Card className="shadow-lg">
        <CardContent className="p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <p className="text-gray-600">{steps[0].description}</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-3">
                    <Label>Phone Number *</Label>
                    <div className="flex space-x-3">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormControl>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="+30">🇬🇷 +30</SelectItem>
                                  <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                  <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                                  <SelectItem value="+33">🇫🇷 +33</SelectItem>
                                  <SelectItem value="+39">🇮🇹 +39</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="2101234567"
                                {...field}
                                onChange={(e) => {
                                  // Only allow digits
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Move Details */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Move Details</h3>
                    <p className="text-gray-600">{steps[1].description}</p>
                  </div>
                  
                  {/* Locations */}
                  <FormField
                    control={form.control}
                    name="startLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pick-up Location *</FormLabel>
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value}
                            onChange={(location, coords) => {
                              field.onChange(location);
                              if (coords) {
                                form.setValue("startLocationCoords", coords);
                              }
                            }}
                            placeholder="Start typing your pick-up address..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Drop-off Location *</FormLabel>
                        <FormControl>
                          <LocationAutocomplete
                            value={field.value}
                            onChange={(location, coords) => {
                              field.onChange(location);
                              if (coords) {
                                form.setValue("endLocationCoords", coords);
                              }
                            }}
                            placeholder="Start typing your drop-off address..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Map Display */}
                  <LocationMap
                    startLocation={form.watch("startLocation")}
                    endLocation={form.watch("endLocation")}
                    startCoords={form.watch("startLocationCoords")}
                    endCoords={form.watch("endLocationCoords")}
                  />

                  {/* Location Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Pick-up Details
                      </h4>
                      
                      <FormField
                        control={form.control}
                        name="pickupFloor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select floor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ground">Ground Floor</SelectItem>
                                <SelectItem value="1">1st Floor</SelectItem>
                                <SelectItem value="2">2nd Floor</SelectItem>
                                <SelectItem value="3">3rd Floor</SelectItem>
                                <SelectItem value="4">4th Floor</SelectItem>
                                <SelectItem value="5+">5th Floor or Higher</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="pickupParking"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center">
                                  <Car className="h-4 w-4 mr-2" />
                                  Parking available nearby
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="pickupElevator"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center">
                                  <MoveUp className="h-4 w-4 mr-2" />
                                  Elevator available
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Drop-off Details
                      </h4>
                      
                      <FormField
                        control={form.control}
                        name="dropoffFloor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Floor</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select floor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ground">Ground Floor</SelectItem>
                                <SelectItem value="1">1st Floor</SelectItem>
                                <SelectItem value="2">2nd Floor</SelectItem>
                                <SelectItem value="3">3rd Floor</SelectItem>
                                <SelectItem value="4">4th Floor</SelectItem>
                                <SelectItem value="5+">5th Floor or Higher</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="dropoffParking"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center">
                                  <Car className="h-4 w-4 mr-2" />
                                  Parking available nearby
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="dropoffElevator"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="flex items-center">
                                  <MoveUp className="h-4 w-4 mr-2" />
                                  Elevator available
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Move Type */}
                  <FormField
                    control={form.control}
                    name="moveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of Move *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select move type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="residential">Residential Move</SelectItem>
                            <SelectItem value="office">Office Move</SelectItem>
                            <SelectItem value="storage">Storage Move</SelectItem>
                            <SelectItem value="local">Local Move</SelectItem>
                            <SelectItem value="long-distance">Long Distance Move</SelectItem>
                            <SelectItem value="other">Other (specify below)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Custom Move Type */}
                  {form.watch("moveType") === "other" && (
                    <FormField
                      control={form.control}
                      name="customMoveType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specify Move Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Please describe your specific moving needs..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Room-based Item Selection */}
                  <RoomItemsSelector
                    form={form}
                    fieldName="selectedRooms"
                  />

                  {/* Additional Description */}
                  <FormField
                    control={form.control}
                    name="itemsDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Items or Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional items not listed above or special handling instructions..."
                            className="resize-none"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="homeSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Size</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="studio">Studio</SelectItem>
                              <SelectItem value="1-bedroom">1 Bedroom</SelectItem>
                              <SelectItem value="2-bedroom">2 Bedroom</SelectItem>
                              <SelectItem value="3-bedroom">3 Bedroom</SelectItem>
                              <SelectItem value="4-bedroom">4+ Bedroom</SelectItem>
                              <SelectItem value="office">Office Space</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="specialRequirements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Requirements</FormLabel>
                          <FormControl>
                            <Input placeholder="Fragile items, assembly/disassembly, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Photo Upload */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Photos</h3>
                    <p className="text-gray-600">{steps[2].description}</p>
                  </div>
                  
                  <PhotoUpload
                    form={form}
                    housePhotosName="housePhotos"
                    itemsPhotosName="itemsPhotos"
                  />
                </div>
              )}

              {/* Step 4: Schedule */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Schedule Your Move</h3>
                    <p className="text-gray-600">{steps[3].description}</p>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="selectedDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Move Date *</FormLabel>
                        <FormControl>
                          <CalendarComponent
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timePreference"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Preferred Time of Day</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3"
                          >
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <RadioGroupItem value="morning" id="morning" className="mr-3" />
                              <Label htmlFor="morning" className="cursor-pointer">
                                <div className="font-medium">Morning</div>
                                <div className="text-sm text-gray-500">8:00 AM - 12:00 PM</div>
                              </Label>
                            </div>
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <RadioGroupItem value="afternoon" id="afternoon" className="mr-3" />
                              <Label htmlFor="afternoon" className="cursor-pointer">
                                <div className="font-medium">Afternoon</div>
                                <div className="text-sm text-gray-500">12:00 PM - 5:00 PM</div>
                              </Label>
                            </div>
                            <div className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                              <RadioGroupItem value="flexible" id="flexible" className="mr-3" />
                              <Label htmlFor="flexible" className="cursor-pointer">
                                <div className="font-medium">Flexible</div>
                                <div className="text-sm text-gray-500">Any time</div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any additional information or special requests..."
                            className="resize-none"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className={currentStep === 1 ? "invisible" : ""}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex-1" />
                
                {currentStep < 4 ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-accent hover:bg-green-700"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <CalendarCheck className="mr-2 h-4 w-4" />
                        Book Your Move
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-2xl text-green-600" />
            </div>
            <DialogTitle className="text-center">Booking Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Thank you for choosing our moving services. We'll call you within 24 hours to confirm your booking details and provide a detailed quote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• We'll review your booking request</li>
              <li>• Our team will call you to confirm details</li>
              <li>• You'll receive a detailed moving quote</li>
              <li>• We'll schedule your move date and time</li>
            </ul>
          </div>
          
          <Button onClick={resetForm} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
