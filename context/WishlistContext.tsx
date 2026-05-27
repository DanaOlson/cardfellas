"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

type WishlistState = {
  productIds: Set<string>;
  loading: boolean;
};

type WishlistContextValue = {
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  loading: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<WishlistState>({
    productIds: new Set(),
    loading: false,
  });
  // Track in-flight toggles to prevent double-clicks
  const [pending, setPending] = useState<Set<string>>(new Set());

  // Fetch wishlist once when the user session is established
  useEffect(() => {
    if (status !== "authenticated") {
      // Clear wishlist when logged out
      setState({ productIds: new Set(), loading: false });
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data: { productIds?: string[] }) => {
        setState({
          productIds: new Set(data.productIds ?? []),
          loading: false,
        });
      })
      .catch(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
  }, [status, session?.user?.id]);

  const isWishlisted = useCallback(
    (productId: string) => state.productIds.has(productId),
    [state.productIds]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!session?.user) return;
      if (pending.has(productId)) return; // debounce rapid clicks

      // Optimistic update
      const wasWishlisted = state.productIds.has(productId);
      setState((prev) => {
        const next = new Set(prev.productIds);
        wasWishlisted ? next.delete(productId) : next.add(productId);
        return { ...prev, productIds: next };
      });
      setPending((p) => new Set(p).add(productId));

      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (!res.ok) {
          // Revert on failure
          setState((prev) => {
            const next = new Set(prev.productIds);
            wasWishlisted ? next.add(productId) : next.delete(productId);
            return { ...prev, productIds: next };
          });
        }
      } catch {
        // Revert on network error
        setState((prev) => {
          const next = new Set(prev.productIds);
          wasWishlisted ? next.add(productId) : next.delete(productId);
          return { ...prev, productIds: next };
        });
      } finally {
        setPending((p) => {
          const next = new Set(p);
          next.delete(productId);
          return next;
        });
      }
    },
    [session, state.productIds, pending]
  );

  return (
    <WishlistContext.Provider
      value={{ isWishlisted, toggle, loading: state.loading }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
