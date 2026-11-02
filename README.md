# Big Plan

Big Plan to aplikacja webowa do planowania finansowego, symulacji inwestycyjnych i monitorowania rzeczywistego portfela aktywów.

## Funkcjonalności

- rejestracja i logowanie przez e-mail/hasło oraz Google OAuth,
- weryfikacja adresu e-mail, reset i zmiana hasła,
- profil użytkownika z avatarem, preferencjami i wylogowaniem ze wszystkich urządzeń,
- kalkulator inwestycyjny z symulacją Monte Carlo oraz wykresami Recharts,
- zapisywanie, edycja, ponowne przeliczanie i usuwanie symulacji,
- dashboard z podsumowaniem symulacji i portfeli,
- portfele powiązane z zapisanymi symulacjami,
- dodawanie i edycja aktywów, między innymi akcji, ETF-ów i obligacji,
- automatyczne pobieranie cen aktywów z Yahoo Finance,
- pobieranie kursów walut z NBP i przeliczanie wartości portfela na PLN,
- analiza odchyleń alokacji i propozycje rebalancingu,
- panel administracyjny dla użytkowników z odpowiednią rolą,
- jasny i ciemny motyw interfejsu.

## Stack technologiczny

- **Next.js 16** z App Routerem i TypeScriptem,
- **React 19**,
- **Ant Design 6** oraz Tailwind CSS 4,
- **better-auth** z adapterem PostgreSQL (`pg`),
- **Supabase** jako backend danych aplikacji i storage avatarów,
- **Recharts** do wizualizacji danych,
- **Resend** do wysyłki wiadomości e-mail,
- **Yahoo Finance** do notowań aktywów,
- **NBP API** do kursów walut,
- **Netlify** jako docelowa platforma wdrożeniowa.

## Uruchomienie lokalne

Wymagane jest Node.js oraz skonfigurowany projekt Supabase i dostawca Google OAuth.

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Utwórz plik `.env.local` i uzupełnij zmienne:

   ```env
   DATABASE_URL=postgresql://...
   # Opcjonalnie używane jako alternatywne połączenie PostgreSQL
   DIRECT_URL=postgresql://...

   SUPABASE_URL=https://....supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...

   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   RESEND_API_KEY=...
   RESEND_FROM_EMAIL=...
   ```

   `SUPABASE_SERVICE_ROLE_KEY` jest używany wyłącznie po stronie serwera i nie może być udostępniany w kodzie klienta.
   `RESEND_FROM_EMAIL` musi należeć do zweryfikowanej domeny w Resend. W środowisku produkcyjnym ustaw

3. Uruchom serwer deweloperski:

   ```bash
   npm run dev
   ```

   Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

## Skrypty npm

| Polecenie       | Działanie                              |
| --------------- | -------------------------------------- |
| `npm run dev`   | Uruchamia serwer deweloperski Next.js. |
| `npm run build` | Tworzy produkcyjny build aplikacji.    |
| `npm run start` | Uruchamia aplikację z gotowego buildu. |
| `npm run lint`  | Uruchamia ESLint.                      |

## Główne trasy

### Publiczne

- `/` - strona startowa,
- `/calculator` - kalkulator i symulacja inwestycyjna,
- `/sign-in` - logowanie,
- `/sign-up` - rejestracja,
- `/forgot-password` - rozpoczęcie resetu hasła,
- `/reset-password` - ustawienie nowego hasła,
- `/verify-email` - weryfikacja adresu e-mail.

### Chronione

- `/dashboard` - podsumowanie finansowe użytkownika,
- `/my-simulations` - zapisane symulacje,
- `/my-simulations/[id]` - szczegóły symulacji,
- `/my-simulations/edit/[id]` - edycja i ponowne przeliczenie symulacji,
- `/my-portfolios` - lista portfeli,
- `/my-portfolios/[simulationId]` - szczegóły portfela i aktywów,
- `/profile` - profil i ustawienia konta,
- `/email-verified` - ekran po poprawnej weryfikacji,
- `/admin` - panel administracyjny.

## API

- `/api/auth/[...all]` - endpointy `better-auth`,
- `/api/simulations` oraz `/api/simulations/[id]` - operacje na symulacjach,
- `/api/portfolios` oraz `/api/portfolios/[simulationId]` - operacje na portfelach,
- `/api/portfolios/[simulationId]/assets` - dodawanie, edycja i usuwanie aktywów,
- `/api/portfolios/[simulationId]/sync` - synchronizacja cen z Yahoo Finance,
- `/api/ticker` - pobieranie notowania pojedynczego instrumentu,
- `/api/fx` - pobieranie kursów walut z NBP,
- `/api/user/avatar` - upload i aktualizacja avatara,
- `/api/user/email` - obsługa tymczasowego adresu e-mail.

