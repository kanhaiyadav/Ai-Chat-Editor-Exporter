# Internationalization (i18n) Implementation

This document describes the internationalization implementation in Chat2Pdf using react-i18next.

## Supported Languages

The application supports 15 languages covering major global markets:

1. **English (en)** - English
2. **Spanish (es)** - Español
3. **French (fr)** - Français
4. **German (de)** - Deutsch
5. **Chinese (zh)** - 中文
6. **Japanese (ja)** - 日本語
7. **Korean (ko)** - 한국어
8. **Portuguese (pt)** - Português
9. **Russian (ru)** - Русский
10. **Arabic (ar)** - العربية (RTL support)
11. **Hindi (hi)** - हिन्दी
12. **Italian (it)** - Italiano
13. **Dutch (nl)** - Nederlands
14. **Turkish (tr)** - Türkçe
15. **Polish (pl)** - Polski

## Project Structure

```
lib/i18n/
├── config.ts              # i18n configuration and initialization
└── locales/
    ├── en.json           # English translations
    ├── es.json           # Spanish translations
    ├── fr.json           # French translations
    ├── de.json           # German translations
    ├── zh.json           # Chinese translations
    ├── ja.json           # Japanese translations
    ├── ko.json           # Korean translations
    ├── pt.json           # Portuguese translations
    ├── ru.json           # Russian translations
    ├── ar.json           # Arabic translations
    ├── hi.json           # Hindi translations
    ├── it.json           # Italian translations
    ├── nl.json           # Dutch translations
    ├── tr.json           # Turkish translations
    └── pl.json           # Polish translations

components/
└── LanguageSelector.tsx   # Language selector dropdown component
```

## Usage

### In Components

To use translations in any component:

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
    const { t } = useTranslation();

    return (
        <div>
            <h1>{t("header.title")}</h1>
            <p>{t("header.subtitle")}</p>
        </div>
    );
}
```

### Translation Keys Structure

Translation keys are organized hierarchically:

```json
{
    "header": {
        "title": "Chat2Pdf",
        "subtitle": "Edit & Export AI chats"
    },
    "settings": {
        "general": {
            "title": "General Settings",
            "backgroundColor": "Background Color"
        }
    }
}
```

Access them using dot notation: `t('header.title')`, `t('settings.general.backgroundColor')`

## Language Selector Component

The `LanguageSelector` component provides a dropdown menu for users to change the language:

-   Located in the header, before the theme toggle
-   Displays current language in native script
-   Persists selection to localStorage
-   Automatically detects browser language on first visit
-   Falls back to English if browser language is not supported

## Adding New Translations

To add translations to a new component:

1. Import the `useTranslation` hook:

```tsx
import { useTranslation } from "react-i18next";
```

2. Use the hook in your component:

```tsx
const { t } = useTranslation();
```

3. Replace hardcoded strings with translation keys:

```tsx
// Before
<button>Save</button>

// After
<button>{t('dialog.save')}</button>
```

4. Add the translation key to all language files in `lib/i18n/locales/`

## Adding a New Language

To add a new language:

1. Create a new JSON file in `lib/i18n/locales/` (e.g., `sv.json` for Swedish)
2. Copy the structure from `en.json` and translate all values
3. Import and add it to `lib/i18n/config.ts`:

```typescript
import sv from "./locales/sv.json";

export const resources = {
    // ... existing languages
    sv: { translation: sv },
} as const;
```

4. Add the language to the `languages` array in `components/LanguageSelector.tsx`:

```typescript
const languages: Language[] = [
    // ... existing languages
    { code: "sv", name: "Swedish", nativeName: "Svenska" },
];
```

## Language Detection

The app uses the following priority for language selection:

1. User's stored preference in localStorage (`app-language`)
2. Browser's language setting
3. Fallback to English

## RTL Support

Arabic is configured with proper RTL (right-to-left) text support. The translation keys and values use native Arabic script.

## Best Practices

1. **Keep keys organized**: Group related translations under common parent keys
2. **Use descriptive keys**: Make keys self-explanatory (e.g., `settings.general.backgroundColor`)
3. **Maintain consistency**: Use the same key structure across all language files
4. **Test all languages**: Ensure UI doesn't break with longer translations
5. **Native speakers**: Have translations reviewed by native speakers when possible

## Dependencies

-   `react-i18next`: ^15.x
-   `i18next`: ^24.x

## Configuration Details

The i18n configuration (`lib/i18n/config.ts`) includes:

-   **Automatic language detection**: Checks localStorage, then browser language
-   **Fallback language**: English (en)
-   **No escaping**: HTML content is not escaped (interpolation.escapeValue: false)
-   **Lazy loading**: All translations are loaded upfront for optimal performance

## Future Improvements

Potential enhancements for the i18n system:

1. Add more languages based on user demand
2. Implement lazy loading for translation files
3. Add translation management UI for easy updates
4. Implement pluralization rules for languages that need it
5. Add context-aware translations
6. Implement translation namespaces for better organization
7. Add automated translation testing
8. Create a translation contribution guide for the community

## Troubleshooting

### Translations not appearing

1. Check that the translation key exists in the language file
2. Verify the i18n config is imported in `main.tsx`
3. Check browser console for i18n errors
4. Ensure the `useTranslation` hook is used correctly

### Language not changing

1. Check localStorage for the `app-language` key
2. Clear browser cache and localStorage
3. Verify the language code exists in `resources`
4. Check browser console for errors

### Missing translations

If a translation key is missing, i18next will:

1. Display the key itself (e.g., "header.title")
2. Fall back to the English translation if available
3. Log a warning in the console (in development mode)

## Support

For issues or questions about i18n implementation, please:

1. Check this documentation
2. Review the i18next documentation: https://react.i18next.com/
3. Open an issue on GitHub with the `i18n` label
