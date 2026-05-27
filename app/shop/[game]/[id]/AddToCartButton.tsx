"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { useCart, CartProduct } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";

interface Props {
  product: CartProduct;
  inStock: boolean;
}

export function AddToCartButton({ product, inStock }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Button
      variant="primary"
      size="lg"
      className="flex-1"
      disabled={!inStock}
      onClick={handleAdd}
    >
      {added ? (
        <>
          <Check size={16} /> Added!
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          {inStock ? "Add to Cart" : "Out of Stock"}
        </>
      )}
    </Button>
  );
}
