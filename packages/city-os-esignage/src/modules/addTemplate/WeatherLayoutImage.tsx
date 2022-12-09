import { useTheme } from '@material-ui/core/styles';
import Image from 'next/image';
import React, { VoidFunctionComponent, memo } from 'react';

import { WeatherLayoutSize, WeatherLayoutSizeType, WeatherLayoutType } from '../../libs/type';
import WeatherLayout_1_Img from '../../assets/img/weather_layout/w_temp1.jpg';
import WeatherLayout_2_Img from '../../assets/img/weather_layout/w_temp2.jpg';
import WeatherLayout_3_Img from '../../assets/img/weather_layout/w_temp3.jpg';
import WeatherLayout_4_Img from '../../assets/img/weather_layout/w_temp4.jpg';
import WeatherLayout_5_Img from '../../assets/img/weather_layout/w_temp5.jpg';

interface WeatherLayoutImageProps<T extends WeatherLayoutType> {
  type: T;
  size: WeatherLayoutSizeType<T>;
}

const weatherLayoutImages: Record<
  'light' | 'dark',
  {
    [Type in WeatherLayoutType]: Record<WeatherLayoutSizeType<Type>, StaticImageData>;
  }
> = {
  light: {
    [WeatherLayoutType.TYPE_1_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_1_Img,
    },
    [WeatherLayoutType.TYPE_2_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_2_Img,
    },
    [WeatherLayoutType.TYPE_3_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_3_Img,
    },
    [WeatherLayoutType.TYPE_4_640X720]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_4_Img,
    },
    [WeatherLayoutType.TYPE_5_1080X1750]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_5_Img,
    },
  },
  dark: {
    [WeatherLayoutType.TYPE_1_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_1_Img,
    },
    [WeatherLayoutType.TYPE_2_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_2_Img,
    },
    [WeatherLayoutType.TYPE_3_640X360]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_3_Img,
    },
    [WeatherLayoutType.TYPE_4_640X720]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_4_Img,
    },
    [WeatherLayoutType.TYPE_5_1080X1750]: {
      [WeatherLayoutSize.DEFAULT]: WeatherLayout_5_Img,
    },
  },
};

const WeatherLayoutImage = <Type extends WeatherLayoutType>({
  type,
  size,
}: WeatherLayoutImageProps<Type>): ReturnType<
  VoidFunctionComponent<WeatherLayoutImageProps<Type>>
> => {
  const theme = useTheme();
  const lightImages = weatherLayoutImages.light[type] as Record<
    WeatherLayoutSizeType<Type>,
    StaticImageData
  >;
  const darkImages = weatherLayoutImages.dark[type] as Record<
    WeatherLayoutSizeType<Type>,
    StaticImageData
  >;

  return (
    <Image
      layout="fill"
      objectFit="contain"
      src={theme.palette.type === 'light' ? lightImages[size] : darkImages[size]}
    />
  );
};

export default memo(WeatherLayoutImage);
