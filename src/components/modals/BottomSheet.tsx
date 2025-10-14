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
  snapPoints?: (string | number)[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  isFullScreen?: boolean;
  scrollable?: boolean;
  scrollProps?: Partial<ComponentProps<typeof BottomSheetScrollView>>;
  hasScrollableChildren?: boolean;
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
    hasScrollableChildren = false,
    ...rest
  }: CustomBottomSheetProps,
  ref: ForwardedRef<BottomSheetHandle>
) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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

  const {
    index,
    keyboardBehavior,
    keyboardBlurBehavior,
    enablePanDownToClose,
    enableDynamicSizing,
    ...modalRest
  } = rest;

  const dynamicSizingEnabled = enableDynamicSizing ?? false;
  const defaultSnapPoints = useMemo<(string | number)[]>(
    () => (isFullScreen ? ['95%'] : ['60%']),
    [isFullScreen]
  );
  const resolvedSnapPoints = useMemo<(string | number)[] | undefined>(() => {
    if (dynamicSizingEnabled) {
      return snapPoints && snapPoints.length > 0 ? snapPoints : undefined;
    }
    if (snapPoints && snapPoints.length > 0) {
      return snapPoints;
    }
    return defaultSnapPoints;
  }, [defaultSnapPoints, dynamicSizingEnabled, snapPoints]);

  const panDownToClose = enablePanDownToClose ?? !isFullScreen;
  const backgroundStyles = useMemo(
    () => [styles.background, isFullScreen && styles.fullScreenBackground, backgroundStyle],
    [backgroundStyle, isFullScreen]
  );
  const handleIndicatorStyles = useMemo(
    () => [styles.handleIndicator, isFullScreen && styles.hiddenHandleIndicator, handleIndicatorStyle],
    [handleIndicatorStyle, isFullScreen]
  );
  const baseContentStyle = useMemo(
    () => [styles.contentContainer, isFullScreen && styles.fullScreenContent, contentContainerStyle],
    [contentContainerStyle, isFullScreen]
  );
  const flattenedBaseStyle = useMemo(() => StyleSheet.flatten(baseContentStyle), [baseContentStyle]);

  let content: ReactNode;
  if (hasScrollableChildren) {
    content = <BottomSheetView style={[styles.flexContainer, flattenedBaseStyle]}>{children}</BottomSheetView>;
  } else if (scrollable) {
    content = (
      <BottomSheetScrollView
        style={styles.scrollContainer}
        contentContainerStyle={baseContentStyle}
        showsVerticalScrollIndicator={false}
        {...scrollProps}
      >
        {children}
      </BottomSheetScrollView>
    );
  } else {
    content = <BottomSheetView style={baseContentStyle}>{children}</BottomSheetView>;
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={index ?? 0}
      keyboardBehavior={keyboardBehavior ?? 'interactive'}
      keyboardBlurBehavior={keyboardBlurBehavior ?? 'restore'}
      enablePanDownToClose={panDownToClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={handleIndicatorStyles}
      backgroundStyle={backgroundStyles}
      enableDynamicSizing={dynamicSizingEnabled}
      {...(resolvedSnapPoints ? { snapPoints: resolvedSnapPoints } : {})}
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
  hiddenHandleIndicator: {
    opacity: 0,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  fullScreenContent: {
    flex: 1,
  },
  fullScreenBackground: {
    borderRadius: 0,
  },
  scrollContainer: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
});

export default CustomBottomSheet;
