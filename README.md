# Big Plan

Big Plan to aplikacja webowa do planowania finansowego. Użytkownik może
zbudować plan emerytalny, uruchomić symulację inwestowania, zapisać jej
wyniki, a następnie prowadzić rzeczywisty portfel aktywów powiązany z tym
planem. Aplikacja przelicza wartości portfela na PLN, pobiera aktualne ceny
instrumentów i pokazuje odchylenia od docelowej alokacji.

Dokument jest przeznaczony dla dewelopera, który musi uruchomić projekt,
zrozumieć przepływ danych, dodać funkcję albo bezpiecznie wdrożyć zmianę.

## Spis treści

- [Zakres funkcjonalny](#zakres-funkcjonalny)
- [Technologie i odpowiedzialność usług](#technologie-i-odpowiedzialność-usług)
- [Szybki start](#szybki-start)
- [Konfiguracja środowiska](#konfiguracja-środowiska)
- [Architektura aplikacji](#architektura-aplikacji)
- [Przepływy użytkownika](#przepływy-użytkownika)
- [Kalkulator i symulacja](#kalkulator-i-symulacja)
- [Portfele i wycena](#portfele-i-wycena)
- [Model danych](#model-danych)
- [API](#api)
- [Uwierzytelnianie i autoryzacja](#uwierzytelnianie-i-autoryzacja)
- [Struktura repozytorium](#struktura-repozytorium)
- [Wdrożenie na Netlify](#wdrożenie-na-netlify)
- [Praca deweloperska](#praca-deweloperska)
- [Ograniczenia i ważne decyzje](#ograniczenia-i-ważne-decyzje)
- [Rozwiązywanie problemów](#rozwiązywanie-problemów)

## Zakres funkcjonalny

- rejestracja i logowanie przez e-mail/hasło oraz Google OAuth,
- obowiązkowa weryfikacja adresu e-mail,
- reset i zmiana hasła oraz wylogowanie ze wszystkich urządzeń,
- profil użytkownika z newsletterem i uploadem avatara,
- jasny i ciemny motyw,
- kalkulator emerytalny z symulacją Monte Carlo,
- wykresy rozkładu wyników i porównanie wariantów wpłat,
- zapisywanie, edycja, ponowne przeliczanie i usuwanie symulacji,
- portfel powiązany z zapisaną symulacją,
- aktywa z kategorii `STOCKS` i `BONDS`,
- scalanie duplikatów aktywów po tickerze lub nazwie,
- pobieranie notowań z Yahoo Finance,
- pobieranie kursów USD, EUR, GBP i CHF z NBP,
- przeliczanie wartości i zysków do PLN,
- ocena odchyleń alokacji i status rebalancingu,
- dashboard z KPI, wynikami aktywów, walutami i alertami,

## Technologie i odpowiedzialność usług

| Obszar        | Technologia                            | Rola                                                     |
| ------------- | -------------------------------------- | -------------------------------------------------------- |
| Framework     | Next.js 16, App Router                 | strony, layouty, Route Handlers i renderowanie serwerowe |
| UI            | React 19, Ant Design 6, Tailwind CSS 4 | formularze, modale, komunikaty, layout i style           |
| Język         | TypeScript 5, strict mode              | typowanie kodu aplikacji                                 |
| Auth          | better-auth, PostgreSQL (`pg`)         | sesje, hasła, Google, weryfikacja e-maila                |
| Dane domenowe | Supabase Postgres                      | symulacje, portfele, aktywa i dane użytkownika           |
| Pliki         | Supabase Storage                       | avatary w buckecie `avatars`                             |
| E-mail        | Resend                                 | weryfikacja, reset hasła i powiadomienie o zmianie hasła |
| Notowania     | `yahoo-finance2`                       | ticker, nazwa, waluta i cena instrumentu                 |
| FX            | NBP API                                | średnie kursy walut z tabeli A                           |
| Wykresy       | Recharts                               | wykresy kalkulatora, dashboardu i portfela               |
| Hosting       | Netlify + `@netlify/plugin-nextjs`     | build i obsługa Next.js                                  |

Auth i dane aplikacji korzystają z dwóch warstw danych. better-auth używa
połączenia PostgreSQL przez `pg` do swoich tabel (`user`, sesje itd.).
Zapytania biznesowe są wykonywane przez serwerowego klienta Supabase z kluczem
service role. Klucz ten omija RLS, dlatego nigdy nie wolno importować tego
klienta do kodu wykonywanego w przeglądarce ani wystawiać go jako
`NEXT_PUBLIC_*`.

## Szybki start

### Wymagania

- Node.js zgodny z używaną wersją Next.js 16,
- npm,
- projekt Supabase z bazą Postgres i Storage,
- skonfigurowany Google OAuth (jeżeli logowanie Google ma być aktywne),
- konto Resend i zweryfikowany adres nadawcy,
- dostęp do Yahoo Finance i NBP z uruchomionego środowiska.

### Instalacja i uruchomienie

```bash
npm install
```

Utwórz plik `.env.local` zgodnie z sekcją [Konfiguracja środowiska](#konfiguracja-środowiska),
a następnie uruchom aplikację:

```bash
npm run dev
```

Domyślnie aplikacja jest dostępna pod adresem
`http://localhost:3000`. Produkcyjny test lokalny:

```bash
npm run build
npm run start
```

## Konfiguracja środowiska

Przykładowy `.env.local`:

```env
# PostgreSQL używany przez better-auth
DATABASE_URL=postgresql://...
# Opcjonalny fallback, używany gdy DATABASE_URL nie jest ustawiony
DIRECT_URL=postgresql://...
# Opcjonalny certyfikat CA PostgreSQL, jeśli dostawca go wymaga
DATABASE_CA_CERT="-----BEGIN CERTIFICATE-----..."

# Supabase server-side
SUPABASE_URL=https://<projekt>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Bazowy URL używany w redirectach i trusted origins
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

### Znaczenie zmiennych

| Zmienna                     |            Wymagana | Użycie                                                                                        |
| --------------------------- | ------------------: | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`              |                 tak | połączenie better-auth z PostgreSQL                                                           |
| `DIRECT_URL`                |           warunkowo | alternatywa dla `DATABASE_URL`                                                                |
| `DATABASE_CA_CERT`          |           zalecana | certyfikat CA używany do weryfikacji TLS PostgreSQL                                            |
| `SUPABASE_URL`              |                 tak | URL instancji Supabase                                                                        |
| `SUPABASE_SERVICE_ROLE_KEY` |                 tak | serwerowy dostęp do tabel i Storage                                                           |
| `GOOGLE_CLIENT_ID`          |          dla Google | identyfikator OAuth                                                                           |
| `GOOGLE_CLIENT_SECRET`      |          dla Google | sekret OAuth, tylko server-side                                                               |
| `NEXT_PUBLIC_APP_URL`       |            zalecana | callbacki i trusted origin; może być zastąpiona przez origin przeglądarki w części formularzy |
| `RESEND_API_KEY`            | tak dla auth e-mail | wysyłka wiadomości przez Resend                                                               |
| `RESEND_FROM_EMAIL`         | tak dla auth e-mail | zweryfikowany adres `from`                                                                    |

`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`,
`DATABASE_CA_CERT`, `GOOGLE_CLIENT_SECRET` i `RESEND_API_KEY` są sekretami. Nie dodawaj ich do
repozytorium, logów, screenshotów ani zmiennych z prefiksem
`NEXT_PUBLIC_`. W produkcji `RESEND_FROM_EMAIL` musi należeć do zweryfikowanej
domeny w Resend.

Połączenie PostgreSQL wymaga weryfikacji certyfikatu TLS. Nie ustawiaj
`rejectUnauthorized=false`; jeśli dostawca używa prywatnego CA, ustaw
`DATABASE_CA_CERT` na pełny certyfikat CA.

### Integracje OAuth i e-mail

W Google Cloud należy dodać do klienta OAuth redirect URI wynikający z
better-auth, czyli adres API aplikacji z callbackiem Google (dla lokalnego
uruchomienia zwykle `http://localhost:3000/api/auth/callback/google`; przed
wdrożeniem sprawdź konfigurację dostawcy i dokładny URL w używanej wersji
better-auth). Domena produkcyjna musi być dodana do authorized origins.

Resend musi mieć zweryfikowaną domenę lub adres nadawcy. Bez poprawnych
zmiennych Resend moduł e-mail rzuca błąd podczas inicjalizacji, więc funkcje
rejestracji, weryfikacji i resetu hasła nie będą działały.

## Architektura aplikacji

Projekt używa Next.js App Routera:

1. `app/layout.tsx` jest głównym layoutem i ładuje globalne style, fonty oraz
   globalne providery.
2. Grupy tras `(public)`, `(auth)` i `(protected)` porządkują layouty bez
   dodawania segmentu do URL.
3. Strony chronione pobierają sesję po stronie serwera i przekierowują
   niezalogowanego użytkownika.
4. Komponenty interaktywne z `src/components` używają Route Handlers pod
   `app/api` do mutacji i pobierania danych.
5. `src/lib` zawiera logikę domenową, typy DTO, walidację, integracje oraz
   funkcje obliczeniowe możliwe do współdzielenia przez UI i serwer.

### Zasady warstw

- `app/**/page.tsx` powinien koordynować routing, sesję i dane serwerowe.
- `src/components` odpowiada za UI i interakcje; nie powinien otrzymywać
  kluczy serwerowych.
- `app/api` zawsze sprawdza sesję i własność zasobu przed operacją.
- Dane z requestów należy walidować przez Zod przed zapisem.
- Obliczenia finansowe powinny trafiać do `src/lib` albo kalkulatora, a nie
  być powielane w komponentach.
- Przy zmianie DTO trzeba zaktualizować typ, Route Handler i wszystkie
  komponenty korzystające z odpowiedzi.

## Przepływy użytkownika

### Nowy użytkownik

1. Użytkownik wypełnia `/sign-up`.
2. better-auth tworzy użytkownika w PostgreSQL i wysyła e-mail przez Resend.
3. Konto wymaga weryfikacji (`requireEmailVerification: true`).
4. Link prowadzi do `/verify-email`; po poprawnej weryfikacji następuje
   automatyczne logowanie i przejście do `/email-verified` lub dashboardu.

### Zapisywanie kalkulacji przed zalogowaniem

Kalkulator jest publiczny. Gdy anonimowy użytkownik chce zapisać wynik,
wyniki są zapisywane w `localStorage` pod kluczem `pendingSimulation`.

- dane są ważne przez 30 minut,
- po logowaniu/rejestracji `PostAuthHandler` odczytuje draft,
- draft jest konwertowany do `SaveSimulationPayload` i wysyłany do
  `POST /api/simulations`,
- po sukcesie wpis jest usuwany,
- przy limicie albo błędzie wpis pozostaje, aby można było ponowić próbę.

### Portfel

Portfel nie jest tworzony osobnym przyciskiem. Pierwsze dodanie aktywa do
symulacji wykonuje upsert: jeśli portfolio nie istnieje, Route Handler tworzy
je, a następnie dodaje aktywo. Jedna zapisana symulacja ma co najwyżej jeden
powiązany portfel.

## Kalkulator i symulacja

Kalkulator znajduje się w `app/(public)/calculator` i
`src/components/calculator`. Dane historyczne wejściowe są w
`calculatorData.json`; każdy rekord zawiera `stocks`, `bonds` i `inflation`.
Podczas inicjalizacji rekordy niekompletne lub nienumeryczne są odrzucane.
Brak poprawnych rekordów kończy się błędem.

### Model obliczeń

Najważniejsze funkcje w `calculator.ts`:

- `stopaZwrotuInwestycjiRoczna` oblicza realną stopę zwrotu po inflacji:
  `(zwrot - inflacja) / (1 + inflacja)`,
- `stopaZwrotuInwestycjiMiesieczna` konwertuje stopę roczną na miesięczną,
- `celInwestycyjny` wyznacza kapitał potrzebny na emeryturę,
- `skladkaMiesieczna` wyznacza miesięczną wpłatę przy uwzględnieniu kapitału
  początkowego,
- `wartosciPortfelaWyborPortfolio` tworzy deterministyczny przebieg dla
  wybranego portfela,
- `wartosciPortfelaSymulacja` losuje rekord danych dla każdego miesiąca i
  tworzy pojedynczą ścieżkę symulacji.

Przebieg jest podzielony na trzy okresy: oszczędzanie do końca pracy, lukę
między końcem pracy a emeryturą oraz okres emerytury. W okresie emerytury
odejmowana jest miesięczna potrzeba i dodawana szacowana emerytura.

`Simulation.tsx` uruchamia wiele ścieżek, wylicza wynik sukcesu i percentyle.
`extract-percentiles.ts` agreguje wartości dla każdego wieku i wyznacza
kwantyle `p5`, `p25`, `p50`, `p75`, `p95` interpolacją liniową. Domyślna
liczba symulacji zapisywana na serwerze to `10000`, ale payload może przekazać
inną dodatnią wartość.

Wyniki zapisywane w symulacji obejmują osobno wariant rekomendowany i wariant
oparty o zadeklarowaną wpłatę użytkownika. `simulationSuccessRate` i
`userSimulationSuccessRate` są wartościami od `0` do `1`, a nie procentami od
`0` do `100`.

## Portfele i wycena

Aktywo ma nazwę, opcjonalny ticker, kategorię, ilość, cenę średnią, cenę
bieżącą, walutę i opcjonalny własny kurs FX. Obsługiwane przez UI waluty to
`PLN`, `USD`, `EUR`, `GBP` i `CHF`.

### Konwersja do PLN

`toPLN` stosuje następującą kolejność:

1. dla `PLN` zwraca wartość bez zmian,
2. jeśli aktywo ma dodatni `customFxRate`, używa tego kursu,
3. w przeciwnym razie używa kursu z `/api/fx`,
4. przy braku kursu zwraca wartość 1:1 jako fallback.

Wartość bieżąca to `quantity * currentPrice`, a wartość zainwestowana to
`quantity * averagePrice`. Zysk jest różnicą tych wartości po przeliczeniu na
PLN.

### Rebalancing

`calculatePortfolioStats` porównuje rzeczywisty udział akcji z docelowym
udziałem zapisanym w symulacji:

- różnica mniejsza niż 5 punktów procentowych: `OK`,
- różnica od 5 włącznie do 10: `WARNING`,
- różnica od 10 włącznie: `CRITICAL`.

Dashboard używa progu co najmniej 5 punktów procentowych do listy
portfeli wymagających rebalancingu. Przy scalaniu aktywów po tickerze lub
nazwie średnia cena jest ważona wartością transakcji, a cena bieżąca jest
zastępowana nową ceną.

## Model danych

Schemat bazy nie jest przechowywany w repozytorium. Poniższy opis wynika z
zapytań aplikacji i musi być utrzymany zgodnie z rzeczywistym schematem
Supabase/PostgreSQL.

### Tabele better-auth

better-auth zarządza tabelami użytkowników, sesji, kont i tokenów. Użytkownik
ma między innymi `id`, `name`, `email`, `image`, `role`,
`subscriptionPlan` i `wants_newsletter`. Pola `role` i
`subscriptionPlan` są dodatkowymi polami auth, a `wants_newsletter` może być
ustawiane przez użytkownika.

### Tabele domenowe

#### `saved_simulation`

Najważniejsze kolumny:

| Kolumna                                                           | Znaczenie                                   |
| ----------------------------------------------------------------- | ------------------------------------------- |
| `id`                                                              | UUID symulacji                              |
| `userId`                                                          | właściciel                                  |
| `name`                                                            | nazwa, maksymalnie 80 znaków                |
| `currentAge`, `expectedDeathAge`, `workEndAge`, `statePensionAge` | założenia czasowe                           |
| `estimatedPension`, `monthlyNeed`, `currentPortfolioValue`        | dane finansowe                              |
| `stocksPct`, `bondsPct`                                           | docelowa alokacja, razem dokładnie 100      |
| `knowsMonthlyAmount`                                              | czy użytkownik zna własną wpłatę            |
| `userMonthlyInvestment`                                           | własna wpłata albo `null`                   |
| `recommendedMonthlyPayment`                                       | rekomendowana wpłata                        |
| `simulationSuccessRate`                                           | sukces wariantu rekomendowanego, zakres 0–1 |
| `userSimulationSuccessRate`                                       | sukces wariantu użytkownika albo `null`     |
| `recommendedChartPercentiles`                                     | tablica punktów percentylowych              |
| `userChartPercentiles`                                            | opcjonalna tablica punktów                  |
| `totalSimulations`                                                | liczba ścieżek                              |
| `createdAt`, `updatedAt`                                          | znaczniki czasu ISO                         |

API ogranicza użytkownika do jednej zapisanej symulacji
(`MAX_SIMULATIONS_PER_USER = 1`). Jest to obecne zachowanie biznesowe, a nie
ograniczenie kalkulatora.

#### `portfolio`

Portfolio zawiera `id`, `simulationId`, `createdAt`, `updatedAt` i jest
powiązane z jedną symulacją.

#### `portfolio_asset`

Kolumny odpowiadają `PortfolioAssetDTO`: `id`, `portfolioId`, `name`, `ticker`,
`category`, `quantity`, `averagePrice`, `currentPrice`, `currency`,
`customFxRate`, `createdAt`, `updatedAt`.

Usunięcie użytkownika wywołuje `deleteUserData`: najpierw usuwa aktywa,
potem portfele, symulacje i pliki avatara z folderu użytkownika w Storage.

## API

Wszystkie endpointy domenowe używają cookies sesji better-auth. Odpowiedzi
błędów mają kształt `{ "error": "..." }`, a udane mutacje zwykle zawierają
`{ "ok": true, ... }`.

### Auth i użytkownik

| Metoda | Endpoint             | Działanie                                                                                           |
| ------ | -------------------- | --------------------------------------------------------------------------------------------------- |
| `*`    | `/api/auth/[...all]` | endpoint better-auth: rejestracja, logowanie, OAuth, sesje, weryfikacja, reset i zmiana hasła       |
| `POST` | `/api/user/avatar`   | multipart upload avatara; JPG, PNG, WebP lub SVG; limit 20 MB; usuwa wcześniejsze pliki użytkownika |
| `POST` | `/api/user/email`    | ustawia cookie `temp_email` na 5 minut                                                              |

### Symulacje

| Metoda   | Endpoint                   | Działanie i odpowiedzi                                                                 |
| -------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `GET`    | `/api/simulations`         | lista własnych symulacji; `401` bez sesji                                              |
| `POST`   | `/api/simulations`         | tworzy symulację; `201`, `400` dla niepoprawnego payloadu, `403` po osiągnięciu limitu |
| `DELETE` | `/api/simulations?id=<id>` | usuwa własną symulację; `400` bez id, `404` dla braku, `403` dla cudzej                |
| `GET`    | `/api/simulations/[id]`    | pobiera szczegóły własnej symulacji                                                    |
| `PUT`    | `/api/simulations/[id]`    | zastępuje dane symulacji i aktualizuje `updatedAt`                                     |

Payload `POST`/`PUT` wymaga nazwy, danych wieku, kwot, alokacji, wyników i
co najmniej jednego punktu percentylowego. `stocksPct + bondsPct` musi wynosić 100.

### Portfele i aktywa

| Metoda   | Endpoint                                          | Działanie                                                          |
| -------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| `GET`    | `/api/portfolios`                                 | lista symulacji użytkownika wraz z portfelami i aktywami           |
| `GET`    | `/api/portfolios/[simulationId]`                  | szczegóły portfela, aktywa posortowane po `createdAt`              |
| `POST`   | `/api/portfolios/[simulationId]/assets`           | tworzy portfolio w razie potrzeby i dodaje aktywo                  |
| `PUT`    | `/api/portfolios/[simulationId]/assets/[assetId]` | aktualizuje własne aktywo                                          |
| `DELETE` | `/api/portfolios/[simulationId]/assets/[assetId]` | usuwa własne aktywo                                                |
| `POST`   | `/api/portfolios/[simulationId]/sync`             | pobiera ceny tickerów z Yahoo Finance i aktualizuje `currentPrice` |

Aktywo musi mieć dodatnią ilość, nieujemne ceny, kategorię `STOCKS` lub
`BONDS` oraz niepustą walutę. Przy konflikcie nazwy/tickera POST zwraca `409`
z `error: "duplicate_found"`; klient może ponowić request z `merge: true`.
Weryfikacja własności aktywa przechodzi przez relacje aktywo → portfolio →
symulacja → użytkownik.

### Dane zewnętrzne

| Metoda | Endpoint                  | Działanie                                        |
| ------ | ------------------------- | ------------------------------------------------ |
| `GET`  | `/api/ticker?symbol=AAPL` | cena, waluta i nazwa instrumentu z Yahoo Finance |
| `GET`  | `/api/fx`                 | kursy PLN/USD/EUR/GBP/CHF z NBP; cache 1 godzina |

`/api/fx` zwraca `{ rates: { PLN: 1, USD: ..., ... } }`. W razie awarii NBP
endpoint zwraca status `200` z samym `{ rates: { PLN: 1 } }`; dlatego
wyświetlana wartość może wtedy używać fallbacku 1:1.

## Uwierzytelnianie i autoryzacja

Konfiguracja znajduje się w `src/lib/auth/auth.ts`, a współdzielone pobieranie
sesji w `src/lib/auth/get-session.ts`. `getSession` przekazuje nagłówki
bieżącego requestu do `auth.api.getSession` i jest cache'owane przez React.

Hasła dla rejestracji, resetu i zmiany są walidowane wspólnym schematem:

- od 8 do 20 znaków,
- co najmniej jedna wielka litera,
- co najmniej jeden znak specjalny.

Layout `(protected)` sprawdza sesję i przekierowuje do `/`. Pojedyncze strony
chronione i endpointy sprawdzają dodatkowo `session.user.id`. Sam fakt
znajomości identyfikatora symulacji nie daje dostępu: endpointy porównują
`userId` z sesją przed odczytem i mutacją.

`/admin` sprawdza `user.role === "ADMIN"` i wywołuje `forbidden()` dla innych
użytkowników. Widok jest obecnie szkieletem — nie jest pełnym panelem
zarządzania użytkownikami.

## Struktura repozytorium

```text
app/
  layout.tsx                         główny layout i providery
  globals.css                        globalne style i tokeny motywu
  (public)/                          strony bez logowania
    page.tsx                          landing page
    calculator/                       kalkulator, dane i algorytmy
    privacy-policy/, terms-and-conditions/
  (auth)/                            strony logowania i rejestracji
    sign-in/, sign-up/
    forgot-password/, reset-password/, verify-email/
  (protected)/                       strony wymagające sesji
    dashboard/                        dashboard
    my-simulations/                   lista, szczegóły i edycja
    my-portfolios/                    lista i szczegóły portfela
    profile/                          ustawienia konta
    admin/                            kontrola roli ADMIN
  api/                                Route Handlers
    auth/[...all]/                    better-auth
    simulations/                      CRUD symulacji
    portfolios/                       portfele, aktywa i synchronizacja
    ticker/, fx/                      integracje rynkowe
    user/avatar/, user/email/         operacje użytkownika
src/
  components/                         komponenty UI według domen
  lib/
    auth/                             auth, sesja i akcje po logowaniu
    dashboard/                         typy i statystyki dashboardu
    db/                                klient Supabase i czyszczenie danych
    email/                             Resend i szablony wiadomości
    portfolio/                         DTO, FX i statystyki portfela
    simulation/                        typy, percentyle i draft localStorage
    utils/                             walidacja i normalizacja błędów
public/                                statyczne zasoby, np. logo.png
next.config.ts                        zewnętrzne obrazy Google/Supabase
netlify.toml                           build Netlify i plugin Next.js
package.json                           skrypty i zależności
tsconfig.json                          strict TypeScript i alias @/*
```

## Wdrożenie na Netlify

`netlify.toml` ustawia:

- build command: `npm run build`,
- publish directory: `.next`,
- plugin: `@netlify/plugin-nextjs`.

W ustawieniach Site → Environment variables dodaj wszystkie zmienne z
`.env.local`, zastępując lokalny URL adresem produkcyjnym. Po wdrożeniu:

1. dodaj produkcyjną domenę do Google OAuth authorized origins i redirect URIs,
2. ustaw `NEXT_PUBLIC_APP_URL` bez końcowego `/`,
3. zweryfikuj domenę nadawcy w Resend,
4. sprawdź, czy Supabase Storage bucket `avatars` zwraca publiczne URL-e,
5. wykonaj rejestrację, weryfikację, logowanie Google, reset hasła i upload
   avatara,
6. uruchom kalkulator, zapisz symulację i dodaj aktywo z tickerem.

Nie uruchamiaj `npm run start` bez wcześniejszego `npm run build`.

## Praca deweloperska

### Skrypty npm

| Polecenie       | Zastosowanie                                            |
| --------------- | ------------------------------------------------------- |
| `npm run dev`   | serwer deweloperski Next.js                             |
| `npm run build` | produkcyjny build i type-check wykonywany przez Next.js |
| `npm run start` | uruchomienie gotowego buildu                            |
| `npm run lint`  | ESLint dla projektu                                     |

Projekt nie zawiera obecnie osobnego skryptu testów automatycznych. Minimalna
walidacja zmiany powinna obejmować `npm run lint` oraz `npm run build`, a przy
zmianach UI także ręczne przejście odpowiedniego przepływu.

## Ograniczenia i ważne decyzje

- Schemat Supabase i migracje nie są w repozytorium; przed zmianą tabel trzeba
  ustalić migrację i kolejność wdrożenia niezależnie od kodu.
- Service role Supabase jest używany po stronie serwera, więc każde zapytanie
  biznesowe musi mieć jawny check sesji i własności.
- Limit zapisanych symulacji wynosi obecnie 1 na użytkownika.
- Kalkulator korzysta z lokalnego pliku danych historycznych; nie jest to
  prognoza ani gwarancja wyniku inwestycji.
- Yahoo Finance może nie zwrócić ceny dla niepoprawnego, nieobsługiwanego lub
  czasowo niedostępnego tickera.
- Kurs NBP jest cache'owany przez godzinę, a awaria dostawcy ma fallback 1:1.
- Przy braku live FX własny kurs aktywa ma pierwszeństwo, ale brak obu kursów
  nie generuje błędu — wartość zostaje nieprzeliczona.
- Synchronizacja cen aktualizuje tylko aktywa z tickerem i nie zmienia ceny
  średniej ani ilości.
- `/admin` jest kontrolą dostępu do zalążka widoku, a nie gotowym panelem
  administracyjnym.
- `next.config.ts` dopuszcza obrazy tylko z `*.googleusercontent.com` i
  `*.supabase.co`.
