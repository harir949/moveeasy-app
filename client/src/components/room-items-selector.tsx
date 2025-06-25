import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, X, Home, ChefHat, Bed, Bath, Package, Sofa } from "lucide-react";

interface RoomItemsSelectorProps {
  form: UseFormReturn<any>;
  fieldName: string;
}

const ROOM_ITEMS = {
  kitchen: {
    icon: ChefHat,
    items: {
      "Refrigerator": "Large appliance",
      "Stove/Oven": "Large appliance", 
      "Dishwasher": "Large appliance",
      "Microwave": "Small appliance",
      "Kitchen Table": "Furniture",
      "Kitchen Chairs": "Furniture",
      "Kitchen Cabinets": "Furniture",
      "Small Appliances": "Small items",
      "Dishes & Cookware": "Boxes"
    }
  },
  "living-room": {
    icon: Sofa,
    items: {
      "Sofa": "Large furniture",
      "Coffee Table": "Furniture",
      "TV Stand": "Furniture",
      "Television": "Electronics",
      "Armchair": "Furniture",
      "Bookshelf": "Furniture",
      "Side Table": "Furniture",
      "Lamps": "Small items",
      "Decorations": "Small items"
    }
  },
  bedroom: {
    icon: Bed,
    items: {
      "Bed Frame": "Large furniture",
      "Mattress": "Large furniture",
      "Dresser": "Furniture",
      "Nightstand": "Furniture",
      "Wardrobe": "Large furniture",
      "Mirror": "Fragile",
      "Clothes": "Boxes",
      "Bedding": "Boxes"
    }
  },
  bathroom: {
    icon: Bath,
    items: {
      "Washing Machine": "Large appliance",
      "Dryer": "Large appliance",
      "Bathroom Cabinet": "Furniture",
      "Mirror": "Fragile",
      "Toiletries": "Boxes",
      "Towels": "Boxes"
    }
  },
  storage: {
    icon: Package,
    items: {
      "Storage Boxes": "Boxes",
      "Tools": "Boxes",
      "Seasonal Items": "Boxes",
      "Sports Equipment": "Large items",
      "Garden Equipment": "Large items",
      "Cleaning Supplies": "Boxes"
    }
  }
};

export function RoomItemsSelector({ form, fieldName }: RoomItemsSelectorProps) {
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const selectedRoomItems = form.watch(fieldName) || {};

  const toggleRoom = (roomKey: string) => {
    const newSelectedRooms = new Set(selectedRooms);
    const currentItems = { ...selectedRoomItems };

    if (newSelectedRooms.has(roomKey)) {
      newSelectedRooms.delete(roomKey);
      delete currentItems[roomKey];
    } else {
      newSelectedRooms.add(roomKey);
      currentItems[roomKey] = {};
    }

    setSelectedRooms(newSelectedRooms);
    form.setValue(fieldName, currentItems);
  };

  const updateItemQuantity = (roomKey: string, itemKey: string, quantity: number) => {
    const currentItems = { ...selectedRoomItems };
    
    if (!currentItems[roomKey]) {
      currentItems[roomKey] = {};
    }

    if (quantity > 0) {
      currentItems[roomKey][itemKey] = quantity;
    } else {
      delete currentItems[roomKey][itemKey];
      
      // If room has no items, remove it
      if (Object.keys(currentItems[roomKey]).length === 0) {
        delete currentItems[roomKey];
        const newSelectedRooms = new Set(selectedRooms);
        newSelectedRooms.delete(roomKey);
        setSelectedRooms(newSelectedRooms);
      }
    }

    form.setValue(fieldName, currentItems);
  };

  const getRoomItemCount = (roomKey: string) => {
    const roomItems = selectedRoomItems[roomKey] || {};
    return Object.values(roomItems).reduce((sum: number, qty: any) => sum + (qty || 0), 0);
  };

  const getTotalItemCount = () => {
    return Object.values(selectedRoomItems).reduce((total: number, roomItems: any) => {
      return total + Object.values(roomItems || {}).reduce((sum: number, qty: any) => sum + (qty || 0), 0);
    }, 0);
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
            Items to Move by Room
            {getTotalItemCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTotalItemCount()} items selected
              </Badge>
            )}
          </FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Room Selection */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(ROOM_ITEMS).map(([roomKey, roomData]) => {
                  const IconComponent = roomData.icon;
                  const isSelected = selectedRooms.has(roomKey);
                  const itemCount = getRoomItemCount(roomKey);
                  
                  return (
                    <Button
                      key={roomKey}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`h-20 flex flex-col items-center justify-center p-2 ${
                        isSelected ? "bg-primary text-white" : ""
                      }`}
                      onClick={() => toggleRoom(roomKey)}
                    >
                      <IconComponent className="h-6 w-6 mb-1" />
                      <span className="text-xs capitalize">
                        {roomKey.replace("-", " ")}
                      </span>
                      {itemCount > 0 && (
                        <Badge 
                          variant="secondary" 
                          className="mt-1 text-xs h-4 px-1"
                        >
                          {itemCount}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>

              {/* Selected Room Items */}
              {Array.from(selectedRooms).map(roomKey => {
                const roomData = ROOM_ITEMS[roomKey as keyof typeof ROOM_ITEMS];
                const IconComponent = roomData.icon;

                return (
                  <Card key={roomKey} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <IconComponent className="h-5 w-5 mr-2" />
                          <span className="capitalize">{roomKey.replace("-", " ")}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRoom(roomKey)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(roomData.items).map(([itemKey, itemType]) => {
                          const currentQuantity = selectedRoomItems[roomKey]?.[itemKey] || 0;

                          return (
                            <div
                              key={itemKey}
                              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-sm">{itemKey}</div>
                                <div className="text-xs text-gray-500">{itemType}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateItemQuantity(roomKey, itemKey, Math.max(0, currentQuantity - 1))}
                                  disabled={currentQuantity === 0}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="min-w-[2rem] text-center font-medium">
                                  {currentQuantity}
                                </span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => updateItemQuantity(roomKey, itemKey, currentQuantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {selectedRooms.size === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select rooms above to choose specific items to move</p>
                </div>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}