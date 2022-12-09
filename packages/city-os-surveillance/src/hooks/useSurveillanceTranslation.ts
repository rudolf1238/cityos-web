import type { UseTranslationOptions } from 'react-i18next';

import useTranslation from 'city-os-common/hooks/useTranslation';
import type { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import type {
  SurveillanceNamespace,
  SurveillanceResources,
} from '../modules/I18nSurveillanceProvider';

export default function useSurveillanceTranslation(
  ns?: SurveillanceNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<SurveillanceNamespace, SurveillanceResources> {
  return useTranslation(ns, options);
}
