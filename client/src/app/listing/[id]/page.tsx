// src/app/listing/[id]/page.tsx

import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";

// Page component — dynamic route [id]
export default function ProductDetailsPage({ params }: any) {
  // Using `any` avoids the Next.js PageProps typing conflict
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={params.id} />
    </Suspense>
  );
}
