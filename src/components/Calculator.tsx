"use client";

import { useState } from "react";
import { Card, Button, Steps, Form, InputNumber, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import PortfolioMiniChart from "./PortfolioMiniChart";
import {
  celInwestycyjnyZeSkladkiMiesiecznej,
  skladkaMiesieczna,
  wartosciPortfela,
} from "@/app/(public)/calculator";

const stepsItems = [
  { title: "Wybierz" },
  { title: "Dane osobowe" },
  { title: "Szczegóły" },
  { title: "Podsumowanie" },
];

type FormValues = {
  yearsToRetirement: number;
  expectedDeathAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  targetAmount: number;
  monthlyContribution: number;
};

export default function Calculator() {
  const [current, setCurrent] = useState(0);
  const [mode, setMode] = useState<"goal" | "monthly" | null>(null);
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<FormValues>({
    yearsToRetirement: 0,
    expectedDeathAge: 0,
    estimatedPension: 0,
    monthlyNeed: 0,
    targetAmount: 0,
    monthlyContribution: 0,
  });
  const [portfolio, setPortfolio] = useState<
    "aggressive" | "defensive" | "allEquity" | null
  >(null);

  // * Nawigacja
  const next = () => setCurrent((c) => c + 1);
  const prev = () => setCurrent((c) => c - 1);

  // * Logika kalkulatora
  const chooseMode = (selected: "goal" | "monthly") => {
    setMode(selected);
    next();
  };

  // * Formularz
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

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);

  const canCalcChart =
    (mode === "monthly" &&
      formValues.yearsToRetirement > 0 &&
      formValues.monthlyContribution > 0) ||
    (mode === "goal" &&
      formValues.yearsToRetirement > 0 &&
      formValues.targetAmount > 0);

  const portfolioChartData = {
    aggressive: canCalcChart
      ? wartosciPortfela(
          0.6,
          0.05,
          0.4,
          0.03,
          formValues.yearsToRetirement,
          mode === "monthly"
            ? formValues.monthlyContribution
            : skladkaMiesieczna(
                0.6,
                0.05,
                0.4,
                0.03,
                formValues.yearsToRetirement,
                formValues.targetAmount,
              ),
          true,
          true,
        )
      : [],
    defensive: canCalcChart
      ? wartosciPortfela(
          0.4,
          0.05,
          0.6,
          0.03,
          formValues.yearsToRetirement,
          mode === "monthly"
            ? formValues.monthlyContribution
            : skladkaMiesieczna(
                0.4,
                0.05,
                0.6,
                0.03,
                formValues.yearsToRetirement,
                formValues.targetAmount,
              ),
          true,
          true,
        )
      : [],
    allEquity: canCalcChart
      ? wartosciPortfela(
          1,
          0.05,
          0,
          0.03,
          formValues.yearsToRetirement,
          mode === "monthly"
            ? formValues.monthlyContribution
            : skladkaMiesieczna(
                1,
                0.05,
                0,
                0.03,
                formValues.yearsToRetirement,
                formValues.targetAmount,
              ),
          true,
          true,
        )
      : [],
  };

  return (
    <div className="mx-10 p-6 flex-1 flex flex-col min-h-0">
      <div className="w-full max-w-3xl mx-auto mb-6">
        <Steps current={current} items={stepsItems} />
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        {current === 0 && (
          <div className="flex flex-wrap gap-6 w-full justify-evenly">
            <Card
              hoverable
              className={`w-full sm:w-80 cursor-pointer ${mode === "goal" ? "border-2 border-(--accent)" : ""}`}
              bodyStyle={{ padding: 32 }}
              onClick={() => chooseMode("goal")}
            >
              <div className="h-40 sm:h-40 flex flex-col justify-center items-start gap-2 px-2 sm:px-0">
                <h3 className="text-lg font-semibold">Znam cel inwestycyjny</h3>
                <p className="text-sm text-(--muted)">
                  Określ kwotę docelową i czas.
                </p>
              </div>
            </Card>

            <Card
              hoverable
              className={`w-full sm:w-80 cursor-pointer ${mode === "monthly" ? "border-2 border-(--accent)" : ""}`}
              bodyStyle={{ padding: 32 }}
              onClick={() => chooseMode("monthly")}
            >
              <div className="h-40 sm:h-40 flex flex-col justify-center items-start gap-2 px-2 sm:px-0">
                <h3 className="text-lg font-semibold">
                  Znam miesięczną wpłatę
                </h3>
                <p className="text-sm text-(--muted)">
                  Podaj ile możesz odkładać co miesiąc.
                </p>
              </div>
            </Card>
          </div>
        )}

        {current === 1 && (
          <Card
            title="Podaj dane osobowe"
            className="w-full max-w-4xl"
            extra={
              <Tooltip
                title={
                  "Wszystkie kwoty podawaj według wartości bieżącej pieniądza - nie uwzględniaj inflacji."
                }
                overlayStyle={{ maxWidth: 320, fontSize: 14 }}
                getPopupContainer={(trigger) =>
                  trigger?.parentElement || document.body
                }
              >
                <InfoCircleOutlined
                  style={{ fontSize: 20 }}
                  className="cursor-pointer"
                  aria-label="Informacja"
                />
              </Tooltip>
            }
          >
            <Form form={form} layout="vertical" initialValues={{}}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Form.Item
                    name="yearsToRetirement"
                    label="Lata do emerytury"
                    rules={[
                      {
                        required: true,
                        message: "Podaj liczbę lat do emerytury",
                      },
                    ]}
                  >
                    <InputNumber
                      min={0}
                      style={{ width: "100%" }}
                      placeholder="np. 15"
                      onKeyDown={allowIntegerOnly}
                    />
                  </Form.Item>
                </div>

                <div>
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
                </div>

                <div>
                  <Form.Item
                    name="estimatedPension"
                    label={"Szacowana emerytura (miesięcznie)"}
                    rules={[
                      {
                        required: true,
                        message: "Podaj szacowaną emeryturę",
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
                </div>

                <div>
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
                </div>

                {mode === "goal" && (
                  <div>
                    <Form.Item
                      name="targetAmount"
                      label={"Kwota docelowa"}
                      rules={[
                        { required: true, message: "Podaj kwotę docelową" },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="np. 200000"
                        onKeyDown={allowDecimal}
                      />
                    </Form.Item>
                  </div>
                )}

                {mode === "monthly" && (
                  <div>
                    <Form.Item
                      name="monthlyContribution"
                      label={"Miesięczna wpłata"}
                      rules={[
                        { required: true, message: "Podaj miesięczną wpłatę" },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        style={{ width: "100%" }}
                        placeholder="np. 500"
                        onKeyDown={allowDecimal}
                      />
                    </Form.Item>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button onClick={prev}>Wstecz</Button>
                <Button
                  type="primary"
                  onClick={() => {
                    form.validateFields().then((values) => {
                      setFormValues({
                        yearsToRetirement: Number(
                          values.yearsToRetirement ?? 0,
                        ),
                        expectedDeathAge: Number(values.expectedDeathAge ?? 0),
                        estimatedPension: Number(values.estimatedPension ?? 0),
                        monthlyNeed: Number(values.monthlyNeed ?? 0),
                        targetAmount: Number(values.targetAmount ?? 0),
                        monthlyContribution: Number(
                          values.monthlyContribution ?? 0,
                        ),
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

        {current === 2 && (
          <Card
            title="Wybierz profil portfela"
            className="w-full max-w-5xl"
            extra={
              <Tooltip
                title={
                  "Przedstawione poniżej wykresy są poglądowe i mają charakter informatyczny"
                }
                overlayStyle={{ maxWidth: 320, fontSize: 14 }}
                getPopupContainer={(trigger) =>
                  trigger?.parentElement || document.body
                }
              >
                <InfoCircleOutlined
                  style={{ fontSize: 20 }}
                  className="cursor-pointer"
                  aria-label="Informacja"
                />
              </Tooltip>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "aggressive" ? "border-2 border-(--accent)" : ""}`}
                bodyStyle={{ padding: 24 }}
                onClick={() => {
                  setPortfolio("aggressive");
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
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      {mode === "goal"
                        ? "Wymagana składka miesięczna"
                        : "Szacowany kapitał"}
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {mode === "goal"
                        ? `${formatAmount(
                            Math.round(
                              skladkaMiesieczna(
                                0.6,
                                0.05,
                                0.4,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.targetAmount,
                              ),
                            ),
                          )} zł/mies.`
                        : `${formatAmount(
                            Math.round(
                              celInwestycyjnyZeSkladkiMiesiecznej(
                                0.6,
                                0.05,
                                0.4,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.monthlyContribution,
                              ),
                            ),
                          )} zł`}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "defensive" ? "border-2 border-(--accent)" : ""}`}
                bodyStyle={{ padding: 24 }}
                onClick={() => {
                  setPortfolio("defensive");
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
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      {mode === "goal"
                        ? "Wymagana składka miesięczna"
                        : "Szacowany kapitał"}
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {mode === "goal"
                        ? `${formatAmount(
                            Math.round(
                              skladkaMiesieczna(
                                0.4,
                                0.05,
                                0.6,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.targetAmount,
                              ),
                            ),
                          )} zł/mies.`
                        : `${formatAmount(
                            Math.round(
                              celInwestycyjnyZeSkladkiMiesiecznej(
                                0.4,
                                0.05,
                                0.6,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.monthlyContribution,
                              ),
                            ),
                          )} zł`}
                    </p>
                  </div>
                </div>
              </Card>

              <Card
                hoverable
                className={`w-full cursor-pointer border border-(--btn-border) ${portfolio === "allEquity" ? "border-2 border-(--accent)" : ""}`}
                bodyStyle={{ padding: 24 }}
                onClick={() => {
                  setPortfolio("allEquity");
                  next();
                }}
              >
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold">Akcyjny</h4>
                  <p className="text-sm text-(--muted)">100% akcje</p>
                  <PortfolioMiniChart
                    data={portfolioChartData.allEquity}
                    stroke="#dc2626"
                  />
                  <div className="mt-2 pt-2 border-t border-(--btn-border)">
                    <p className="text-xs text-(--muted)">
                      {mode === "goal"
                        ? "Wymagana składka miesięczna"
                        : "Szacowany kapitał"}
                    </p>
                    <p className="text-base font-semibold text-(--accent)">
                      {mode === "goal"
                        ? `${formatAmount(
                            Math.round(
                              skladkaMiesieczna(
                                1,
                                0.05,
                                0,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.targetAmount,
                              ),
                            ),
                          )} zł/mies.`
                        : `${formatAmount(
                            Math.round(
                              celInwestycyjnyZeSkladkiMiesiecznej(
                                1,
                                0.05,
                                0,
                                0.03,
                                formValues.yearsToRetirement,
                                formValues.monthlyContribution,
                              ),
                            ),
                          )} zł`}
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

        {current === 3 && (
          <Card className="w-full">
            <p>Podsumowanie i akcja końcowa.</p>
            <div className="flex gap-2 justify-end mt-4">
              <Button onClick={prev}>Wstecz</Button>
              <Button type="primary">Zakończ</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
