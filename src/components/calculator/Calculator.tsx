"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, Button, Steps, Form, InputNumber, Tooltip } from "antd";
import {
  CheckOutlined,
  CloudUploadOutlined,
  InfoCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import PortfolioMiniChart from "./PortfolioMiniChart";
import Simulation from "./Simulation";
import {
  skladkaMiesieczna,
  stopaZwrotuInwestycjiRoczna,
  wartosciPortfelaWyborPortfolio,
} from "@/app/(public)/calculator/calculator";
import averageData from "@/app/(public)/calculator/calculatorAverageData.json";
import {
  savePendingSimulation,
  type PendingSimulation,
  type PendingSimulationResults,
} from "@/src/lib/simulation/pending-simulation";

const stepsItems = [
  { title: "Wybór" },
  { title: "Dane osobowe" },
  { title: "Szczegóły" },
  { title: "Symulacja" },
];

export type FormValues = {
  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  monthlyInvestment?: number;
};

type PortfolioType = "aggressive" | "defensive" | "allStocks";

export default function Calculator() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [knowsMonthlyAmount, setKnowsMonthlyAmount] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<FormValues>({
    currentAge: 0,
    expectedDeathAge: 0,
    workEndAge: 0,
    statePensionAge: 0,
    estimatedPension: 0,
    monthlyNeed: 0,
  });
  const [portfolio, setPortfolio] = useState<PortfolioType | null>(null);
  const [startingMonthlyPayment, setStartingMonthlyPayment] =
    useState<number>(0);
  const [simIsLoading, setSimIsLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [currentResults, setCurrentResults] =
    useState<PendingSimulationResults | null>(null);

  useEffect(() => {
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.session?.userId) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleSimulationReady = useCallback((ready: boolean) => {
    setSimulationReady(ready);
    if (!ready) {
      setJustSaved(false);
    }
  }, []);

  const handleSaveModalClose = useCallback(() => {
    setSaveModalOpen(false);
  }, []);

  const handleSaved = useCallback(() => {
    setJustSaved(true);
    setSaveModalOpen(false);
  }, []);

  const handleSimulationResults = useCallback(
    (results: PendingSimulationResults) => {
      setCurrentResults(results);
    },
    [],
  );

  const next = () => setCurrent((c) => c + 1);
  const prev = () => setCurrent((c) => c - 1);

  const allowIntegerOnly = (e: React.KeyboardEvent) => {
    const allowed = [
      "Backspace",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
    ];
    if (allowed.includes(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };
  const allowDecimal = (e: React.KeyboardEvent) => {
    const allowed = [
      "Backspace",
      "Tab",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "Delete",
      "Home",
      "End",
      ",",
      ".",
    ];
    if (allowed.includes(e.key)) return;
    if (/^\d$/.test(e.key)) return;
    e.preventDefault();
  };

  const canCalcChart = formValues.monthlyNeed > 0;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

  const portfolioChartData = {
    aggressive: canCalcChart
      ? wartosciPortfelaWyborPortfolio(
          formValues.monthlyNeed,
          formValues.estimatedPension,
          formValues.currentAge,
          formValues.workEndAge,
          formValues.statePensionAge,
          formValues.expectedDeathAge,
          averageData.stocksMonthly * 0.6 + averageData.bondsMonthly * 0.4,
          averageData.inflationMonthly,
          true,
        )
      : [],
    defensive: canCalcChart
      ? wartosciPortfelaWyborPortfolio(
          formValues.monthlyNeed,
          formValues.estimatedPension,
          formValues.currentAge,
          formValues.workEndAge,
          formValues.statePensionAge,
          formValues.expectedDeathAge,
          averageData.stocksMonthly * 0.4 + averageData.bondsMonthly * 0.6,
          averageData.inflationMonthly,
          true,
        )
      : [],
    allStocks: canCalcChart
      ? wartosciPortfelaWyborPortfolio(
          formValues.monthlyNeed,
          formValues.estimatedPension,
          formValues.currentAge,
          formValues.workEndAge,
          formValues.statePensionAge,
          formValues.expectedDeathAge,
          averageData.stocksMonthly,
          averageData.inflationMonthly,
          true,
        )
      : [],
  };

  const portfolioPreviewMaxY = (() => {
    const allValues = Object.values(portfolioChartData)
      .flatMap((series) => series)
      .map((point) => point.value);
    const rawMax = allValues.length > 0 ? Math.max(...allValues) : 0;
    return rawMax > 0 ? Math.ceil(rawMax * 1.05) : undefined;
  })();

  const portfolioMonthlyPaymentData = {
    aggressive: canCalcChart
      ? formatAmount(
          skladkaMiesieczna(
            formValues.monthlyNeed,
            formValues.estimatedPension,
            formValues.currentAge,
            formValues.workEndAge,
            formValues.statePensionAge,
            formValues.expectedDeathAge,
            stopaZwrotuInwestycjiRoczna(
              averageData.stocksMonthly * 0.6 + averageData.bondsMonthly * 0.4,
              averageData.inflationMonthly,
            ),
          ),
        )
      : 0,
    defensive: canCalcChart
      ? formatAmount(
          skladkaMiesieczna(
            formValues.monthlyNeed,
            formValues.estimatedPension,
            formValues.currentAge,
            formValues.workEndAge,
            formValues.statePensionAge,
            formValues.expectedDeathAge,
            stopaZwrotuInwestycjiRoczna(
              averageData.stocksMonthly * 0.4 + averageData.bondsMonthly * 0.6,
              averageData.inflationMonthly,
            ),
          ),
        )
      : 0,
    allStocks: canCalcChart
      ? formatAmount(
          skladkaMiesieczna(
            formValues.monthlyNeed,
            formValues.estimatedPension,
            formValues.currentAge,
            formValues.workEndAge,
            formValues.statePensionAge,
            formValues.expectedDeathAge,
            stopaZwrotuInwestycjiRoczna(
              averageData.stocksMonthly,
              averageData.inflationMonthly,
            ),
          ),
        )
      : 0,
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      // Zapisz stan do sessionStorage żeby po loginie/rejestracji zapisać w bazie
      if (currentResults && portfolio) {
        const pending: PendingSimulation = {
          formValues,
          knowsMonthlyAmount,
          portfolioType: portfolio,
          startingMonthlyPayment,
          results: currentResults,
          savedAt: Date.now(),
        };
        savePendingSimulation(pending);
      }
      router.push("/sign-in");
      return;
    }
    setSaveModalOpen(true);
  };

  return (
    <div className="mx-10 p-6 flex-1 flex flex-col min-h-0">
      <div className="w-full max-w-3xl mx-auto mb-6">
        <Steps current={current} items={stepsItems} />
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        {/* --- KROK 0 --- */}
        {current === 0 && (
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-2 gap-5">
              <button
                type="button"
                className="w-full min-h-56 cursor-pointer rounded-md border border-(--btn-border) p-7 text-left transition-colors duration-200 hover:border-(--cta-from) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/30"
                style={{
                  background: "var(--card-background)",
                  boxShadow: "var(--card-shadow)",
                  backdropFilter: "var(--card-backdrop-filter)",
                }}
                onClick={() => {
                  setKnowsMonthlyAmount(false);
                  next();
                }}
              >
                <div className="flex flex-col gap-3">
                  <h4 className="text-lg font-semibold leading-snug text-(--text)">
                    Znam kwotę potrzebną do przeżycia na emeryturze
                  </h4>
                  <p className="text-sm leading-relaxed text-(--muted)">
                    Wyliczymy plan oszczędzania na podstawie potrzebnej kwoty
                    miesięcznej.
                  </p>
                </div>
              </button>

              <button
                type="button"
                className="w-full min-h-56 cursor-pointer rounded-md border border-(--btn-border) p-7 text-left transition-colors duration-200 hover:border-(--cta-from) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent)/30"
                style={{
                  background: "var(--card-background)",
                  boxShadow: "var(--card-shadow)",
                  backdropFilter: "var(--card-backdrop-filter)",
                }}
                onClick={() => {
                  setKnowsMonthlyAmount(true);
                  next();
                }}
              >
                <div className="flex flex-col gap-3">
                  <h4 className="text-lg font-semibold leading-snug text-(--text)">
                    Znam kwotę, którą chcę inwestować co miesiąc
                  </h4>
                  <p className="text-sm leading-relaxed text-(--muted)">
                    Przejdziemy dalej, przyjmując stałą miesięczną wpłatę, oraz
                    ocenimy, w jakim stopniu jest ona wystarczająca.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* --- KROK 1 --- */}
        {current === 1 && (
          <Card
            title="Podaj dane osobowe"
            className="w-full max-w-4xl"
            extra={
              <Tooltip
                title="Wszystkie kwoty podawaj według wartości bieżącej pieniądza - nie uwzględniaj inflacji."
                styles={{ root: { maxWidth: 320, fontSize: 14 } }}
                getPopupContainer={(trigger) =>
                  trigger?.parentElement || document.body
                }
              >
                <InfoCircleOutlined
                  style={{ fontSize: 20 }}
                  className="cursor-pointer"
                />
              </Tooltip>
            }
          >
            <Form form={form} layout="vertical" initialValues={{}}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="currentAge"
                  label="Obecny wiek"
                  rules={[{ required: true, message: "Podaj obecny wiek" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="np. 30"
                    onKeyDown={allowIntegerOnly}
                  />
                </Form.Item>
                <Form.Item
                  name="workEndAge"
                  label="Wiek zakończenia pracy"
                  rules={[
                    { required: true, message: "Podaj wiek zakończenia pracy" },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="np. 60"
                    onKeyDown={allowIntegerOnly}
                  />
                </Form.Item>
                <Form.Item
                  name="statePensionAge"
                  label="Wiek przejścia na emeryturę państwową"
                  rules={[
                    {
                      required: true,
                      message: "Podaj wiek przejścia na emeryturę państwową",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="np. 65"
                    onKeyDown={allowIntegerOnly}
                  />
                </Form.Item>
                <Form.Item
                  name="expectedDeathAge"
                  label="Przewidywany wiek śmierci"
                  rules={[
                    {
                      required: true,
                      message: "Podaj przewidywany wiek śmierci",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="np. 85"
                    onKeyDown={allowIntegerOnly}
                  />
                </Form.Item>
                <Form.Item
                  name="estimatedPension"
                  label="Szacowana emerytura państwowa (miesięcznie)"
                  rules={[
                    {
                      required: true,
                      message: "Podaj szacowaną emeryturę państwową",
                    },
                  ]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    min={0}
                    placeholder="np. 3000"
                    onKeyDown={allowDecimal}
                  />
                </Form.Item>
                <Form.Item
                  name="monthlyNeed"
                  label="Kwota potrzebna na przeżycie na emeryturze (miesięcznie)"
                  rules={[
                    {
                      required: true,
                      message:
                        "Podaj kwotę potrzebną miesięcznie na emeryturze",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="np. 4000"
                    onKeyDown={allowDecimal}
                  />
                </Form.Item>
                {knowsMonthlyAmount && (
                  <Form.Item
                    name="monthlyInvestment"
                    label="Miesięczna kwota inwestycji (PLN)"
                    rules={[
                      {
                        required: true,
                        message: "Podaj miesięczną kwotę inwestycji",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="np. 1000"
                      onKeyDown={allowDecimal}
                    />
                  </Form.Item>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button onClick={prev}>Wstecz</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form.validateFields().then((values) => {
                      setFormValues({
                        currentAge: Number(values.currentAge ?? 0),
                        expectedDeathAge: Number(values.expectedDeathAge ?? 0),
                        workEndAge: Number(values.workEndAge ?? 0),
                        statePensionAge: Number(values.statePensionAge ?? 0),
                        estimatedPension: Number(values.estimatedPension ?? 0),
                        monthlyNeed: Number(values.monthlyNeed ?? 0),
                        monthlyInvestment: values.monthlyInvestment
                          ? Number(values.monthlyInvestment)
                          : undefined,
                      });
                      next();
                    });
                  }}
                >
                  Dalej
                </Button>
              </div>
            </Form>
          </Card>
        )}

        {/* --- KROK 2 --- */}
        {current === 2 && (
          <Card
            title="Wybierz profil portfela"
            className="w-full max-w-5xl"
            extra={
              <Tooltip
                title="Przedstawione poniżej wykresy są poglądowe i mają charakter informatyczny"
                styles={{ root: { maxWidth: 320, fontSize: 14 } }}
                getPopupContainer={(trigger) =>
                  trigger?.parentElement || document.body
                }
              >
                <InfoCircleOutlined
                  style={{ fontSize: 20 }}
                  className="cursor-pointer"
                />
              </Tooltip>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "aggressive" ? "border-2 border-(--accent)" : ""}`}
                styles={{ body: { padding: 24 } }}
                onClick={() => {
                  setPortfolio("aggressive");
                  setStartingMonthlyPayment(
                    Number(portfolioMonthlyPaymentData.aggressive),
                  );
                  next();
                }}
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold">Agresywny</h4>
                  <p className="text-sm text-(--muted)">
                    60% akcje · 40% obligacje
                  </p>
                  <PortfolioMiniChart
                    data={portfolioChartData.aggressive}
                    stroke="#f97316"
                    yMax={portfolioPreviewMaxY}
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      Szacowana miesięczna składka
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {portfolioMonthlyPaymentData.aggressive} zł
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "defensive" ? "border-2 border-(--accent)" : ""}`}
                styles={{ body: { padding: 24 } }}
                onClick={() => {
                  setPortfolio("defensive");
                  setStartingMonthlyPayment(
                    Number(portfolioMonthlyPaymentData.defensive),
                  );
                  next();
                }}
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold">Defensywny</h4>
                  <p className="text-sm text-(--muted)">
                    40% akcje · 60% obligacje
                  </p>
                  <PortfolioMiniChart
                    data={portfolioChartData.defensive}
                    stroke="#0ea5a4"
                    yMax={portfolioPreviewMaxY}
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      Szacowana miesięczna składka
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {portfolioMonthlyPaymentData.defensive} zł
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "allStocks" ? "border-2 border-(--accent)" : ""}`}
                styles={{ body: { padding: 24 } }}
                onClick={() => {
                  setPortfolio("allStocks");
                  setStartingMonthlyPayment(
                    Number(portfolioMonthlyPaymentData.allStocks),
                  );
                  next();
                }}
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold">Akcyjny</h4>
                  <p className="text-sm text-(--muted)">100% akcje</p>
                  <PortfolioMiniChart
                    data={portfolioChartData.allStocks}
                    stroke="#dc2626"
                    yMax={portfolioPreviewMaxY}
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      Szacowana miesięczna składka
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {portfolioMonthlyPaymentData.allStocks} zł
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={prev}>Wstecz</Button>
            </div>
          </Card>
        )}

        {/* --- KROK 3 --- */}
        {current === 3 && (
          <Card className="w-full">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                {!simIsLoading ? (
                  <Button onClick={prev}>Wstecz</Button>
                ) : (
                  <div />
                )}
                {!simIsLoading && simulationReady && (
                  <button
                    type="button"
                    onClick={handleSaveClick}
                    disabled={justSaved}
                    className={`
                      inline-flex items-center gap-2 px-5 py-2 rounded-lg
                      text-sm font-semibold transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50
                      ${
                        justSaved
                          ? "bg-emerald-600 text-white cursor-default"
                          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white cursor-pointer shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30"
                      }
                    `}
                  >
                    {justSaved ? (
                      <>
                        <CheckOutlined style={{ fontSize: 15 }} />
                        Zapisano
                      </>
                    ) : isLoggedIn ? (
                      <>
                        <CloudUploadOutlined style={{ fontSize: 15 }} />
                        Zapisz symulację
                      </>
                    ) : (
                      <>
                        <LockOutlined style={{ fontSize: 15 }} />
                        Zaloguj się, aby zapisać
                      </>
                    )}
                  </button>
                )}
              </div>
              <Simulation
                formValues={formValues}
                knowsMonthlyAmount={knowsMonthlyAmount}
                userMonthlyInvestment={formValues.monthlyInvestment}
                startingMonthlyPayment={startingMonthlyPayment}
                portfolio={
                  portfolio === "aggressive"
                    ? { stocks: 60, bonds: 40 }
                    : portfolio === "defensive"
                      ? { stocks: 40, bonds: 60 }
                      : { stocks: 100, bonds: 0 }
                }
                onLoadingChange={setSimIsLoading}
                isLoggedIn={isLoggedIn}
                saveModalOpen={saveModalOpen}
                onSaveModalClose={handleSaveModalClose}
                onSimulationReady={handleSimulationReady}
                onSaved={handleSaved}
                onSimulationResults={handleSimulationResults}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
