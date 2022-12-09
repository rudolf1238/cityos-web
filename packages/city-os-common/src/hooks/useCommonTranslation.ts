import type { UseTranslationOptions } from 'react-i18next';

import useTranslation from './useTranslation';
import type { CommonNamespace, CommonResources } from '../libs/i18n';
import type { UseTranslationResponse } from './useTranslation';

export default function useCommonTranslation(
  ns?: CommonNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<CommonNamespace, CommonResources> {
  return useTranslation(ns, options);
}
