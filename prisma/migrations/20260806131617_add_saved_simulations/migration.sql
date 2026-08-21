-- AlterTable
ALTER TABLE "user" ADD COLUMN     "wants_newsletter" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "saved_simulation" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "userId" TEXT NOT NULL,
    "currentAge" INTEGER NOT NULL,
    "expectedDeathAge" INTEGER NOT NULL,
    "workEndAge" INTEGER NOT NULL,
    "statePensionAge" INTEGER NOT NULL,
    "estimatedPension" DOUBLE PRECISION NOT NULL,
    "monthlyNeed" DOUBLE PRECISION NOT NULL,
    "stocksPct" INTEGER NOT NULL,
    "bondsPct" INTEGER NOT NULL,
    "knowsMonthlyAmount" BOOLEAN NOT NULL,
    "userMonthlyInvestment" DOUBLE PRECISION,
    "recommendedMonthlyPayment" DOUBLE PRECISION NOT NULL,
    "simulationSuccessRate" DOUBLE PRECISION NOT NULL,
    "userSimulationSuccessRate" DOUBLE PRECISION,
    "recommendedChartPercentiles" JSONB NOT NULL,
    "userChartPercentiles" JSONB,
    "totalSimulations" INTEGER NOT NULL DEFAULT 10000,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_simulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_simulation_userId_idx" ON "saved_simulation"("userId");

-- AddForeignKey
ALTER TABLE "saved_simulation" ADD CONSTRAINT "saved_simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
