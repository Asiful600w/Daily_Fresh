# Supabase Configuration Guide

To make the implemented authentication features work, you need to configure your Supabase project as follows:

## 1. Google & Facebook Login
1.  Go to your Supabase Project Dashboard.
2.  Navigate to **Authentication** > **Providers**.
3.  **Google**:
    *   Enable "Google".
    *   Enter your `Client ID` and `Client Secret` (obtained from Google Cloud Console).
    *   Add the `Callback URL` provided by Supabase to your Google Cloud Console's "Authorized redirect URIs".
4.  **Facebook**:
    *   Enable "Facebook".
    *   Enter your `Client ID` and `Client Secret` (obtained from Meta Developers).
    *   Add the `Callback URL` provided by Supabase to your Facebook App's "Valid OAuth Redirect URIs".

## 2. Redirect URLs
1.  Navigate to **Authentication** > **URL Configuration**.
2.  Ensure your `Site URL` is set to your production URL (or `http://localhost:3000` for dev).
3.  Add the following to **Redirect URLs**:
    *   `https://daily-fresh-web.vercel.app/auth/callback` (Primary)
    *   `https://daily-fresh-web.vercel.app/update-password`
    *   `http://localhost:3000/auth/callback` (Optional, for local dev references)

## 3. Email Verification & Templates
1.  Navigate to **Authentication** > **Email Templates**.
2.  **Confirm Your Signup**:
    *   Ensure strict email verification is enabled if desired (toggle "Enable custom SMTP" if needed for reliability, or use Supabase default).
    *   Customize the `Message` body. Use `{{ .ConfirmationURL }}` variable.
    *   Example: `<a href="{{ .ConfirmationURL }}">Confirm Email</a>`
3.  **Reset Password**:
    *   Modify the `Subject` line (e.g., "Reset Your Password").
    *   **CRITICAL**: Ensure the link points to your update password page via the redirect.
    *   Supabase sends a magic link type URL. Our strict implementation uses `resetPasswordForEmail` with a redirect.
    *   Just ensure `{{ .ConfirmationURL }}` is present in the email body.
