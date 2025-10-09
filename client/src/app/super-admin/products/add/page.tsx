// src/app/super-admin/products/add/page.tsx
import { Suspense } from "react";
import SuperAdminManageProductForm from "./SuperAdminManageProductForm"
import ProductDetailsSkeleton from "@/app/listing/[id]/productSkeleton";

export default function AddProductPage() {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <SuperAdminManageProductForm />
    </Suspense>
  );
}
