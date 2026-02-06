import { zhCN } from './zh-CN';
import { enUS } from './en-US';

export const resources = {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
} as const;

export type TranslationKeys = typeof enUS;

export type LanguageCode = 'zh-CN' | 'en-US';

export type Language = {
  code: LanguageCode;
  label: string;
};

export const languages: Language[] = [
  { code: 'en-US', label: 'English' },
  { code: 'zh-CN', label: '简体中文' },
];

export { zhCN, enUS };

