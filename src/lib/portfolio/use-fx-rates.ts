"use client";

import { useState, useEffect } from "react";

// Prosty cache w pamięci RAM przeglądarki
let cachedRates: Record<string, number> | null = null;

export function useFxRates() {
  const [rates, setRates] = useState<Record<string, number>>(
    cachedRates || { PLN: 1 },
  );
  const [loading, setLoading] = useState(!cachedRates);

  useEffect(() => {
    if (cachedRates) return;

    fetch("/api/fx")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          cachedRates = data.rates;
          setRates(data.rates);
        }
      })
      .catch((err) => console.error("Failed to load fx rates:", err))
      .finally(() => setLoading(false));
  }, []);

  return { rates, loading };
}
