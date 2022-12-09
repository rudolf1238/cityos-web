import { useMemo } from 'react';

import useGetGadgetInfoList from './useGetGadgetBasicInfoList';
import type { GadgetType } from '../libs/type';

const useGetGadgetBasicInfo = (selectedType: GadgetType) => {
  const gadgetInfoList = useGetGadgetInfoList();

  const gadget = useMemo(
    () => gadgetInfoList.find(({ type }) => type === selectedType),
    [gadgetInfoList, selectedType],
  );

  return gadget;
};

export default useGetGadgetBasicInfo;
