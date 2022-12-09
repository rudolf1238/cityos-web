import type { UseTranslationOptions } from 'react-i18next';

import useTranslation from 'city-os-common/hooks/useTranslation';
import type { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import type { MapNamespace, MapResources } from '../modules/I18nMapProvider';

export default function useMapTranslation(
  ns?: MapNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<MapNamespace, MapResources> {
  return useTranslation(ns, options);
}
