export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-foreground">
      <h1 className="text-3xl font-bold mb-2">POLITYKA PRYWATNOŚCI</h1>

      <p>
        Szanujemy Twoją prywatność. Dane dotyczące Twoich finansów, oszczędności
        i portfela wprowadzane w Serwisie traktujemy jako poufne. Poniżej
        dowiesz się, jak i w jakim celu przetwarzamy Twoje dane.
      </p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 1. Administrator Danych Osobowych
        </h2>
        <p>
          Administratorem Twoich danych osobowych jest osoba fizyczna: Dorian
          Nawrocki, kontakt e-mail:{" "}
          <a
            href="mailto:kontakt.bigplan@gmail.com"
            className="underline text-primary"
          >
            kontakt.bigplan@gmail.com
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 2. Cele i podstawy przetwarzania
        </h2>
        <p>Przetwarzamy Twoje dane osobowe w następujących celach:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Utworzenie i obsługa Konta</strong> – umożliwienie logowania
            i zapisywanie Twoich kalkulacji (podstawa z RODO: art. 6 ust. 1 lit.
            b – wykonanie umowy o świadczenie usługi).
          </li>
          <li>
            <strong>Kontakt i obsługa zgłoszeń</strong> – odpowiedź na
            wiadomości wysłane na nasz e-mail (podstawa z RODO: art. 6 ust. 1
            lit. f – prawnie uzasadniony interes Administratora).
          </li>
          <li>
            <strong>Bezpieczeństwo Serwisu</strong> – ochrona przed próbami
            ataku i nadużyć (podstawa z RODO: art. 6 ust. 1 lit. f – prawnie
            uzasadniony interes Administratora).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 3. Zakres zbieranych danych i poufność
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Zbieramy dane podane przez Ciebie podczas rejestracji (adres e-mail,
            nazwa użytkownika) oraz dane techniczne (adres IP, cookies sesyjne).
          </li>
          <li>
            Wszelkie dane dotyczące kwot, wyliczeń i symulacji inwestycyjnych
            wprowadzane w kalkulatorze są poufne. Nie sprzedajemy ani nie
            udostępniamy Twoich danych podmiotom trzecim w celach marketingowych
            czy handlowych.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 4. Odbiorcy danych (Dostawcy techniczni)
        </h2>
        <p>
          Twoje dane nie są przekazywane nikomu poza podmiotami, z których usług
          korzystamy, aby Serwis mógł działać poprawnie:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Dostawca hostingu / serwera</strong> – podmiot świadczący
            usługę utrzymania infrastruktury serwerowej i bazy danych Serwisu
            (przechowuje dane w sposób bezpieczny wyłącznie na nasze zlecenie).
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 5. Pliki Cookies (Ciasteczka)
        </h2>
        <ol className="list-decimal pl-6 space-y-1">
          <li>
            Serwis wykorzystuje wyłącznie niezbędne pliki cookies służące do
            utrzymania sesji zalogowanego Użytkownika.
          </li>
          <li>
            Możesz w dowolnym momencie zmienić ustawienia dotyczące plików
            cookies w swojej przeglądarce, jednak ich wyłączenie może
            uniemożliwić poprawne logowanie do Konta.
          </li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold border-b pb-1">
          § 6. Twoje Prawa
        </h2>
        <p>Masz prawo do:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Dostęp do swoich danych oraz otrzymania ich kopii,</li>
          <li>Sprostowania (poprawienia) nieprawidłowych danych,</li>
          <li>
            Usunięcia danych („prawo do bycia zapomnianym”) poprzez skasowanie
            Konta lub kontakt e-mail,
          </li>
          <li>Ograniczenia przetwarzania danych,</li>
          <li>
            Wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony
            Danych Osobowych).
          </li>
        </ul>
        <p className="mt-2">
          W celu realizacji swoich praw napisz na adres:{" "}
          <a
            href="mailto:kontakt.bigplan@gmail.com"
            className="underline text-primary"
          >
            kontakt.bigplan@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
