import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Home, Package, X, Info } from "lucide-react";

interface PhotoUploadProps {
  form: UseFormReturn<any>;
  housePhotosName: string;
  itemsPhotosName: string;
}

export function PhotoUpload({ form, housePhotosName, itemsPhotosName }: PhotoUploadProps) {
  const [housePhotoPreviews, setHousePhotoPreviews] = useState<string[]>([]);
  const [itemsPhotoPreviews, setItemsPhotoPreviews] = useState<string[]>([]);

  const handleFileUpload = (files: FileList | null, fieldName: string) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const currentFiles = form.getValues(fieldName) || [];
    const updatedFiles = [...currentFiles, ...fileArray];
    
    form.setValue(fieldName, updatedFiles);

    // Create previews
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        if (fieldName === housePhotosName) {
          setHousePhotoPreviews(prev => [...prev, preview]);
        } else {
          setItemsPhotoPreviews(prev => [...prev, preview]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, fieldName: string) => {
    const currentFiles = form.getValues(fieldName) || [];
    const updatedFiles = currentFiles.filter((_: any, i: number) => i !== index);
    form.setValue(fieldName, updatedFiles);

    if (fieldName === housePhotosName) {
      setHousePhotoPreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      setItemsPhotoPreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      {/* House Photos */}
      <FormField
        control={form.control}
        name={housePhotosName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
              House/Room Photos
              <span className="text-gray-500 font-normal ml-2">(Optional but recommended)</span>
            </FormLabel>
            <FormControl>
              <div>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, housePhotosName)}
                  />
                  <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload House Photos</p>
                  <p className="text-sm text-gray-500">Click to select or drag and drop images here</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                </label>
                
                {housePhotoPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {housePhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`House photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index, housePhotosName)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {/* Items Photos */}
      <FormField
        control={form.control}
        name={itemsPhotosName}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">
              Items to Move Photos
              <span className="text-gray-500 font-normal ml-2">(Optional but recommended)</span>
            </FormLabel>
            <FormControl>
              <div>
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer block">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files, itemsPhotosName)}
                  />
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Upload Items Photos</p>
                  <p className="text-sm text-gray-500">Click to select or drag and drop images here</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                </label>
                
                {itemsPhotoPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {itemsPhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative group bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={preview}
                          alt={`Items photo ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index, itemsPhotosName)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
          </FormItem>
        )}
      />

      {/* Photo Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900">Photo Tips</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Take photos of large furniture and appliances</li>
              <li>• Include images of stairs, hallways, and doorways</li>
              <li>• Show any fragile or valuable items</li>
              <li>• Multiple angles help us provide better estimates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
