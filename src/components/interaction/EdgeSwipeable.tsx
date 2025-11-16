import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import { Swipeable, SwipeableProps } from 'react-native-gesture-handler';

export type EdgeSwipeableRef = Swipeable;

interface EdgeSwipeableProps extends Omit<SwipeableProps, 'renderRightActions' | 'onSwipeableOpen' | 'onSwipeableClose'> {
  /**
   * Ratio of the component width from the right edge where swipe can be initiated
   * @default 0.2 (20% of width from right edge)
   */
  activationEdgeRatio?: number;
  /**
   * Custom render function for right actions
   */
  renderRightActions?: SwipeableProps['renderRightActions'];
  /**
   * Callback fired when swipeable is opened
   */
  onSwipeableOpen?: SwipeableProps['onSwipeableOpen'];
  /**
   * Callback fired when swipeable is closed
   */
  onSwipeableClose?: SwipeableProps['onSwipeableClose'];
}

const DEFAULT_ACTIVATION_EDGE_RATIO = 0.2;

const EdgeSwipeable = forwardRef<EdgeSwipeableRef, EdgeSwipeableProps>(
  (
    {
      children,
      activationEdgeRatio = DEFAULT_ACTIVATION_EDGE_RATIO,
      enabled = true,
      renderRightActions,
      onSwipeableOpen,
      onSwipeableClose,
      ...rest
    },
    ref,
  ) => {
    const swipeRef = useRef<Swipeable | null>(null);
    const [layoutWidth, setLayoutWidth] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useImperativeHandle(
      ref,
      () => {
        // Return a proxy object that safely handles null
        return swipeRef.current as Swipeable;
      },
      [],
    );

    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width != null && width > 0) {
        setLayoutWidth(width);
      }
    }, []);

    const hitSlop = useMemo(() => {
      // Don't apply hitSlop if:
      // - Component hasn't been measured yet
      // - Swipeable is currently open
      // - Not enabled
      if (!layoutWidth || isOpen || !enabled) {
        return undefined;
      }

      // Clamp ratio between 0 and 1
      const clampedRatio = Math.min(Math.max(activationEdgeRatio, 0), 1);

      // Calculate how much to shrink the hit area from the left
      const shrinkLeft = layoutWidth * (1 - clampedRatio);

      return { left: -shrinkLeft };
    }, [activationEdgeRatio, layoutWidth, isOpen, enabled]);

    const handleOpen = useCallback<NonNullable<SwipeableProps['onSwipeableOpen']>>(
      (direction, swipeableInstance) => {
        setIsOpen(true);

        // Use provided instance or fallback to ref
        const instance = swipeableInstance || swipeRef.current;

        if (onSwipeableOpen && instance) {
          onSwipeableOpen(direction, instance);
        }
      },
      [onSwipeableOpen],
    );

    const handleClose = useCallback<NonNullable<SwipeableProps['onSwipeableClose']>>(
      (direction, swipeableInstance) => {
        setIsOpen(false);

        // Use provided instance or fallback to ref
        const instance = swipeableInstance || swipeRef.current;

        if (onSwipeableClose && instance) {
          onSwipeableClose(direction, instance);
        }
      },
      [onSwipeableClose],
    );

    return (
      <View onLayout={handleLayout} collapsable={false}>
        <Swipeable
          ref={swipeRef}
          enabled={enabled}
          hitSlop={hitSlop}
          renderRightActions={renderRightActions}
          onSwipeableOpen={handleOpen}
          onSwipeableClose={handleClose}
          overshootRight={false}
          overshootLeft={false}
          {...rest}
        >
          {children}
        </Swipeable>
      </View>
    );
  },
);

EdgeSwipeable.displayName = 'EdgeSwipeable';

export default EdgeSwipeable;