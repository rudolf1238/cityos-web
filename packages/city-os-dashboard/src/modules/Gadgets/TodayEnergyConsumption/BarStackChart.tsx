import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, {
  MouseEvent,
  TouchEvent,
  VoidFunctionComponent,
  memo,
  useCallback,
  useMemo,
} from 'react';

import Typography from '@material-ui/core/Typography';

import { Bar, BarStack, Line } from '@visx/shape';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { Text } from '@visx/text';
import { TickLabelProps } from '@visx/axis/lib/types';
import { TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { scaleBand, scaleLinear } from '@visx/scale';

import MemoAxisBottom from '../../visx/MemoAxisBottom';
import MemoAxisLeft from '../../visx/MemoAxisLeft';
import MemoGrid from '../../visx/MemoGrid';

const numTicksRows = 4;

const getTicks = (length: number, callback: (i: number) => number) =>
  Array.from({ length }, (_, i) => callback(i));

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },

  svg: {
    overflow: 'visible',
  },

  bottomTicks: {
    transform: `translateX(${theme.spacing(0.5)}px)`,
    fontWeight: 'normal',
  },

  tooltip: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5, 2),
    ...theme.overrides?.MuiTooltip?.tooltip,
  },

  tooltipItem: {
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    color: theme.palette.primary.contrastText,

    // '& > span:last-of-type': {
    //   marginLeft: 'auto',
    // },
  },

  tooltipContent: {
    textTransform: 'none',
  },

  squareIcon: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
}));

export interface Unit {
  hour: number;
  label: string;
  content: {
    label: string;
    value: number;
    color: string;
  }[];
}

type FlatUnit = Record<string, number>;

type TooltipData = Omit<Unit, 'hour'>;

export interface BarStackChartProps {
  data: Unit[];
}

