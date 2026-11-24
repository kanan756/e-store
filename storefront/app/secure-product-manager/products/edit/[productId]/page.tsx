import Link from "next/link"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/sheets"
import ProductForm from "../../../ProductForm"

export const metadata = {
  title: "Edit Product – CLASPO Product Manager",
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>
}) {
  const { productId } = await params
  const product = await getProductById(productId)

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#17191C", marginBottom: 10 }}>
          Product Not Found
        </h2>
        <p style={{ color: "#6B7280", marginBottom: 24 }}>
          Could not find a product with ID &ldquo;{productId}&rdquo; in the catalog.
        </p>
        <Link href="/secure-product-manager/products" className="pm-btn pm-btn-primary">
          Back to Products List
        </Link>
      </div>
    )
  }

  return <ProductForm initialData={product} isEdit={true} />
}
