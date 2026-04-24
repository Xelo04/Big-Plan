import { InputNumber, Slider } from "antd";

type SimulationFormInputs = {
  currentAge: number;
  expectedDeathAge: number;
  workEndAge: number;
  statePensionAge: number;
  estimatedPension: number;
  monthlyNeed: number;
  stocksPct: number;
};

type SimulationParametersFormProps = {
  inputs: SimulationFormInputs;
  hasPendingChanges: boolean;
  onInputsChange: (nextInputs: SimulationFormInputs) => void;
};

export default function SimulationParametersForm({
  inputs,
  hasPendingChanges,
  onInputsChange,
}: SimulationParametersFormProps) {
  const bondsPct = 100 - inputs.stocksPct;

  const updateInputs = (patch: Partial<SimulationFormInputs>) => {
    onInputsChange({ ...inputs, ...patch });
  };

  return (
    <div className="mt-6 rounded-lg border border-(--btn-border) p-4">
      <p className="text-sm font-semibold mb-3">Parametry symulacji</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-xs text-(--muted) mb-1">Obecny wiek</p>
          <InputNumber
            min={0}
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
            min={0}
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
            min={0}
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
            min={0}
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
      </div>

      <p className="text-sm font-semibold mb-2">Sklad portfela</p>
      <div className="flex items-center justify-between text-sm mb-3">
        <span>Akcje: {inputs.stocksPct}%</span>
        <span>Obligacje: {bondsPct}%</span>
      </div>
      <Slider
        min={0}
        max={100}
        step={1}
        value={inputs.stocksPct}
        onChange={(value) => {
          if (typeof value === "number") {
            updateInputs({ stocksPct: value });
          }
        }}
      />

      <p className="text-xs mt-3 text-(--muted)">
        {hasPendingChanges
          ? "Masz nowe ustawienia. Kliknij przycisk, aby uruchomic symulacje na nowych danych."
          : "Wykres pokazuje wynik dla aktualnych ustawien."}
      </p>
    </div>
  );
}
