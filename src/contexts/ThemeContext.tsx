import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Animated, {
  SharedValue,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isReady: boolean;
  setTheme: (value: Theme) => void;
  toggleTheme: () => void;
  progress: SharedValue<number>;
}

const DEFAULT_THEME: Theme = 'dark';
const THEME_STORAGE_KEY = 'leora:theme';

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME,
  isReady: false,
  setTheme: () => {},
  toggleTheme: () => {},
  progress: { value: DEFAULT_THEME === 'dark' ? 1 : 0 } as SharedValue<number>,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [isReady, setIsReady] = useState(false);
  const progress = useSharedValue(DEFAULT_THEME === 'dark' ? 1 : 0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark') {
          if (isMounted) {
            setThemeState(storedTheme);
          }
        }
      } catch (error) {
        console.warn('ThemeProvider: failed to load theme preference', error);
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    hydrateTheme();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      progress.value = theme === 'dark' ? 1 : 0;
      isFirstRender.current = false;
      return;
    }

    progress.value = withTiming(theme === 'dark' ? 1 : 0, { duration: 320 });
  }, [theme, progress]);

  const persistTheme = useCallback(async (value: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, value);
    } catch (error) {
      console.warn('ThemeProvider: failed to persist theme preference', error);
    }
  }, []);

  const setTheme = useCallback(
    (value: Theme) => {
      setThemeState(value);
      void persistTheme(value);
    },
    [persistTheme]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      void persistTheme(next);
      return next;
    });
  }, [persistTheme]);

  const contextValue = useMemo(
    () => ({
      theme,
      isReady,
      setTheme,
      toggleTheme,
      progress,
    }),
    [isReady, setTheme, theme, toggleTheme, progress]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const ThemedView: React.FC<{ children: React.ReactNode; style?: any }> = ({
  children,
  style,
}) => {
  const { progress } = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', '#25252B']
    );

    return { backgroundColor };
  });

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
};
