/**
 * Szablon e-maila weryfikującego konto
 */
export function getVerificationEmailHtml({
  url,
  userName,
}: {
  url: string;
  userName?: string | null;
}) {
  const year = new Date().getFullYear();
  const greeting = userName ? `Witaj ${userName}!` : "Witaj!";

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Potwierdź swój adres e-mail</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Big Plan</span>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 28px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 14px 0; text-align: center;">${greeting}</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 28px 0; text-align: center;">
                Dziękujemy za rejestrację w Big Plan. Aby aktywować swoje konto i rozpocząć planowanie finansowe, kliknij poniższy przycisk.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 13px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
                Potwierdź adres e-mail
              </a>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">Jeśli przycisk nie działa, skopiuj i wklej poniższy link w przeglądarce:</p>
              <p style="font-size: 11px; word-break: break-all; color: #3b82f6; margin: 0;">${url}</p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #475569; line-height: 1.5;">
              Jeśli nie rejestrowałeś się w serwisie Big Plan, zignoruj tę wiadomość.<br>
              &copy; ${year} Big Plan. Wszystkie prawa zastrzeżone.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Szablon e-maila do resetowania hasła
 */
export function getResetPasswordEmailHtml({
  url,
  userName,
}: {
  url: string;
  userName?: string | null;
}) {
  const year = new Date().getFullYear();
  const greeting = userName ? `Cześć ${userName}!` : "Cześć!";

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resetowanie hasła</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.3);">
          
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Big Plan</span>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 28px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 14px 0; text-align: center;">Resetowanie hasła</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0 0 28px 0; text-align: center;">
                ${greeting} Otrzymaliśmy prośbę o zmianę hasła do Twojego konta. Kliknij poniższy przycisk, aby ustawić nowe hasło.
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(90deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 13px 34px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
                Ustaw nowe hasło
              </a>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 6px 0;">Jeśli przycisk nie działa, skopiuj i wklej poniższy link w przeglądarce:</p>
              <p style="font-size: 11px; word-break: break-all; color: #3b82f6; margin: 0;">${url}</p>
            </td>
          </tr>

        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" style="max-width: 520px; margin-top: 20px;">
          <tr>
            <td align="center" style="font-size: 12px; color: #475569; line-height: 1.5;">
              Jeśli to nie Ty prosiłeś o zmianę hasła, zignoruj tę wiadomość – Twoje konto jest bezpieczne.<br>
              &copy; ${year} Big Plan. Wszystkie prawa zastrzeżone.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Szablon potwierdzenia zmiany hasła
 */
export function getPasswordChangedEmailHtml({
  userName,
}: {
  userName?: string | null;
}) {
  const year = new Date().getFullYear();
  const greeting = userName ? `Cześć ${userName}!` : "Cześć!";

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hasło zostało zmienione</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 36px 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Big Plan</span>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 28px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #ffffff; margin: 0 0 14px 0; text-align: center;">Hasło zostało zmienione</h1>
              <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin: 0; text-align: center;">
                ${greeting} Hasło do Twojego konta Big Plan zostało właśnie zmienione.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #1e293b; padding-top: 20px;">
              <p style="font-size: 12px; color: #64748b; margin: 0; text-align: center;">
                Jeśli to nie Ty zmieniałeś hasło, skontaktuj się z administratorem.<br>
                &copy; ${year} Big Plan. Wszystkie prawa zastrzeżone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
