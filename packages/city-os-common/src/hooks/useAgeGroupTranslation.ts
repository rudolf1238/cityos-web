import { useCallback } from 'react';

import { ageGroup } from '../libs/constants';
import useCommonTranslation from './useCommonTranslation';
import type { AgeGroup } from '../libs/schema';

interface UseAgeGroupTranslationResponse
  extends Omit<ReturnType<typeof useCommonTranslation>, 't'> {
  tAgeGroup: (AgeGroup: AgeGroup) => string;
}

const useAgeGroupTranslation = (): UseAgeGroupTranslationResponse => {
  const { t, ...methods } = useCommonTranslation('common');

  const tAgeGroup = useCallback(
    (type: AgeGroup) => {
      const mapping: Record<AgeGroup, string> = {
        [ageGroup.CHILD]: t('Child'),
        [ageGroup.YOUTH]: t('Youth'),
        [ageGroup.ADULT]: t('Adult'),
        [ageGroup.SENIOR]: t('Senior'),
      };
      return mapping[type];
    },
    [t],
  );

  return {
    ...methods,
    tAgeGroup,
  };
};

export default useAgeGroupTranslation;
