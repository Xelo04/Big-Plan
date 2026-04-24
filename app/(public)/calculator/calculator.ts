import calculatorDataJson from "./calculatorData.json";

// Stopa zwrotu inwestycji w pojedynczym roku
export function stopaZwrotuInwestycjiRoczna(
  zwrot_inwestycji: number,
  inflacja: number,
) {
  return (zwrot_inwestycji - inflacja) / (1 + inflacja);
}

// Stopa zwrotu inwestycji w pojedynczym miesiącu
export function stopaZwrotuInwestycjiMiesieczna(
  zwrot_inwestycji_roczny: number,
) {
  return (1 + zwrot_inwestycji_roczny) ** (1 / 12) - 1;
}

// Cel inwestycyjny - kwota do uzbierania na emeryturę
export function celInwestycyjny(
  kwota_potrzebna_na_emeryturze_miesiecznie: number,
  szacowana_emerytura_miesiecznie: number,
  zwrot_roczny_portfela: number,
  lata_od_konca_pracy_do_emerytury: number,
  lata_od_emerytury_do_smierci: number,
) {
  const kwota_potrzebna_na_emeryturze_rocznie =
    kwota_potrzebna_na_emeryturze_miesiecznie * 12;
  const szacowana_emerytura_rocznie = szacowana_emerytura_miesiecznie * 12;
  return (
    (kwota_potrzebna_na_emeryturze_rocznie - szacowana_emerytura_rocznie) *
      ((1 -
        (1 + zwrot_roczny_portfela) **
          (-lata_od_konca_pracy_do_emerytury - lata_od_emerytury_do_smierci)) /
        zwrot_roczny_portfela) *
      (1 + zwrot_roczny_portfela) +
    szacowana_emerytura_rocznie *
      ((1 - (1 + zwrot_roczny_portfela) ** -lata_od_konca_pracy_do_emerytury) /
        zwrot_roczny_portfela) *
      (1 + zwrot_roczny_portfela)
  );
}

// Składka miesięczna
export function skladkaMiesieczna(
  kwota_potrzebna_na_emeryturze_miesiecznie: number,
  szacowana_emerytura_miesiecznie: number,
  wiek_obecny: number,
  wiek_zakonczenia_pracy: number,
  wiek_przejscia_na_emeryture: number,
  wiek_smierci: number,
  zwrot_miesieczny_portfela: number,
) {
  const czas_inwestowania = (wiek_zakonczenia_pracy - wiek_obecny) * 12;
  const czas_luki_emerytalnej =
    (wiek_przejscia_na_emeryture - wiek_zakonczenia_pracy) * 12;
  const czas_emerytury = (wiek_smierci - wiek_przejscia_na_emeryture) * 12;
  const skladka_miesieczna =
    ((kwota_potrzebna_na_emeryturze_miesiecznie -
      szacowana_emerytura_miesiecznie) *
      (1 -
        (1 + zwrot_miesieczny_portfela) **
          (-czas_luki_emerytalnej - czas_emerytury)) +
      szacowana_emerytura_miesiecznie *
        (1 - (1 + zwrot_miesieczny_portfela) ** -czas_luki_emerytalnej)) /
    ((1 + zwrot_miesieczny_portfela) ** czas_inwestowania - 1);
  return skladka_miesieczna;
}

// Losuje losowy wiersz z pliku calculatorData.json i zwraca go jako obiekt CalculatorDataRow
export type CalculatorDataRow = {
  id: number;
  stocks: number;
  bonds: number;
  inflation: number;
};

const calculatorDataRows: CalculatorDataRow[] = [];
const calculatorDataSource = calculatorDataJson as Partial<CalculatorDataRow>[];
for (let i = 0; i < calculatorDataSource.length; i++) {
  const row = calculatorDataSource[i];
  if (
    Number.isFinite(row.id) &&
    Number.isFinite(row.stocks) &&
    Number.isFinite(row.bonds) &&
    Number.isFinite(row.inflation)
  ) {
    calculatorDataRows.push(row as CalculatorDataRow);
  }
}
if (calculatorDataRows.length === 0) {
  throw new Error("Brak poprawnych danych w calculatorData.json");
}
const calculatorDataRowsLength = calculatorDataRows.length;
export function randomCalculatorData(): CalculatorDataRow {
  const randomIndex = Math.floor(Math.random() * calculatorDataRowsLength);
  return calculatorDataRows[randomIndex];
}

// Zwraca wartości portfela co miesiąc przy wyborze portfela
type ChartPoint = {
  label: string;
  value: number;
};

