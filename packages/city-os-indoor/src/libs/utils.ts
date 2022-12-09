import type { Attribute } from 'city-os-common/libs/schema';

import { Address } from './type';
import { Language } from './schema';

export const getAttrByKey = (attributes: Attribute[], key: string): Attribute =>
  attributes.filter((value: Attribute) => value.key === key)[0] || null;

export const getDeviceAddress = (addressList: Address[], language?: Language) => {
  const langTag = language === Language.en_US ? 'en' : 'zh-tw';
  const langIndex = addressList.map((item) => item.language).indexOf(langTag);
  return addressList[langIndex === -1 ? 0 : langIndex].detail?.formattedAddress;
};
