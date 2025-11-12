"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProductStore } from "@/store/useProductStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import { useCartStore } from "@/store/useCartStore";
import { useToast } from "@/hooks/use-toast";
import SizeAdvisory from "@/components/ai/SizeAdvisory"; // ✅ ADDED

function ProductDetailsContent({ id }: { id: string }) {
  const [product, setProduct] = useState<any>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const { getProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      const productDetails = await getProductById(id);
      if (productDetails) {
        setProduct(productDetails);
      } else {
        router.push("/404");
      }
    };

    fetchProduct();
  }, [id, getProductById, router]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: product.colors[selectedColor],
        size: selectedSize,
        quantity: quantity,
      });

      setSelectedSize("");
      setSelectedColor(0);
      setQuantity(1);

      toast({
        title: "Product is added to cart",
      });
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => ({ ...prev, [imageUrl]: true }));
  };

  if (!product || isLoading) return <ProductDetailsSkeleton />;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 flex gap-4">
            {/* Thumbnail Images */}
            <div className="hidden lg:flex flex-col gap-2 w-24">
              {product?.images.map((image: string, index: number) => (
                <button
                  onClick={() => setSelectedImage(index)}
                  key={index}
                  className={`aspect-square bg-gray-100 border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? "border-black"
                      : "border-gray-200"
                  }`}
                >
                  {imageErrors[image] ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-400">N/A</span>
                    </div>
                  ) : (
                    <img
                      src={image}
                      alt={`Product-${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(image)}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Main Product Image */}
            <div className="flex-1 aspect-square bg-gray-100 border overflow-hidden flex items-center justify-center">
              {imageErrors[product.images[selectedImage]] ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Image not available</span>
                </div>
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={() =>
                    handleImageError(product.images[selectedImage])
                  }
                />
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="lg:w-1/3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div>
                <span className="text-2xl font-semibold">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-2">Color</h3>
              <div className="flex gap-2">
                {product.colors.map((color: string, index: number) => (
                  <button
                    key={index}
                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                      selectedColor === index
                        ? "border-black scale-110"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(index)}
                    title={`Color option ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-medium mb-2">Size</h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size: string, index: number) => (
                  <Button
                    key={index}
                    className="w-12 h-12"
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  size="icon"
                >
                  −
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  onClick={() => setQuantity(quantity + 1)}
                  variant="outline"
                  size="icon"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Add to Cart Button + AI Size Advisor */}
            <div className="flex flex-col gap-4">
              <Button
                className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg"
                onClick={handleAddToCart}
              >
                ADD TO CART
              </Button>

              {/* ✅ AI Size Advisory Button */}
              <SizeAdvisory
                productName={product.name}
                availableSizes={product.sizes}
              />
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b">
              <TabsTrigger value="details">PRODUCT DESCRIPTION</TabsTrigger>
              <TabsTrigger value="reviews">REVIEWS</TabsTrigger>
              <TabsTrigger value="shipping">
                SHIPPING & RETURNS INFO
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-5">
              <p className="text-gray-700 mb-4">{product.description}</p>
            </TabsContent>
            <TabsContent value="reviews" className="mt-5">
              <p className="text-gray-700">Reviews coming soon</p>
            </TabsContent>
            <TabsContent value="shipping">
              <p className="text-gray-700 mb-4">
                Shipping and return information goes here. Please read the info
                before proceeding.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailsContent;

