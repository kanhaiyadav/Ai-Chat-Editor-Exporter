import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import it from "./locales/it.json";
import nl from "./locales/nl.json";
import tr from "./locales/tr.json";
import pl from "./locales/pl.json";

export const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    zh: { translation: zh },
    ja: { translation: ja },
    ko: { translation: ko },
    pt: { translation: pt },
    ru: { translation: ru },
    ar: { translation: ar },
    hi: { translation: hi },
    it: { translation: it },
    nl: { translation: nl },
    tr: { translation: tr },
    pl: { translation: pl },
} as const;

// Get stored language or detect browser language
const getInitialLanguage = (): string => {
    const stored = localStorage.getItem("app-language");
    if (stored && Object.keys(resources).includes(stored)) {
        return stored;
    }

    const browserLang = navigator.language.split("-")[0];
    if (Object.keys(resources).includes(browserLang)) {
        return browserLang;
    }

    return "en";
};

i18n.use(initReactI18next).init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
