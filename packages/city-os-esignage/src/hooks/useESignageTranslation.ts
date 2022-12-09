import { UseTranslationOptions } from 'react-i18next';

import useTranslation, { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import { ESignageNamespace, ESignageResources } from '../modules/I18nESignageProvider';

export default function useESignageTranslation(
  ns?: ESignageNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<ESignageNamespace, ESignageResources> {
  return useTranslation(ns, options);
}
