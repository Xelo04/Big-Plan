import { InputNumber, Slider } from "antd";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type SimulationFormInputs = {
  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  currentPortfolioValue: number;
  stocksPct: number;
  monthlyInvestment: number;
};

type SimulationParametersFormProps = {
  inputs: SimulationFormInputs;
  hasPendingChanges: boolean;
  showMonthlyInvestmentField?: boolean;
  onInputsChange: (nextInputs: SimulationFormInputs) => void;
};

const STOCKS_COLOR = "#f97316";
const BONDS_COLOR = "#0ea5a4";

export default function SimulationParametersForm({
  inputs,
  hasPendingChanges,
  showMonthlyInvestmentField = false,
  onInputsChange,
}: SimulationParametersFormProps) {
  const bondsPct = 100 - inputs.stocksPct;

  const updateInputs = (patch: Partial<SimulationFormInputs>) => {
    onInputsChange({ ...inputs, ...patch });
  };

  const pieData = [
    { name: "Akcje", value: inputs.stocksPct, color: STOCKS_COLOR },
    { name: "Obligacje", value: bondsPct, color: BONDS_COLOR },
  ];

  return (
    <div className="mt-6 min-w-0 rounded-lg border border-(--btn-border) p-3 sm:p-4">
      <p className="text-sm font-semibold mb-3">Parametry symulacji</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-(--muted) mb-1">Obecny wiek</p>
          <InputNumber
            min={18}
            max={110}
            style={{ width: "100%" }}
            value={inputs.currentAge}
            onChange={(value) =>
              updateInputs({ currentAge: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">
            Przewidywany wiek śmierci
          </p>
          <InputNumber
            min={18}
            max={110}
            style={{ width: "100%" }}
            value={inputs.expectedDeathAge}
            onChange={(value) =>
              updateInputs({ expectedDeathAge: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">Wiek zakończenia pracy</p>
          <InputNumber
            min={18}
            max={110}
            style={{ width: "100%" }}
            value={inputs.workEndAge}
            onChange={(value) =>
              updateInputs({ workEndAge: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">
            Wiek przejścia na emeryturę państwową
          </p>
          <InputNumber
            min={18}
            max={110}
            style={{ width: "100%" }}
            value={inputs.statePensionAge}
            onChange={(value) =>
              updateInputs({ statePensionAge: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">
            Szacowana emerytura (mies.)
          </p>
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            value={inputs.estimatedPension}
            onChange={(value) =>
              updateInputs({ estimatedPension: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">Potrzebna kwota (mies.)</p>
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            value={inputs.monthlyNeed}
            onChange={(value) =>
              updateInputs({ monthlyNeed: Number(value ?? 0) })
            }
          />
        </div>
        <div>
          <p className="text-xs text-(--muted) mb-1">
            Obecna wartość płynnych inwestycji
          </p>
          <InputNumber
            min={0}
            max={100000000}
            style={{ width: "100%" }}
            value={inputs.currentPortfolioValue}
            onChange={(value) =>
              updateInputs({ currentPortfolioValue: Number(value ?? 0) })
            }
          />
        </div>
        {showMonthlyInvestmentField && (
          <div>
            <p className="text-xs text-(--muted) mb-1">
              Miesięczna kwota inwestycji (PLN)
            </p>
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={inputs.monthlyInvestment}
              onChange={(value) =>
                updateInputs({ monthlyInvestment: Number(value ?? 0) })
              }
            />
          </div>
        )}
      </div>

      {/* --- Skład portfela --- */}
      <div className="mt-6 pt-4 border-t border-(--btn-border)">
        <p className="text-sm font-semibold mb-4">Skład portfela</p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-6 items-center">
          {/* Lewa strona: legendy i slider */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm mb-3">
              <div className="inline-flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ background: STOCKS_COLOR }}
                />
                <span className="font-medium text-(--text)">
                  Akcje: {inputs.stocksPct}%
                </span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ background: BONDS_COLOR }}
                />
                <span className="font-medium text-(--text)">
                  Obligacje: {bondsPct}%
                </span>
              </div>
            </div>

            <Slider
              min={0}
              max={100}
              step={1}
              value={inputs.stocksPct}
              tooltip={{ formatter: (val) => `${val}% Akcji` }}
              onChange={(value) => {
                if (typeof value === "number") {
                  updateInputs({ stocksPct: value });
                }
              }}
              styles={{
                track: {
                  background: STOCKS_COLOR,
                  height: 8,
                },
                rail: {
                  background: BONDS_COLOR,
                  height: 8,
                  opacity: 0.7,
                },
              }}
            />

            <div className="mt-4 pt-3 border-t border-(--btn-border)/50">
              <p className="text-xs text-(--muted) mb-2">
                {hasPendingChanges
                  ? "Masz nowe ustawienia. Kliknij przycisk, aby uruchomić symulację na nowych danych."
                  : "Wykres pokazuje wynik dla aktualnych ustawień."}
              </p>
              <p className="text-[11px] text-(--muted) leading-normal opacity-80">
                Kalkulacja wykonana na podstawie wyników historycznych. Akcje
                odnoszą się do wartości indeksu S&P 500 (uwzględniając
                dywidendy) w latach 1928-2025 skorygowanych o inflację.
                Obligacje odnoszą się do wartości obligacji US Treasury Bond
                (10-year) w latach 1928-2025 skorygowanych o inflację. Przeszłe
                wyniki nie gwarantują podobnych wyników w przyszłości.
                Inwestowanie wiąże się z ryzykiem utraty całości lub części
                kapitału. To nie jest porada inwestycyjna.
              </p>
            </div>
          </div>

          {/* Prawa strona: wykres kołowy */}
          <div className="mx-auto hidden h-32 w-full max-w-52 sm:h-40 md:block">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={
                    inputs.stocksPct > 0 && inputs.stocksPct < 100 ? 2 : 0
                  }
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
