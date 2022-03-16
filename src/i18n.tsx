import LanguageDetector from "i18next-browser-languagedetector";
import i18n from "i18next";
import English from "../public/locales/English.json";
import Chinese from "../public/locales/Chinese.json";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      English: {
        translation: English,
      },
      Chinese: {
        translation: Chinese,
      },
    },
    fallbackLng: "English",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });
