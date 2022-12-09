import { makeStyles, useTheme } from '@material-ui/core/styles';
import React, { VoidFunctionComponent, useRef, useState } from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import Group from '@visx/group/lib/Group';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import Pie from '@visx/shape/lib/shapes/Pie';

import { PieChart, PieChartPoint } from '../../../libs/type';

const useStyles = makeStyles((theme) => ({
  labels: {
    display: 'flex',
    gap: theme.spacing(1),
    alignItems: 'center',
    padding: theme.spacing(1),
    maxWidth: theme.spacing(20),
  },

  bullet: {
    minWidth: 8,
    height: 8,
    borderRadius: '50%',
  },

  label: {
    textOverflow: 'ellipsis',
  },
}));
interface EnergyConsumptionPieChartProps {
  data: PieChart;
}

const EnergyConsumptionPieChart: VoidFunctionComponent<EnergyConsumptionPieChartProps> = ({
  data,
}: EnergyConsumptionPieChartProps) => {
  const theme = useTheme();
  const classes = useStyles();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<PieChartPoint | null>(null);

  return (
    <ParentSize>
      {({ width, height }) => {
        const innerWidth = Math.max(0, width);
        const innerHeight = Math.max(0, height);
        const radius = Math.min(innerWidth, innerHeight) / 2;
        const centerY = innerHeight / 2;
        const centerX = innerWidth / 2;

        return (
          <svg width={width} height={height}>
            <Group top={centerY} left={centerX}>
              <Pie data={data} pieValue={(d) => d.value} outerRadius={radius} pieSort={null}>
                {(pie) =>
                  pie.arcs.map((arc) => {
                    const arcPath = pie.path(arc);
                    const arcFill = arc.data.color || theme.palette.gadget.reserved;

                    return (
                      <Tooltip
                        key={arc.data.key}
                        title={
                          <div className={classes.labels}>
                            <div
                              className={classes.bullet}
                              style={{ backgroundColor: arc.data.color }}
                            />
                            <Typography variant="overline" className={classes.label} noWrap>
                              {arc.data.key.toUpperCase()}
                            </Typography>
                            <Typography variant="overline" className={classes.label}>
                              {`${Math.round(arc.data.value)}kW`}
                            </Typography>
                          </div>
                        }
                        open={active?.key === arc.data.key}
                        placement="left"
                        PopperProps={{
                          ref: containerRef,
                        }}
                      >
                        <g
                          onMouseEnter={() => setActive(arc.data)}
                          onMouseLeave={() => setActive(null)}
                        >
                          <path d={arcPath || undefined} fill={arcFill} />
                        </g>
                      </Tooltip>
                    );
                  })
                }
              </Pie>
            </Group>
          </svg>
        );
      }}
    </ParentSize>
  );
};

export default EnergyConsumptionPieChart;
