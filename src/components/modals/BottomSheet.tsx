import React, {
  ComponentProps,
  ForwardedRef,
  ReactNode,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { Colors } from '@/constants/Colors';

export interface BottomSheetHandle {
  present: () => void;
  dismiss: () => void;
}

type CustomBottomSheetProps = Omit<BottomSheetModalProps, 'children' | 'snapPoints'> & {
  children: ReactNode;
  /**
   * Override snap points; omit to use sensible defaults.
   */
  snapPoints?: (string | number)[];
  /**
   * Optional content container style applied to the sheet body.
   */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Forces the sheet to occupy the entire screen height.
   */
  isFullScreen?: boolean;
  /**
   * Wraps children in a BottomSheetScrollView for automatic scrolling.
   */
  scrollable?: boolean;
  /**
   * Additional props forwarded to the BottomSheetScrollView when scrollable.
   */
  scrollProps?: Partial<ComponentProps<typeof BottomSheetScrollView>>;
};

const CustomBottomSheet = forwardRef(function CustomBottomSheet(
  {
    children,
    snapPoints,
    contentContainerStyle,
    backgroundStyle,
    handleIndicatorStyle,
    isFullScreen = false,
    scrollable = false,
    scrollProps,
    ...rest
  }: CustomBottomSheetProps,
  ref: ForwardedRef<BottomSheetHandle>
) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const computedSnapPoints = useMemo<(string | number)[]>(() => {
    if (snapPoints && snapPoints.length > 0) {
      return snapPoints;
    }
    return isFullScreen ? ['100%'] : ['60%'];
  }, [isFullScreen, snapPoints]);

  const handlePresent = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleDismiss = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      present: handlePresent,
      dismiss: handleDismiss,
    }),
    [handleDismiss, handlePresent]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.75}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
        enableTouchThrough={false}
        style={[props.style, styles.backdrop]}
      />
    ),
    []
  );

  const { index, keyboardBehavior, keyboardBlurBehavior, enablePanDownToClose, ...modalRest } = rest;

  const baseContentStyle = [styles.contentContainer, contentContainerStyle];
  const content = scrollable ? (
    <BottomSheetScrollView
      style={styles.scrollContainer}
      contentContainerStyle={baseContentStyle}
      showsVerticalScrollIndicator={false}
      {...scrollProps}
    >
      {children}
    </BottomSheetScrollView>
  ) : (
    <BottomSheetView style={baseContentStyle}>{children}</BottomSheetView>
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={index ?? 0}
      keyboardBehavior={keyboardBehavior ?? 'interactive'}
      keyboardBlurBehavior={keyboardBlurBehavior ?? 'restore'}
      enablePanDownToClose={enablePanDownToClose ?? true}
      snapPoints={computedSnapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={[styles.handleIndicator, handleIndicatorStyle]}
      backgroundStyle={[styles.background, backgroundStyle]}
      {...modalRest}
    >
      {content}
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.overlay.heavy,
  },
  background: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
  },
  handleIndicator: {
    backgroundColor: Colors.textTertiary,
    width: 56,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollContainer: {
    flex: 1,
  },
});

export default CustomBottomSheet;