export function wartosciPortfelaWyborPortfolio(
  kwota_potrzebna_na_emeryturze_miesiecznie: number,
  szacowana_emerytura_miesiecznie: number,
  wiek_obecny: number,
  wiek_zakonczenia_pracy: number,
  wiek_przejscia_na_emeryture: number,
  wiek_smierci: number,
  zwrot_miesieczny_portfela: number,
  stala_inflacja_miesieczna: number,
  mini = false,
): ChartPoint[] {
  // Obliczenie składki miesięcznej
  const skladka_miesieczna = skladkaMiesieczna(
    kwota_potrzebna_na_emeryturze_miesiecznie,
    szacowana_emerytura_miesiecznie,
    wiek_obecny,
    wiek_zakonczenia_pracy,
    wiek_przejscia_na_emeryture,
    wiek_smierci,
    stopaZwrotuInwestycjiRoczna(
      zwrot_miesieczny_portfela,
      stala_inflacja_miesieczna,
    ),
  );

  const roczneWartosci: Array<{ age: number; value: number }> = [
    { age: wiek_obecny, value: 0 },
  ];

  let wartosc = 0;

  // Wartości portfela od obecnego wieku do wieku zakończenia pracy
  for (
    let miesiac = 1;
    miesiac <= (wiek_zakonczenia_pracy - wiek_obecny) * 12;
    miesiac++
  ) {
    wartosc =
      (wartosc + skladka_miesieczna) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          stala_inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({ age: miesiac / 12 + wiek_obecny, value: wartosc });
    }
  }

  // Wartości portfela od wieku zakończenia pracy do wieku przejścia na emeryturę
  for (
    let miesiac = 1;
    miesiac <= (wiek_przejscia_na_emeryture - wiek_zakonczenia_pracy) * 12;
    miesiac++
  ) {
    wartosc =
      (wartosc - kwota_potrzebna_na_emeryturze_miesiecznie) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          stala_inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({
        age: miesiac / 12 + wiek_zakonczenia_pracy,
        value: wartosc,
      });
    }
  }

  // Wartości portfela od wieku przejścia na emeryturę do wieku śmierci
  for (
    let miesiac = 1;
    miesiac <= (wiek_smierci - wiek_przejscia_na_emeryture) * 12;
    miesiac++
  ) {
    wartosc =
      (wartosc -
        kwota_potrzebna_na_emeryturze_miesiecznie +
        szacowana_emerytura_miesiecznie) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          stala_inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({
        age: miesiac / 12 + wiek_przejscia_na_emeryture,
        value: wartosc,
      });
    }
  }

  if (mini) {
    const valueAtCurrentAge =
      roczneWartosci.find(({ age }) => age === wiek_obecny)?.value ?? 0;
    const valueAtRetirementAge =
      roczneWartosci.find(({ age }) => age === wiek_zakonczenia_pracy)?.value ??
      valueAtCurrentAge;
    const valueAtDeathAge =
      roczneWartosci.find(({ age }) => age === wiek_smierci)?.value ??
      valueAtRetirementAge;

    return [
      { label: String(wiek_obecny), value: valueAtCurrentAge },
      {
        label: String(wiek_zakonczenia_pracy),
        value: valueAtRetirementAge,
      },
      { label: String(wiek_smierci), value: valueAtDeathAge },
    ];
  }
  return roczneWartosci.map(({ age, value }) => ({
    label: String(age),
    value,
  }));
}

// Zwraca wartości portfela co miesiąc przy symulacji losowych danych
export function wartosciPortfelaSymulacja(
  kwota_potrzebna_na_emeryturze_miesiecznie: number,
  szacowana_emerytura_miesiecznie: number,
  wiek_obecny: number,
  wiek_zakonczenia_pracy: number,
  wiek_przejscia_na_emeryture: number,
  wiek_smierci: number,
  ile_akcji: number,
  ile_obligacji: number,
  skladka_miesieczna: number,
): ChartPoint[] {
  const roczneWartosci: Array<{ age: number; value: number }> = [
    { age: wiek_obecny, value: 0 },
  ];

  let wartosc = 0;

  // Wartości portfela od obecnego wieku do wieku zakończenia pracy
  for (
    let miesiac = 1;
    miesiac <= (wiek_zakonczenia_pracy - wiek_obecny) * 12;
    miesiac++
  ) {
    const { stocks, bonds, inflation } = randomCalculatorData();
    const zwrot_miesieczny_portfela = stopaZwrotuInwestycjiMiesieczna(
      stocks * ile_akcji + bonds * ile_obligacji,
    );
    const inflacja_miesieczna = stopaZwrotuInwestycjiMiesieczna(inflation);
    wartosc =
      (wartosc + skladka_miesieczna) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({ age: miesiac / 12 + wiek_obecny, value: wartosc });
    }
  }

  // Wartości portfela od wieku zakończenia pracy do wieku przejścia na emeryturę
  for (
    let miesiac = 1;
    miesiac <= (wiek_przejscia_na_emeryture - wiek_zakonczenia_pracy) * 12;
    miesiac++
  ) {
    const { stocks, bonds, inflation } = randomCalculatorData();
    const zwrot_miesieczny_portfela = stopaZwrotuInwestycjiMiesieczna(
      stocks * ile_akcji + bonds * ile_obligacji,
    );
    const inflacja_miesieczna = stopaZwrotuInwestycjiMiesieczna(inflation);
    wartosc =
      (wartosc - kwota_potrzebna_na_emeryturze_miesiecznie) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({
        age: miesiac / 12 + wiek_zakonczenia_pracy,
        value: wartosc,
      });
    }
  }

  // Wartości portfela od wieku przejścia na emeryturę do wieku śmierci
  for (
    let miesiac = 1;
    miesiac <= (wiek_smierci - wiek_przejscia_na_emeryture) * 12;
    miesiac++
  ) {
    const { stocks, bonds, inflation } = randomCalculatorData();
    const zwrot_miesieczny_portfela = stopaZwrotuInwestycjiMiesieczna(
      stocks * ile_akcji + bonds * ile_obligacji,
    );
    const inflacja_miesieczna = stopaZwrotuInwestycjiMiesieczna(inflation);
    wartosc =
      (wartosc -
        kwota_potrzebna_na_emeryturze_miesiecznie +
        szacowana_emerytura_miesiecznie) *
      (1 +
        stopaZwrotuInwestycjiRoczna(
          zwrot_miesieczny_portfela,
          inflacja_miesieczna,
        ));
    if (miesiac % 12 === 0) {
      roczneWartosci.push({
        age: miesiac / 12 + wiek_przejscia_na_emeryture,
        value: wartosc,
      });
    }
  }

  return roczneWartosci.map(({ age, value }) => ({
    label: String(age),
    value,
  }));
}
