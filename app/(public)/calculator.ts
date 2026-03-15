// const akcje = 1;
// const zwrot_akcji = 0.05;
// const obligacje = 0;
// const zwrot_obligacji = 0.03;
// const inflacja = 0.2;
// const lata_inwestycji = 35;
// const lata_wydawania = 15;
// const wartosc_poczatkowa_inwestycji = 0;
// const szacowana_emerytura = 3000; // w dzisiejszych pieniądzach
// const kwota_potrzebna_na_emeryturze = 5000; // w dzisiejszych pieniądzach, potem mnożona przez inflację

// // Podział portfela i jego stopa zwrotu
// const zwrot_portfela = akcje * zwrot_akcji + obligacje * zwrot_obligacji;

// // Cel inwestycyjny - kwota do uzbierania na emeryturę
// export function celInwestycyjny() {
//   return (
//     (kwota_potrzebna_na_emeryturze * 12 - szacowana_emerytura * 12) *
//     ((1 - (1 + zwrot_portfela) ** -lata_wydawania) / zwrot_portfela) *
//     (1 + zwrot_portfela)
//   );
// }

// // Obliczamy kwotę inwestowaną co rok
// export function skladkaRoczna() {
//   return (
//     celInwestycyjny() /
//     ((((1 + zwrot_portfela) ** lata_inwestycji - 1) / zwrot_portfela) *
//       (1 + zwrot_portfela))
//   );
// }

// Obliczamy kwotę inwestowaną co miesiąc
export function skladkaMiesieczna(
  akcje: number,
  zwrot_akcji: number,
  obligacje: number,
  zwrot_obligacji: number,
  lata_inwestycji: number,
  celInwestycyjny: number,
) {
  const zwrot_portfela = akcje * zwrot_akcji + obligacje * zwrot_obligacji;
  const zwrot_portfela_miesieczny = zwrot_portfela / 12;
  const miesiace_inwestycji = lata_inwestycji * 12;
  return (
    celInwestycyjny /
    ((((1 + zwrot_portfela_miesieczny) ** miesiace_inwestycji - 1) /
      zwrot_portfela_miesieczny) *
      (1 + zwrot_portfela_miesieczny))
  );
}

// Obliczamy cel inwestycyjny ze składki miesięcznej
export function celInwestycyjnyZeSkladkiMiesiecznej(
  akcje: number,
  zwrot_akcji: number,
  obligacje: number,
  zwrot_obligacji: number,
  lata_inwestycji: number,
  skladkaMiesieczna: number,
) {
  const zwrot_portfela = akcje * zwrot_akcji + obligacje * zwrot_obligacji;
  const zwrot_portfela_miesieczny = zwrot_portfela / 12;
  const miesiace_inwestycji = lata_inwestycji * 12;
  return (
    skladkaMiesieczna *
    ((((1 + zwrot_portfela_miesieczny) ** miesiace_inwestycji - 1) /
      zwrot_portfela_miesieczny) *
      (1 + zwrot_portfela_miesieczny))
  );
}

// Zwraca wartości portfela co miesiąc (domyślnie) lub co rok.
type ChartPoint = {
  label: string;
  value: number;
};

export function wartosciPortfela(
  akcje: number,
  zwrot_akcji: number,
  obligacje: number,
  zwrot_obligacji: number,
  lata_inwestycji: number,
  skladkaMiesieczna: number,
  coRok = false,
  mini = false,
): ChartPoint[] {
  const zwrot_portfela = akcje * zwrot_akcji + obligacje * zwrot_obligacji;
  const zwrot_portfela_miesieczny = zwrot_portfela / 12;
  const miesiace_inwestycji = Math.max(0, Math.floor(lata_inwestycji * 12));

  const punkty: ChartPoint[] = [];

  for (let miesiac = 1; miesiac <= miesiace_inwestycji; miesiac++) {
    let wartosc = 0;

    if (zwrot_portfela_miesieczny === 0) {
      wartosc = skladkaMiesieczna * miesiac;
    } else {
      const mnoznik = 1 + zwrot_portfela_miesieczny;
      const czynnikAnnuityDue =
        ((mnoznik ** miesiac - 1) / zwrot_portfela_miesieczny) * mnoznik;
      wartosc = skladkaMiesieczna * czynnikAnnuityDue;
    }

    if (!coRok) {
      punkty.push({
        label: String(miesiac),
        value: wartosc,
      });
    } else if (miesiac % 12 === 0) {
      punkty.push({
        label: String(miesiac / 12),
        value: wartosc,
      });
    }
  }

  if (!mini) {
    return punkty;
  }

  if (punkty.length <= 5) {
    return punkty.map((p) => ({ ...p, value: Math.round(p.value) }));
  }

  const maxPoints = 5;
  const lastIdx = punkty.length - 1;
  const indexSet = new Set<number>();

  indexSet.add(0);
  for (let i = 1; i < maxPoints - 1; i++) {
    indexSet.add(Math.round((i * lastIdx) / (maxPoints - 1)));
  }
  indexSet.add(lastIdx);

  return [...indexSet]
    .sort((a, b) => a - b)
    .map((idx) => ({
      ...punkty[idx],
      value: Math.round(punkty[idx].value),
    }));
}
