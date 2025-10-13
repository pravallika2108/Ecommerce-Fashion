// src/app/super-admin/products/add/SuperAdminManageProductForm.tsx
"use client";

import { protectProductFormAction } from "@/actions/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/store/useProductStore";
import { brands, categories, colors, sizes } from "@/utils/config";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

export default function SuperAdminManageProductForm() {
  const [formState, setFormState] = useState({
    name: "",
    brand: "",
    description: "",
    category: "",
    gender: "",
    price: "",
    stock: "",
  });

  const [selectedSizes, setSelectSizes] = useState<string[]>([]);
  const [selectedColors, setSelectColors] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const editedProductId = searchParams.get("id");
  const isEditMode = !!editedProductId;

  const router = useRouter();
  const { createProduct, updateProduct, getProductById, isLoading } =
    useProductStore();

  // Load product if editing
  useEffect(() => {
    if (isEditMode) {
      getProductById(editedProductId).then((product) => {
        if (product) {
          setFormState({
            name: product.name,
            brand: product.brand,
            description: product.description,
            category: product.category,
            gender: product.gender,
            price: product.price.toString(),
            stock: product.stock.toString(),
          });
          setSelectSizes(product.sizes);
          setSelectColors(product.colors);
        }
      });
    }
  }, [isEditMode, editedProductId, getProductById]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSize = (size: string) => {
    setSelectSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleToggleColor = (color: string) => {
    setSelectColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

 const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const sanitize = await protectProductFormAction();
  if (!sanitize.success) {
    toast({ title: sanitize.error });
    return;
  }

  // Validation for required fields
  if (!formState.name?.trim() || !formState.brand?.trim() || 
      !formState.category?.trim() || !formState.gender?.trim() || 
      !formState.price?.trim() || !formState.stock?.trim()) {
    toast({ 
      title: "Validation Error", 
      description: "Please fill in all required fields",
      variant: "destructive"
    });
    return;
  }

  if (selectedSizes.length === 0) {
    toast({ 
      title: "Validation Error", 
      description: "Please select at least one size",
      variant: "destructive"
    });
    return;
  }

  if (selectedColors.length === 0) {
    toast({ 
      title: "Validation Error", 
      description: "Please select at least one color",
      variant: "destructive"
    });
    return;
  }

  // For create mode, validate images
  if (!isEditMode && selectedFiles.length === 0) {
    toast({ 
      title: "Validation Error", 
      description: "Please upload at least one product image",
      variant: "destructive"
    });
    return;
  }

  const formData = new FormData();
  
  // Append all form fields (they're validated above, so we know they exist)
  formData.append("name", formState.name.trim());
  formData.append("brand", formState.brand.trim());
  formData.append("description", formState.description.trim());
  formData.append("category", formState.category.trim());
  formData.append("gender", formState.gender.trim());
  formData.append("price", formState.price.trim());
  formData.append("stock", formState.stock.trim());
  formData.append("sizes", selectedSizes.join(","));
  formData.append("colors", selectedColors.join(","));

  // Only append images in create mode
  if (!isEditMode) {
    selectedFiles.forEach((file) => formData.append("images", file));
  }

  try {
    const result = isEditMode
      ? await updateProduct(editedProductId, formData)
      : await createProduct(formData);

    if (result) {
      toast({
        title: "Success",
        description: isEditMode ? "Product updated successfully" : "Product created successfully"
      });
      router.push("/super-admin/products/list");
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to save product. Please try again.",
      variant: "destructive"
    });
  }
};

  return (
    <div className="p-6">
      <form
        onSubmit={handleFormSubmit}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-1"
      >
        {!isEditMode && (
          <div className="mt-2 w-full flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-400 p-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <Label className="mt-4">
              Click to browse
              <input
                type="file"
                className="sr-only"
                multiple
                onChange={handleFileChange}
              />
            </Label>
            {selectedFiles.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedFiles.map((file, i) => (
                  <Image
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${i + 1}`}
                    width={80}
                    height={80}
                    className="h-20 w-20 object-contain rounded-md"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Product Details Inputs */}
        <div className="space-y-4">
          <div>
            <Label>Product Name</Label>
            <Input
              name="name"
              value={formState.name}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Brand</Label>
            <Select
              value={formState.brand}
              onValueChange={(val) => handleSelectChange("brand", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Brand" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((b) => (
                  <SelectItem key={b} value={b.toLowerCase()}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formState.description}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={formState.category}
              onValueChange={(val) => handleSelectChange("category", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c.toLowerCase()}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Gender</Label>
            <Select
              value={formState.gender}
              onValueChange={(val) => handleSelectChange("gender", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="men">Men</SelectItem>
                <SelectItem value="women">Women</SelectItem>
                <SelectItem value="kids">Kids</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Size</Label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={selectedSizes.includes(size) ? "default" : "outline"}
                  onClick={() => handleToggleSize(size)}
                  size="sm"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Colors</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <Button
                  key={c.name}
                  type="button"
                  className={`h-8 w-8 rounded-full ${c.class} ${
                    selectedColors.includes(c.name) ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleToggleColor(c.name)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label>Price</Label>
            <Input
              name="price"
              value={formState.price}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>Stock</Label>
            <Input
              name="stock"
              value={formState.stock}
              onChange={handleInputChange}
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : isEditMode ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}
