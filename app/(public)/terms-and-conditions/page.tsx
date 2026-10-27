export default function TermsAndConditionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-foreground">
      <h1 className="text-3xl font-bold mb-2">REGULAMIN SERWISU</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">Wstęp</h2>
        <p>
          Niniejszy Regulamin określa zasady korzystania z serwisu internetowego
          dostępnego pod adresem bigplan.pl. Właścicielem serwisu i usługodawcą
          jest osoba fizyczna: Dorian Nawrocki, kontakt e-mail:{" "}
          <a
            href="mailto:kontakt.bigplan@gmail.com"
            className="underline text-primary"
          >
            kontakt.bigplan@gmail.com
          </a>{" "}
          (zwana dalej „Usługodawcą”).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">§ 1. Definicje</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Serwis</strong> – serwis internetowy prowadzony pod adresem
            bigplan.pl, udostępniający narzędzie online w postaci kalkulatora
            inwestycyjnego, symulacji Monte Carlo oraz portfolio użytkownika z
            możliwością śledzenia cen i ilości instrumentów finansowych
            notowanych na giełdzie papierów wartościowych.
          </li>
          <li>
            <strong>Użytkownik</strong> – każda osoba fizyczna, która korzysta z
            Serwisu lub zakłada w nim konto.
          </li>
          <li>
            <strong>Konto</strong> – indywidualny profil Użytkownika w Serwisie,
            uruchamiany po dokonaniu rejestracji.
          </li>
          <li>
            <strong>Usługodawca</strong> – osoba fizyczna: Dorian Nawrocki,
            kontakt e-mail: kontakt.bigplan@gmail.com
          </li>
          <li>
            <strong>Usługa</strong> – udostępnianie przez Usługodawcę
            funkcjonalności kalkulatora inwestycyjnego oraz konta użytkownika
            drogą elektroniczną.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 2. Warunki ogólne
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Korzystanie z Serwisu jest dobrowolne i oznacza akceptację
            niniejszego Regulaminu.
          </li>
          <li>
            Do korzystania z Serwisu wymagane jest urządzenie z dostępem do
            sieci oraz standardowa przeglądarka internetowa.
          </li>
          <li>
            Zakazane jest dostarczanie przez Użytkownika treści charakterze
            bezprawnym, używanie nazw kont lub haseł naruszających prawa osób
            trzecich, a także podejmowanie działań mogących zakłócić prawidłowe
            funkcjonowanie Serwisu (w tym prób uszkodzenia kodu, przeciążania
            serwera czy nieautoryzowanego dostępu do danych).
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 3. Konto Użytkownika
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Założenie konta w Serwisie jest darmowe.</li>
          <li>
            Użytkownik zobowiązany jest do podania poprawnego adresu e-mail oraz
            do zabezpieczenia hasła dostępu przed osobami trzecimi.
          </li>
          <li>
            Użytkownik ma prawo w każdej chwili usunąć swoje Konto, wysyłając
            żądanie na adres e-mail Usługodawcy lub korzystając z funkcji
            usuwania konta w panelu użytkownika.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 4. Wyłączenie odpowiedzialności
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Wszelkie obliczenia, symulacje, prognozy i wyniki generowane przez
            kalkulator inwestycyjny mają charakter wyłącznie poglądowy,
            edukacyjny i informacyjny.
          </li>
          <li>
            Wyniki symulacji opierają się na algorytmach, założeniach
            wprowadzonych przez Użytkownika oraz wynikach historycznych i nie
            stanowią gwarancji osiągnięcia podobnych rezultatów finansowych w
            przyszłości.
          </li>
          <li>
            Usługodawca nie świadczy usług doradztwa inwestycyjnego,
            finansowego, prawnego ani podatkowego, a prezentowane treści nie
            stanowią rekomendacji w rozumieniu przepisów prawa.
          </li>
          <li>
            Użytkownik podejmuje wszelkie decyzje finansowe na własną
            odpowiedzialność i ryzyko. Usługodawca nie ponosi odpowiedzialności
            za skutki decyzji podjętych w oparciu o wyliczenia Serwisu.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 5. Reklamacje i zgłaszanie błędów
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Wszelkie uwagi oraz zgłoszenia błędów technicznych w działaniu
            Serwisu można przesyłać na adres e-mail: kontakt.bigplan@gmail.com.
          </li>
          <li>
            Usługodawca dołoży starań, aby zgłoszenia były rozpatrywane, a
            usterki techniczne usuwane w najbliższym możliwym terminie.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 6. Postanowienia końcowe
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Usługodawca zastrzega sobie prawo do wprowadzania zmian w
            Regulaminie z ważnych przyczyn (np. rozwój funkcjonalności Serwisu
            lub zmiana przepisów prawa).
          </li>
          <li>
            W przypadku wprowadzenia zmian w Regulaminie, przy pierwszym
            logowaniu do Serwisu Użytkownikowi wyświetlone zostanie okno
            informacyjne dotyczące zmian. Warunkiem dalszego korzystania z
            Serwisu i Konta jest potwierdzenie zapoznania się z nowym
            Regulaminem poprzez kliknięcie przycisku akceptacji w wyświetlonym
            oknie.
          </li>
          <li>
            W sprawach nieuregulowanych w niniejszym Regulaminie mają
            zastosowanie powszechnie obowiązujące przepisy prawa polskiego.
          </li>
        </ol>
      </section>
    </main>
  );
}
