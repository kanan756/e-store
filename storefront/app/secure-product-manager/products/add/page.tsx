import ProductForm from "../../ProductForm"

export const metadata = {
  title: "Add New Product – CLASPO Product Manager",
}

export default function AddProductPage() {
  return <ProductForm isEdit={false} />
}
