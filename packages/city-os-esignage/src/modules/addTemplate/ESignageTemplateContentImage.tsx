import React, {
  VoidFunctionComponent,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { ESignageTemplateType, TemplateContent } from '../../libs/type';

// import TemplateADarkSVG from '../../assets/svg/template_type/template-A-dark.svg';
import TemplateALightSVG from '../../assets/svg/template_type/template-A-light.svg';
// import TemplateBDarkSVG from '../../assets/svg/template_type/template-B-dark.svg';
import TemplateBLightSVG from '../../assets/svg/template_type/template-B-light.svg';
// import TemplateCDarkSVG from '../../assets/svg/template_type/template-C-dark.svg';
import TemplateCLightSVG from '../../assets/svg/template_type/template-C-light.svg';
// import TemplateDDarkSVG from '../../assets/svg/template_type/template-D-dark.svg';
import TemplateDLightSVG from '../../assets/svg/template_type/template-D-light.svg';
// import TemplateEDarkSVG from '../../assets/svg/template_type/template-E-dark.svg';
import TemplateELightSVG from '../../assets/svg/template_type/template-E-light.svg';
// import TemplateFDarkSVG from '../../assets/svg/template_type/template-F-dark.svg';
import TemplateFLightSVG from '../../assets/svg/template_type/template-F-light.svg';
// import TemplateGDarkSVG from '../../assets/svg/template_type/template-G-dark.svg';
import TemplateGLightSVG from '../../assets/svg/template_type/template-G-light.svg';
// import TemplateHDarkSVG from '../../assets/svg/template_type/template-H-dark.svg';
import TemplateHLightSVG from '../../assets/svg/template_type/template-H-light.svg';
// import TemplateIDarkSVG from '../../assets/svg/template_type/template-I-dark.svg';
import TemplateILightSVG from '../../assets/svg/template_type/template-I-light.svg';
// import TemplateJDarkSVG from '../../assets/svg/template_type/template-J-dark.svg';
import TemplateJLightSVG from '../../assets/svg/template_type/template-J-light.svg';
// import TemplateKDarkSVG from '../../assets/svg/template_type/template-K-dark.svg';
import TemplateKLightSVG from '../../assets/svg/template_type/template-K-light.svg';
// import TemplateLDarkSVG from '../../assets/svg/template_type/template-L-dark.svg';
import TemplateLLightSVG from '../../assets/svg/template_type/template-L-light.svg';

interface ESignageContentImageProps<T extends ESignageTemplateType> {
  type: T;
  rectId?: string | undefined;
  content?: TemplateContent | undefined;
  onChangeType?: (
    contentType: string,
    selectedRectId: string,
    /* templateContent: TemplateContent | undefined, */
  ) => void | null | undefined;
}

const ESignageTemplateContentImage = <Type extends ESignageTemplateType>(
  eSignageContentImagePropsObject: ESignageContentImageProps<Type>,
): ReturnType<VoidFunctionComponent<ESignageContentImageProps<Type>>> => {
  const { type, rectId, content, onChangeType } = eSignageContentImagePropsObject;

  // const theme = useTheme();
  const previousSelectedRectIdRef = useRef<EventTarget & SVGRectElement>();
  const selectedRectIdRef = useRef('');
  const rect1Ref = useRef<SVGRectElement | null>(null);
  const rect2Ref = useRef<SVGRectElement | null>(null);
  const rect3Ref = useRef<SVGRectElement | null>(null);
  const rect4Ref = useRef<SVGRectElement | null>(null);
  const rect5Ref = useRef<SVGRectElement | null>(null);
  const contentTypeRef = useRef('');
  const [init, setInit] = useState(true);

  const handleClick = useCallback(
    (contentTypeLocal: string, selectedRectId: string) => {
      // console.log(contentTypeLocal);

      contentTypeRef.current = contentTypeLocal;

      if (onChangeType !== undefined) {
        onChangeType(contentTypeLocal, selectedRectId);
      }
    },
    [onChangeType],
  );
  const handleMouseEnter = useCallback((e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (e !== undefined) {
      if (
        selectedRectIdRef !== undefined &&
        (selectedRectIdRef.current.trim() === '' ||
          selectedRectIdRef.current.trim() !== e.currentTarget.id)
      ) {
        e.currentTarget.style.opacity = '0.2';
        e.currentTarget.style.cursor = 'pointer';
      }
    }
  }, []);
  const handleMouseLeave = useCallback((e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (e !== undefined) {
      if (
        selectedRectIdRef !== undefined &&
        (selectedRectIdRef.current.trim() === '' ||
          selectedRectIdRef.current.trim() !== e.currentTarget.id)
      ) {
        e.currentTarget.style.opacity = '0';
        e.currentTarget.style.cursor = '';
      }
    }
  }, []);
  const handleMouseDown = useCallback((e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
    if (e !== undefined) {
      if (selectedRectIdRef !== undefined && selectedRectIdRef.current !== e.currentTarget.id) {
        if (
          previousSelectedRectIdRef !== undefined &&
          previousSelectedRectIdRef.current !== undefined
        ) {
          previousSelectedRectIdRef.current.style.opacity = '0';
          previousSelectedRectIdRef.current.style.cursor = '';
        }
        e.currentTarget.style.opacity = '0.5';
        previousSelectedRectIdRef.current = e.currentTarget;
        selectedRectIdRef.current = e.currentTarget.id;
      }
    }
  }, []);

  const ESignageContentImageComponent = useCallback(
    (typeLocal: ESignageTemplateType) => {
      switch (typeLocal) {
        case ESignageTemplateType.TYPE_A_1080X1920:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateALightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="1.604"
                  width="173.851"
                  height="154.984"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="175.454"
                  y="2.578"
                  width="99.466"
                  height="154.011"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="158.727"
                  width="275.988"
                  height="153.476"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content2', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect4"
                  ref={rect4Ref}
                  y="314.877"
                  width="277"
                  height="153.123"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_B_1080X1920:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateBLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="2.578"
                  width="273.851"
                  height="152.406"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  y="157.658"
                  width="274.386"
                  height="153.476"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="313.808"
                  width="274.92"
                  height="154.192"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_C_1080X1920:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateCLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="2.578"
                  width="174.92"
                  height="153.476"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="175.988"
                  y="2.578"
                  width="97.862"
                  height="154.011"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  x="2.727"
                  y="158.192"
                  width="271.123"
                  height="309.808"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_D_1080X1920:
          return (
            // <div style={{ width: '277px', height: '468px'}}>
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateDLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="2.043"
                  width="173.851"
                  height="153.476"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="176.524"
                  y="1.604"
                  width="97.326"
                  height="153.914"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="157.658"
                  width="273.374"
                  height="153.476"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content2', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect4"
                  ref={rect4Ref}
                  y="315.412"
                  width="135.883"
                  height="152.588"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect5"
                  ref={rect5Ref}
                  x="138.557"
                  y="315.412"
                  width="134.225"
                  height="153.122"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_E_1080X1920:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateELightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="2.578"
                  width="274.385"
                  height="152.406"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  y="159.797"
                  width="274.385"
                  height="150.802"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="314.877"
                  width="136.417"
                  height="153.123"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect4"
                  ref={rect4Ref}
                  x="138.556"
                  y="314.877"
                  width="136.364"
                  height="153.123"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_F_1080X1920:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateFLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="3.112"
                  width="173.315"
                  height="151.872"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="175.989"
                  y="3.647"
                  width="98.931"
                  height="152.407"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="158.192"
                  width="274.385"
                  height="152.679"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect4"
                  ref={rect4Ref}
                  y="313.808"
                  width="135.882"
                  height="154.192"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect5"
                  ref={rect5Ref}
                  x="139.091"
                  y="313.808"
                  width="136.363"
                  height="154.192"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content2', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_G_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateGLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="157.658"
                  width="274.385"
                  height="106.952"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  y="266.749"
                  width="274.385"
                  height="45.454"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_H_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateHLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="157.658"
                  width="274.92"
                  height="44.385"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  y="204.333"
                  width="274.667"
                  height="107"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_I_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateILightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="157.25"
                  width="137"
                  height="153.75"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="138.75"
                  y="157.25"
                  width="136.25"
                  height="154"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_J_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateJLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="157.667"
                  width="275"
                  height="108.333"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  y="266.5"
                  width="137.333"
                  height="45.167"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  x="138.667"
                  y="266.5"
                  width="136.334"
                  height="45.167"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_K_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateKLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="156.75"
                  width="136.75"
                  height="45.25"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Weather Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="138.75"
                  y="157"
                  width="137"
                  height="44.5"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  y="203.75"
                  width="275"
                  height="107.25"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        case ESignageTemplateType.TYPE_L_1920X1080:
          return (
            <div style={{ width: '277px', height: 'auto' }}>
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 277 468"
              >
                <TemplateLLightSVG />
                <rect
                  id="rect1"
                  ref={rect1Ref}
                  y="156.667"
                  width="137"
                  height="155.333"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Web Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect2"
                  ref={rect2Ref}
                  x="139"
                  y="157"
                  width="136.333"
                  height="76.333"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('Media Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
                <rect
                  id="rect3"
                  ref={rect3Ref}
                  x="138.667"
                  y="235.667"
                  width="136.333"
                  height="75.667"
                  href="#"
                  fill="#fff"
                  style={{ opacity: 0 }}
                  onClick={() => handleClick('IPCam Content', selectedRectIdRef.current)}
                  onMouseEnter={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseEnter(e);
                  }}
                  onMouseLeave={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseLeave(e);
                  }}
                  onMouseDown={(e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
                    handleMouseDown(e);
                  }}
                />
              </svg>
            </div>
          );
        default:
          return null;
      }
    },
    [handleClick, handleMouseDown, handleMouseEnter, handleMouseLeave],
  );

  useEffect(() => {
    if (init) {
      setInit(false);
      if (rectId !== undefined && rectId === 'rect1') {
        if (rect1Ref !== undefined && rect1Ref.current !== undefined) {
          const rect1 = rect1Ref.current as unknown as SVGRectElement;
          if (rect1 !== undefined && rect1 !== null) {
            rect1.style.opacity = '0.5';
            rect1.style.cursor = 'pointer';
            previousSelectedRectIdRef.current = rect1;
            selectedRectIdRef.current = 'rect1';

            if (onChangeType !== undefined)
              onChangeType(contentTypeRef.current, selectedRectIdRef.current /* , content */);
          }
        }
      }
      if (rectId !== undefined && rectId === 'rect2') {
        if (rect2Ref !== undefined && rect2Ref.current !== undefined) {
          const rect2 = rect2Ref.current as unknown as SVGRectElement;
          if (rect2 !== undefined && rect2 !== null) {
            rect2.style.opacity = '0.5';
            rect2.style.cursor = 'pointer';
            previousSelectedRectIdRef.current = rect2;
            selectedRectIdRef.current = 'rect2';

            if (onChangeType !== undefined)
              onChangeType(contentTypeRef.current, selectedRectIdRef.current /* , content */);
          }
        }
      }
      if (rectId !== undefined && rectId === 'rect3') {
        if (rect3Ref !== undefined && rect3Ref.current !== undefined) {
          const rect3 = rect3Ref.current as unknown as SVGRectElement;
          if (rect3 !== undefined && rect3 !== null) {
            rect3.style.opacity = '0.5';
            rect3.style.cursor = 'pointer';
            previousSelectedRectIdRef.current = rect3;
            selectedRectIdRef.current = 'rect3';

            if (onChangeType !== undefined)
              onChangeType(contentTypeRef.current, selectedRectIdRef.current /* , content */);
          }
        }
      }
      if (rectId !== undefined && rectId === 'rect4') {
        if (rect4Ref !== undefined && rect4Ref.current !== undefined) {
          const rect4 = rect4Ref.current as unknown as SVGRectElement;
          if (rect4 !== undefined && rect4 !== null) {
            rect4.style.opacity = '0.5';
            rect4.style.cursor = 'pointer';
            previousSelectedRectIdRef.current = rect4;
            selectedRectIdRef.current = 'rect4';

            if (onChangeType !== undefined)
              onChangeType(contentTypeRef.current, selectedRectIdRef.current /* , content */);
          }
        }
      }
      if (rectId !== undefined && rectId === 'rect5') {
        if (rect5Ref !== undefined && rect5Ref.current !== undefined) {
          const rect5 = rect5Ref.current as unknown as SVGRectElement;
          if (rect5 !== undefined && rect5 !== null) {
            rect5.style.opacity = '0.5';
            rect5.style.cursor = 'pointer';
            previousSelectedRectIdRef.current = rect5;
            selectedRectIdRef.current = 'rect5';

            if (onChangeType !== undefined)
              onChangeType(contentTypeRef.current, selectedRectIdRef.current /* , content */);
          }
        }
      }
    }
  }, [content, contentTypeRef, init, onChangeType, rectId]);

  return <div>{ESignageContentImageComponent(type)}</div>;
};

export default memo(ESignageTemplateContentImage);
