"use client";

import { useEffect } from "react";
import type { CalculatorDataRow } from "./calculator";

type RandomDataConsoleLoggerProps = {
  row: CalculatorDataRow;
};

export default function RandomDataConsoleLogger({
  row,
}: RandomDataConsoleLoggerProps) {
  useEffect(() => {
    console.log("Losowy wiersz z calculatorData.csv:", row);
  }, [row]);

  return null;
}
