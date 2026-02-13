"use client";

import { useState, useRef } from "react";
import { Product } from "@/types/database";
import Button from "@/components/ui/button";
import Input, { Textarea } from "@/components/ui/input";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      is_active: product?.is_active !== false,
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      console.log("Starting image upload...", { name: file.name, type: file.type, size: file.size });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
      });

      const responseData = await response.json();
      console.log("Upload response:", responseData);

      if (!response.ok) {
        const errorMsg = responseData.message || "Upload failed";
        console.error("Upload error:", errorMsg, responseData.error);
        throw new Error(errorMsg);
      }

      const { url } = responseData;
      setImageUrl(url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        is_active: data.is_active,
        image_url: imageUrl || null,
      };

      const response = await fetch(
        product
          ? `/api/products/${product.id}`
          : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error("Failed to save product");

      toast.success(
        product ? "Product updated successfully" : "Product created successfully"
      );
      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="space-y-4">
          {imageUrl && (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Product"
                className="h-32 w-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {!imageUrl && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Click to upload image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Product Name */}
      <Input
        label="Product Name"
        placeholder="e.g., Chocolate Caramel Cake"
        error={errors.name?.message}
        {...register("name", { required: "Name is required" })}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Describe your product..."
        rows={4}
        error={errors.description?.message}
        {...register("description", { required: "Description is required" })}
      />

      {/* Price */}
      <Input
        type="number"
        label="Price"
        step="0.01"
        min="0"
        placeholder="0.00"
        error={errors.price?.message}
        {...register("price", { required: "Price is required" })}
      />

      {/* Availability */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="is_active"
          defaultChecked={product?.is_active !== false}
          {...register("is_active")}
          className="w-5 h-5 text-primary rounded border-gray-300"
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Available for purchase
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={submitting || uploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitting || uploading}
          disabled={uploading}
          className="flex-1"
        >
          {product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
