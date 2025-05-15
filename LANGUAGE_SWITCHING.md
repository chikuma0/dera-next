# Language Switching Functionality

This document outlines the language switching implementation in the DERA Next.js application.

## Overview

The application supports two languages:
- English (default)
- Japanese

## Implementation Details

### File Structure

```
src/
  app/
    [lang]/                  # Dynamic route segment for language
      layout.tsx            # Layout for language-specific routes
      page.tsx              # Redirects to home page
      home/
        page.tsx        # Home page with localized content
  components/
    ui/
      LanguageSwitcher.tsx  # Language switching component
  context/
    LanguageContext.tsx    # Context for language management
  i18n/
    locales/
      en.json           # English translations
      ja.json           # Japanese translations
  middleware.ts             # Handles language routing
```

### Key Components

1. **LanguageContext**
   - Manages the current language state
   - Provides translation functionality
   - Handles language switching

2. **LanguageSwitcher**
   - UI component for switching between languages
   - Updates the URL and triggers a page reload

3. **Middleware**
   - Handles language-based routing
   - Redirects root URL to the default language
   - Ensures all routes have a language prefix

### How It Works

1. When a user visits the root URL (`/`), they are automatically redirected to the default language home page (`/en/home`).

2. The language switcher component allows users to switch between English and Japanese.

3. When a language is selected:
   - The URL is updated to include the new language code
   - The page content is updated to show the selected language
   - The language preference is maintained across page navigation

4. The middleware ensures that all routes are properly prefixed with a language code.

## Testing

To test the language switching functionality:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Run the test script:
   ```bash
   node scripts/test-language-switching.js
   ```

3. Manually test by:
   - Visiting http://localhost:3000 (should redirect to /en/home)
   - Using the language switcher to switch between English and Japanese
   - Directly visiting /ja/home to see Japanese content

## Adding New Languages

1. Add a new translation file in `src/i18n/locales/` (e.g., `es.json` for Spanish)
2. Update the `locales` array in `src/middleware.ts`
3. Add the new language option to the `LanguageSwitcher` component
4. Update any type definitions if needed

## Known Issues

- Page transitions during language switching could be smoother
- Some dynamic content might not update immediately without a page reload
