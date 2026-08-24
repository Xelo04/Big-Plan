-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_asset" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "ticker" VARCHAR(20),
    "category" VARCHAR(20) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'PLN',
    "customFxRate" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_simulationId_key" ON "portfolio"("simulationId");

-- CreateIndex
CREATE INDEX "portfolio_asset_portfolioId_idx" ON "portfolio_asset"("portfolioId");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "saved_simulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_asset" ADD CONSTRAINT "portfolio_asset_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
