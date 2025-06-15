
import React from "react";
import { DemoProduct } from "@/data/demoProducts";

interface ProductSpecificationsTableProps {
  product: DemoProduct;
}

const ProductSpecificationsTable: React.FC<ProductSpecificationsTableProps> = ({ product }) => {
  // Show a table of available specs (extend as needed)
  const specs = [
    { label: "Category", value: product.category },
    { label: "MOQ", value: `${product.minOrder} units` },
    { label: "In Stock", value: product.inStock ? "Yes" : "No" },
    { label: "Wholesaler", value: product.wholesaler },
    { label: "Origin", value: product.location },
    ...(product.variations && product.variations.length > 0 ? [
      { label: "Available Variations", value: product.variations.map(v => [v.size, v.color].filter(Boolean).join(", ")).join(" | ") }
    ] : [])
  ];
  return (
    <table className="min-w-full text-sm border rounded mb-4 mt-2">
      <tbody>
        {specs.map((spec, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
            <td className="border px-3 py-1 font-medium text-gray-600">{spec.label}</td>
            <td className="border px-3 py-1 font-poppins">{spec.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductSpecificationsTable;
