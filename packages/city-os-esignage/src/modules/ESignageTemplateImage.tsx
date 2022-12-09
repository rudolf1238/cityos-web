import { useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, memo } from 'react';

import Image from 'next/image';

import { ESignageTemplateSize, ESignageTemplateSizeType, ESignageTemplateType } from '../libs/type';

import Template_A_Dark_Img from '../assets/img/template_type/template-A-dark.png';
import Template_A_Light_Img from '../assets/img/template_type/template-A-light.png';
import Template_B_Dark_Img from '../assets/img/template_type/template-B-dark.png';
import Template_B_Light_Img from '../assets/img/template_type/template-B-light.png';
import Template_C_Dark_Img from '../assets/img/template_type/template-C-dark.png';
import Template_C_Light_Img from '../assets/img/template_type/template-C-light.png';
import Template_D_Dark_Img from '../assets/img/template_type/template-D-dark.png';
import Template_D_Light_Img from '../assets/img/template_type/template-D-light.png';
import Template_E_Dark_Img from '../assets/img/template_type/template-E-dark.png';
import Template_E_Light_Img from '../assets/img/template_type/template-E-light.png';
import Template_F_Dark_Img from '../assets/img/template_type/template-F-dark.png';
import Template_F_Light_Img from '../assets/img/template_type/template-F-light.png';
import Template_G_Dark_Img from '../assets/img/template_type/template-G-dark.png';
import Template_G_Light_Img from '../assets/img/template_type/template-G-light.png';
import Template_H_Dark_Img from '../assets/img/template_type/template-H-dark.png';
import Template_H_Light_Img from '../assets/img/template_type/template-H-light.png';
import Template_I_Dark_Img from '../assets/img/template_type/template-I-dark.png';
import Template_I_Light_Img from '../assets/img/template_type/template-I-light.png';
import Template_J_Dark_Img from '../assets/img/template_type/template-J-dark.png';
import Template_J_Light_Img from '../assets/img/template_type/template-J-light.png';
import Template_K_Dark_Img from '../assets/img/template_type/template-K-dark.png';
import Template_K_Light_Img from '../assets/img/template_type/template-K-light.png';
import Template_L_Dark_Img from '../assets/img/template_type/template-L-dark.png';
import Template_L_Light_Img from '../assets/img/template_type/template-L-light.png';

interface ESignageTemplateImageProps<T extends ESignageTemplateType> {
  type: T;
  size: ESignageTemplateSizeType<T>;
}

const eSignageTemplateImages: Record<
  'light' | 'dark',
  {
    [Type in ESignageTemplateType]: Record<ESignageTemplateSizeType<Type>, StaticImageData>;
  }
> = {
  light: {
    [ESignageTemplateType.TYPE_A_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_A_Light_Img,
    },
    [ESignageTemplateType.TYPE_B_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_B_Light_Img,
    },
    [ESignageTemplateType.TYPE_C_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_C_Light_Img,
    },
    [ESignageTemplateType.TYPE_D_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_D_Light_Img,
    },
    [ESignageTemplateType.TYPE_E_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_E_Light_Img,
    },
    [ESignageTemplateType.TYPE_F_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_F_Light_Img,
    },
    [ESignageTemplateType.TYPE_G_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_G_Light_Img,
    },
    [ESignageTemplateType.TYPE_H_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_H_Light_Img,
    },
    [ESignageTemplateType.TYPE_I_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_I_Light_Img,
    },
    [ESignageTemplateType.TYPE_J_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_J_Light_Img,
    },
    [ESignageTemplateType.TYPE_K_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_K_Light_Img,
    },
    [ESignageTemplateType.TYPE_L_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_L_Light_Img,
    },
  },
  dark: {
    [ESignageTemplateType.TYPE_A_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_A_Dark_Img,
    },
    [ESignageTemplateType.TYPE_B_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_B_Dark_Img,
    },
    [ESignageTemplateType.TYPE_C_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_C_Dark_Img,
    },
    [ESignageTemplateType.TYPE_D_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_D_Dark_Img,
    },
    [ESignageTemplateType.TYPE_E_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_E_Dark_Img,
    },
    [ESignageTemplateType.TYPE_F_1080X1920]: {
      [ESignageTemplateSize.DEFAULT]: Template_F_Dark_Img,
    },
    [ESignageTemplateType.TYPE_G_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_G_Dark_Img,
    },
    [ESignageTemplateType.TYPE_H_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_H_Dark_Img,
    },
    [ESignageTemplateType.TYPE_I_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_I_Dark_Img,
    },
    [ESignageTemplateType.TYPE_J_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_J_Dark_Img,
    },
    [ESignageTemplateType.TYPE_K_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_K_Dark_Img,
    },
    [ESignageTemplateType.TYPE_L_1920X1080]: {
      [ESignageTemplateSize.DEFAULT]: Template_L_Dark_Img,
    },
  },
};

const ESignageTemplateImage = <Type extends ESignageTemplateType>({
  type,
  size,
}: ESignageTemplateImageProps<Type>): ReturnType<
  VoidFunctionComponent<ESignageTemplateImageProps<Type>>
> => {
  const theme = useTheme();
  const lightImages = eSignageTemplateImages.light[type] as Record<
    ESignageTemplateSizeType<Type>,
    StaticImageData
  >;
  const darkImages = eSignageTemplateImages.dark[type] as Record<
    ESignageTemplateSizeType<Type>,
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

export default memo(ESignageTemplateImage);
