import type { UseTranslationOptions } from 'react-i18next';

import useTranslation from 'city-os-common/hooks/useTranslation';
import type { UseTranslationResponse } from 'city-os-common/hooks/useTranslation';

import type { EventsNamespace, EventsResources } from '../modules/I18nEventsProvider';

export default function useEventsTranslation(
  ns?: EventsNamespace,
  options?: UseTranslationOptions,
): UseTranslationResponse<EventsNamespace, EventsResources> {
  return useTranslation(ns, options);
}