## Struktura projektu

```text
app/
   layout.tsx                    Główny layout, fonty, motyw i provider powiadomień
   globals.css                   Globalne style i tokeny motywu
   not-found.tsx                 Strona 404
   unauthorized.tsx              Strona 401
   forbidden.tsx                 Strona 403
   favicon.ico                   Ikona aplikacji
   (auth)/                       Layout i strony uwierzytelniania
      layout.tsx
      sign-in/                    Logowanie e-mail/hasło i Google
      sign-up/                    Rejestracja e-mail/hasło i Google
      forgot-password/            Żądanie resetu hasła
      reset-password/             Ustawienie nowego hasła
      verify-email/               Weryfikacja adresu e-mail
   (public)/                     Strony dostępne bez logowania
      layout.tsx                  Header, Footer i publiczny układ strony
      page.tsx                    Strona startowa
      WelcomePage.tsx             Treść strony startowej i wykres demonstracyjny
      HeroVisual.tsx              Wizualizacja sekcji hero
      loading.tsx                 Stan ładowania stron publicznych
      calculator/                 Kalkulator i dane symulacji
         page.tsx
         calculator.ts             Funkcje obliczeniowe
         calculatorData.json       Dane wejściowe
         calculatorAverageData.json Dane uśrednione
         calculatorArchive.ts      Archiwalne warianty obliczeń
   (protected)/                  Strony wymagające aktywnej sesji
      layout.tsx                  Layout chroniony i obsługa akcji po auth
      loading.tsx                 Stan ładowania
      dashboard/                  Dashboard użytkownika
      my-simulations/             Lista, szczegóły i edycja symulacji
         [id]/
         edit/[id]/
      my-portfolios/              Lista i szczegóły portfeli
         [simulationId]/
      profile/                    Profil i ustawienia konta
      email-verified/             Potwierdzenie weryfikacji e-maila
      admin/                      Panel administracyjny
   api/                          Route handlers backendowe
      auth/[...all]/               Endpointy better-auth
      simulations/                 CRUD zapisanych symulacji
         [id]/
      portfolios/                  CRUD portfeli
         [simulationId]/
            assets/                  CRUD aktywów portfela
            sync/                    Synchronizacja cen z Yahoo Finance
      ticker/                      Notowanie pojedynczego instrumentu
      fx/                          Kursy walut z NBP
      user/avatar/                 Upload avatara do Supabase Storage
      user/email/                  Obsługa tymczasowego adresu e-mail

src/
   components/                   Komponenty interfejsu pogrupowane według domen
      auth/                        Obsługa akcji po logowaniu i rejestracji
      calculator/                  Formularze, symulacja, wykresy i zapis wyników
      dashboard/                   KPI, alerty, highlights i wykres alokacji
      layout/                      Header, Footer i LoadingPage
      notifications/              Provider oraz komunikaty Ant Design
      portfolio/                   Aktywa, podsumowanie i rebalancing portfela
      simulations/                 Lista, szczegóły i edycja symulacji
      theme/                       Provider i przełącznik jasnego/ciemnego motywu
   lib/
      auth/                        Konfiguracja better-auth, sesja i akcje po auth
      db/                          Klient administracyjny Supabase
      dashboard/                   Typy i pomocnicze funkcje dashboardu
      email/                       Resend i szablony wiadomości e-mail
      portfolio/                   Typy DTO, kursy walut i obliczenia portfela
      simulation/                  Typy, percentyle i drafty w localStorage
      utils/                       Walidacja Zod i normalizacja błędów

public/                          Statyczne assety aplikacji
   logo.png                      Logo aplikacji

eslint.config.mjs                Konfiguracja ESLint
global.d.ts                      Globalne deklaracje typów
next-env.d.ts                    Typy generowane przez Next.js
next.config.ts                  Konfiguracja Next.js i zewnętrznych obrazów
postcss.config.mjs               Konfiguracja PostCSS/Tailwind
netlify.toml                     Build i plugin Next.js dla Netlify
package.json                     Zależności i skrypty npm
tsconfig.json                    Konfiguracja TypeScript i aliasu @/*
```

Dane aplikacji są przechowywane w tabelach Supabase, a avatary w Supabase Storage. Schemat bazy i konfiguracja środowiska nie są przechowywane w repozytorium.

## Generowanie md dla NotebookLM

```bash
npx repomix --style markdown --ignore "node_modules/**,.next/**,package-lock.json,public/**,*.png,*.jpg,*.svg,*.ico"
```
