# Clerk authentication

Equora uses the existing development Clerk application. Authentication adds
sign-in, sign-up, a server-verified account page, and sign-out to both navigation
shells. Public data exploration and existing simulation workflows remain public.
The backend's admin import token remains separate: signing in does not grant
administrative access or imply ownership of the shared scenario dataset.

The browser uses Clerk's JavaScript SDK and prebuilt UI. SvelteKit verifies the
`__session` cookie using the Clerk Backend SDK before returning account details.
Only the publishable key is public; the secret key stays in the server environment.
Accepted session origins are explicitly configured for development/production.
No custom password storage or alternate session cookies are introduced.

The development Clerk instance requires verified email and a password and also
offers Google using its development configuration. Paths are `/sign-in`,
`/sign-up`, and `/account`; signing out returns to `/`.

The development instance also has `branding.show_clerk_branding=false`, configured
through Clerk rather than hidden with application CSS. Hosted instance settings
and keys are environment setup and are not applied automatically by a Git merge.

## Local configuration

Run `pnpm dlx clerk@latest env pull --instance dev --file .env.local` from
`frontend`. The generated file is ignored by Git. Set
`PUBLIC_CLERK_PUBLISHABLE_KEY` to the same publishable key for SvelteKit and
`CLERK_AUTHORIZED_PARTIES` to comma-separated allowed origins. Keep
`CLERK_SECRET_KEY` private. Restart the frontend after changing environment values.

Without keys, public pages remain available and sign-in reports that
authentication is not configured. Production requires production Clerk keys,
an allowed HTTPS origin, and the corresponding Clerk domain/OAuth setup.

References: [JavaScript quickstart](https://clerk.com/docs/js-frontend/getting-started/quickstart)
and [server token verification](https://clerk.com/docs/reference/backend/verify-token).

## Verification — 24 October 2026

- `pnpm check`: no errors or warnings.
- `pnpm test`: 10 tests passed in the isolated pull-request checkout, including real RSA-signed JWT verification with
  expired/future claims, altered signatures, wrong issuer/origin, and missing
  verification settings.
- `pnpm build`: passed; Clerk/UI and map dependencies emit bundle-size warnings.
  Clerk's UI is imported dynamically on authentication pages/sign-out.
- `pnpm exec playwright test --workers=2`: 31 tests passed; the opt-in live Clerk
  test was skipped in this normal suite. Public navigation, landing, methodology,
  workspace, and account access checks are included.
- Frozen-lockfile installation, the generated API contract check, documentation
  links, and changed-file whitespace checks passed.
- Account route tests: anonymous and forged cookies redirect to sign-in; public
  sign-in is available.
- Opt-in live Clerk test: sign-up, test email verification, server-rendered
  account, reload, sign-out, password sign-in, and 390 px layout passed against
  the development instance. The synthetic account is removed after the test.
- Desktop/mobile authentication screenshots were inspected. The secret key was
  checked against generated browser assets and was not present.
- Production domain, production Clerk instance, and Google OAuth round-trip are
  not verified by these checks. Google remains available from the development
  instance's existing provider configuration.
