
import React from "react";
import { ProductPricingTier } from "@/data/demoProducts";

interface ProductPricingTableProps {
  tiers: ProductPricingTier[];
  currency?: string;
}

const ProductPricingTable: React.FC<ProductPricingTableProps> = ({ tiers, currency = "Rs." }) => {
  if (!tiers || !tiers.length) return null;
  return (
    <div className="mb-4">
      <h4 className="font-semibold font-poppins mb-2">Pricing Tiers</h4>
      <table className="min-w-full text-sm border rounded">
        <thead>
          <tr>
            <th className="text-left border px-2 py-1">Quantity</th>
            <th className="text-left border px-2 py-1">Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, idx) => (
            <tr key={idx} className="border-t">
              <td className="border px-2 py-1">
                {tier.maxQty ? `${tier.minQty} - ${tier.maxQty}` : `≥ ${tier.minQty}`}
              </td>
              <td className="border px-2 py-1 text-primary font-bold">
                {currency} {tier.price.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPricingTable;
