import { COLORS } from 'theme'

export const colors = [COLORS.darkSage, COLORS.sage]

// Typography
const letterSpacing = 'normal'
const fontSize = 10

// Layout
const padding = 8

// * Labels
const baseLabelStyles = {
  fontSize,
  letterSpacing,
  padding,
  fill: COLORS.midGray,
  stroke: 'transparent',
  strokeWidth: 0,
}

const centeredLabelStyles = { textAnchor: 'middle', ...baseLabelStyles }

// Strokes
const strokeLinecap = 'round'
const strokeLinejoin = 'round'

const chartTheme = {
  axis: {
    style: {
      axis: {
        // Axis lines
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 2,
        strokeLinecap,
        strokeLinejoin,
      },
      axisLabel: { ...centeredLabelStyles, padding, stroke: 'transparent' },
      grid: {
        fill: 'none',
        stroke: 'transparent',
      },
      tickLabels: { ...baseLabelStyles, fill: COLORS.midGray }, // Axis labels
    },
  },
  bar: {
    style: {
      data: {
        strokeWidth: 0,
      },
      labels: {
        ...baseLabelStyles,
        padding: 5,
        pointerEvent: 'none',
      },
    },
  },
  group: {
    colorScale: colors,
  },
  line: {
    style: {
      data: {
        strokeWidth: 2,
      },
      labels: { fill: 'transparent' },
    },
  },
  stack: {
    colorScale: colors,
  },
  voronoi: {
    style: {
      data: {
        fill: 'transparent',
        stroke: 'transparent',
        strokeWidth: 0,
      },
      labels: {
        ...baseLabelStyles,
        padding: 5,
        pointerEvents: 'none',
      },
    },
  },
}

export default chartTheme