const BarStackChart: VoidFunctionComponent<BarStackChartProps> = ({ data }: BarStackChartProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<TooltipData>();

  const defaultMargin = {
    top: 20,
    left: 36,
    bottom: 36,
    right: 20,
  };

  const gridStyle = useMemo(
    () => ({
      columnLineStyle: { strokeWidth: 0 },
      rowLineStyle: {
        stroke: theme.palette.gadget.contrastText,
        strokeOpacity: 0.15,
      },
    }),
    [theme.palette.gadget.contrastText],
  );

  // 取得要呈現的數據的 key & 顏色
  const keys = useMemo(() => (data.length > 0 ? data[0].content.map((d) => d.label) : []), [data]);
  const getColor = useCallback(
    (key: string, _number: number) => data[0].content.find((d) => d.label === key)?.color || '',
    [data],
  );

  // 取得數據加總的最大值，作為 Y 軸的最大值
  const maxValue = useMemo(() => {
    return data.reduce((acc, cur) => {
      const sum = cur.content.reduce((cAcc, cCur) => cAcc + cCur.value, 0);
      return Math.max(acc, sum);
    }, 300);
  }, [data]);

  // 取得數據加總的最小值，作為 Y 軸的最小值
  const minValue = useMemo(() => {
    return data.reduce((acc, cur) => {
      const sum = cur.content.reduce((cAcc, cCur) => cAcc + cCur.value, 0);
      return Math.min(acc, sum);
    }, 0);
  }, [data]);

  // 生成 Y 軸的刻度
  const rowTickValues = useMemo(
    () => getTicks(numTicksRows + 1, (i) => (maxValue / numTicksRows) * i),
    [maxValue],
  );

  // 生成 X 軸的刻度
  const verticalTicks = useMemo(
    () => getTicks(numTicksRows / 2 + 1, (i) => (maxValue / (numTicksRows / 2)) * i),
    [maxValue],
  );

  // X 軸要呈現的字串
  const valueTickParser = useCallback((value: number) => value.toString(), []);

  // X 軸的刻度樣式
  const valueTickLabelProps = useCallback(
    () => ({
      dx: theme.spacing(-0.2),
      dy: theme.spacing(0.5),
      textAnchor: 'end' as const,
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.grey[300],
    }),
    [theme],
  );

  // X 軸要呈現的字串
  const timeTickParser = useCallback(
    (time: number) => (time > 9 ? time.toString() : `0${time}`),
    [],
  );

  // X 軸的刻度樣式
  const timeTickLabelProps: TickLabelProps<number> = useCallback(
    (_, _index) => ({
      textAnchor: 'middle' as const,
      dominantBaseline: 'middle',
      fontSize: theme.typography.caption.fontSize,
      fill: theme.palette.grey[300],
    }),
    [theme],
  );

  // 攤平數據，給 visx 使用
  const flatData = useMemo(() => {
    const res: FlatUnit[] = [];
    data.forEach((d) => {
      const temp: FlatUnit = { hour: d.hour };
      d.content.forEach((c) => {
        temp[c.label] = c.value;
      });
      res.push(temp);
    });
    return res;
  }, [data]);

  return (
    <ParentSize>
      {({ width, height }) => {
        // log.info({ width, height });

        // 計算圖表的寬高
        const innerWidth = Math.max(0, width - defaultMargin.left - defaultMargin.right);
        const innerHeight = Math.max(0, height - defaultMargin.top - defaultMargin.bottom);

        // 假如圖表的寬或高為 0，就不要 render
        if (innerHeight <= 0 || innerWidth <= 0) return null;

        // 計算 X 軸的刻度間距
        const axisXScale = scaleLinear<number>({
          domain: [0, 24],
          range: [0, innerWidth],
        });

        // 計算 Y 軸的刻度間距
        const axisYScale = scaleLinear<number>({
          domain: [maxValue, minValue],
          range: [0, innerHeight],
        });

        // 計算每個 bar 的寬度
        const dateScale = scaleBand<number>({
          domain: Array.from(Array(24).keys()),
          range: [0, innerWidth],
          padding: 0.2,
        });

        // 計算 bar 的 X 軸座標
        const getDate = (d: FlatUnit) => d.hour;

        const handleTooltip = (event: TouchEvent<SVGRectElement> | MouseEvent<SVGRectElement>) => {
          const { x } = localPoint(event) || { x: 0, y: 0 };

          const date = axisXScale.invert(x - defaultMargin.left);

          const index = Math.round(date);
          const datum = index >= 0 && index < flatData.length ? data[index] : undefined;

          const barStackX = dateScale(index) || 0;

          const showData = datum
            ? {
                label: datum.label,
                content: datum.content.map((d) => ({
                  label: d.label,
                  value: d.value,
                  color: d.color,
                })),
              }
            : undefined;

          showTooltip({
            tooltipData: showData,
            tooltipLeft: barStackX + 2,
            tooltipTop: 0,
          });
        };

        return (
          <div className={classes.root}>
            <svg width={width} height={height} className={classes.svg}>
              <Group top={6} left={6}>
                <Text fill={theme.palette.grey[300]}>kWh</Text>
              </Group>
              <Group left={defaultMargin.left} top={defaultMargin.top}>
                {tooltipData && (
                  <Line
                    from={{ x: tooltipLeft, y: 0 }}
                    to={{ x: tooltipLeft, y: innerHeight }}
                    stroke={theme.palette.background.miniTab}
                    strokeWidth={1}
                    pointerEvents="none"
                  />
                )}
                <MemoGrid
                  xScale={axisXScale}
                  yScale={axisYScale}
                  width={innerWidth}
                  height={innerHeight}
                  columnTickValues={[
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
                    22, 23,
                  ]}
                  rowTickValues={rowTickValues}
                  columnLineStyle={gridStyle.columnLineStyle}
                  rowLineStyle={gridStyle.rowLineStyle}
                />
                <BarStack<FlatUnit, string>
                  data={flatData}
                  keys={keys}
                  x={getDate}
                  xScale={dateScale}
                  yScale={axisYScale}
                  color={getColor}
                >
                  {(barStacks) => {
                    return barStacks.map((barStack) =>
                      barStack.bars.map((bar) => (
                        <rect
                          key={`bar-stack-${barStack.index}-${bar.index}`}
                          x={bar.x}
                          y={bar.y}
                          height={bar.height}
                          width={4}
                          fill={bar.color}
                        />
                      )),
                    );
                  }}
                </BarStack>
                <MemoAxisLeft
                  hideTicks
                  hideAxisLine
                  scale={axisYScale}
                  tickValues={verticalTicks}
                  tickFormat={valueTickParser}
                  tickLabelProps={valueTickLabelProps}
                />
                <MemoAxisBottom
                  hideTicks
                  top={innerHeight}
                  scale={axisXScale}
                  tickFormat={timeTickParser}
                  tickValues={[0, 4, 8, 12, 16, 20, 24]}
                  strokeWidth={0}
                  tickLabelProps={timeTickLabelProps}
                  tickClassName={classes.bottomTicks}
                />
                <Bar
                  width={innerWidth}
                  height={innerHeight}
                  fill="transparent"
                  rx={14}
                  onTouchStart={handleTooltip}
                  onTouchMove={handleTooltip}
                  onMouseMove={handleTooltip}
                  onMouseLeave={hideTooltip}
                />
              </Group>
            </svg>
            {tooltipData && (
              <TooltipWithBounds
                top={tooltipTop + defaultMargin.top}
                left={tooltipLeft + defaultMargin.left}
                className={classes.tooltip}
                applyPositionStyle
                unstyled
              >
                <Typography
                  variant="overline"
                  style={{
                    color: '#fff',
                  }}
                >
                  {tooltipData.label}
                </Typography>
                {tooltipData.content.map((d) => (
                  <div className={classes.tooltipItem}>
                    <div
                      className={classes.squareIcon}
                      style={{
                        backgroundColor: d.color,
                      }}
                    />
                    <Typography
                      variant="overline"
                      className={classes.tooltipContent}
                      align="left"
                      style={{ width: 120 }}
                      noWrap
                    >
                      {d.label}
                    </Typography>
                    <Typography variant="overline">{d.value}</Typography>
                  </div>
                ))}
              </TooltipWithBounds>
            )}
          </div>
        );
      }}
    </ParentSize>
  );
};

export default memo(BarStackChart);
