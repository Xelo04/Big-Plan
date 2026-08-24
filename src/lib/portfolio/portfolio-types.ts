export type AssetCategory = "STOCKS" | "BONDS";

export const ASSET_CATEGORIES: AssetCategory[] = ["STOCKS", "BONDS"];

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  STOCKS: "Akcje",
  BONDS: "Obligacje",
};

export type PortfolioAssetDTO = {
  id: string;
  name: string;
  ticker: string | null;
  category: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  customFxRate: number | null;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioDTO = {
  id: string;
  simulationId: string;
  assets: PortfolioAssetDTO[];
  createdAt: string;
  updatedAt: string;
};

export type PortfolioListItemDTO = {
  simulation: {
    id: string;
    name: string;
    stocksPct: number;
    bondsPct: number;
    updatedAt: string;
  };
  portfolio: PortfolioDTO | null;
};

export type CreateAssetPayload = {
  name: string;
  ticker?: string | null;
  category: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  customFxRate?: number | null;
};

export type UpdateAssetPayload = CreateAssetPayload;

export const SUPPORTED_CURRENCIES = [
  "PLN",
  "USD",
  "EUR",
  "GBP",
  "CHF",
] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
