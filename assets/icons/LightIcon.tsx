import Svg, { Path } from 'react-native-svg';

interface VectorIconProps {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
}

export const LightIcon = ({
  width = 13,
  height = 12,
  stroke = '#FFFFFF',
  strokeWidth = 0.7,
}: VectorIconProps) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 13 12" fill="none">
      <Path
        d="M6.34997 0.349609V0.907812M12.35 5.93164H11.75M0.949975 5.93164H0.349976M10.592 1.98403L10.1678 2.37868M2.53217 2.37924L2.10797 1.98459M7.86017 10.0099C8.46617 9.82734 8.70977 9.311 8.77817 8.79187C8.79857 8.63669 8.66117 8.50774 8.49317 8.50774H4.23617C4.19515 8.50714 4.15445 8.51464 4.11677 8.52976C4.0791 8.54487 4.0453 8.56726 4.01762 8.59544C3.98994 8.62362 3.96901 8.65695 3.95621 8.69321C3.94341 8.72948 3.93904 8.76787 3.94337 8.80582C4.01057 9.32384 4.17977 9.70286 4.82177 10.0099M7.86017 10.0099H4.82177M7.86017 10.0099C7.78757 11.0956 7.45037 11.5254 6.35417 11.5131C5.18177 11.5332 4.91177 11.0018 4.82177 10.0099"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
