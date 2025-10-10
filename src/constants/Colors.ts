// apps/mobile/constants/Colors.ts
export const Colors = {
  // === Основные цвета бренда ===
  primary: '#2563eb',      // Яркий синий
  primaryLight: '#3b82f6',
  primaryDark: '#1e40af',
  
  secondary: '#7c3aed',     // Фиолетовый акцент
  secondaryLight: '#8b5cf6',
  secondaryDark: '#6d28d9',
  
  // === Темная тема (Dark/AMOLED) ===
  background: '#25252B',    // Почти черный фон
  backgroundElevated: '#0f0f10',
  
  surface: '#16161a',       // Карточки первого уровня
  surfaceElevated: '#1c1c21', // Приподнятые карточки
  surfaceHighlight: '#242429', // Hover/Active состояния
  
  // === Текст с правильной иерархией ===
  textPrimary: '#ffffff',   // Основной текст
  textSecondary: '#94969c', // Вторичный текст
  textTertiary: '#5f6168',  // Подписи и хинты
  textDisabled: '#3a3a42',  // Неактивный текст
  
  // === Статусы (успех/ошибка/предупреждение) ===
  success: '#10b981',       // Зеленый для доходов
  successLight: '#34d399',
  successDark: '#059669',
  successBg: '#10b98110',
  
  danger: '#ef4444',        // Красный для расходов
  dangerLight: '#f87171',
  dangerDark: '#dc2626',
  dangerBg: '#ef444410',
  
  warning: '#f59e0b',       // Оранжевый для алертов
  warningLight: '#fbbf24',
  warningDark: '#d97706',
  warningBg: '#f59e0b10',
  
  info: '#3b82f6',          // Синий для информации
  infoBg: '#3b82f610',
  
  // === Финансы ===
  income: '#10b981',        // Зеленый для доходов
  expense: '#ef4444',       // Красный для расходов
  transfer: '#3b82f6',      // Синий для переводов
  adjustment: '#8b5cf6',    // Фиолетовый для корректировок
  
  // === KPI кольца (по спеке) ===
  ringLow: '#10b981',       // <60% - зеленый
  ringMid: '#f59e0b',       // 60-90% - желтый
  ringHigh: '#ef4444',      // >90% - красный
  
  // === Границы и разделители ===
  border: '#1f1f23',        // Основная граница
  borderLight: '#27272a',   // Светлая граница
  borderFocus: '#2563eb',   // Граница при фокусе
  
  // === Tab bar (premium) ===
  tabBarBg: '#0a0a0b',
  tabBarBorder: '#1f1f23',
  tabBarActive: '#ffffff',
  tabBarInactive: '#5f6168',
  
  // === Градиенты для премиального UI ===
  gradients: {
    primary: ['#2563eb', '#3b82f6'],
    success: ['#10b981', '#34d399'],
    danger: ['#ef4444', '#f87171'],
    premium: ['#7c3aed', '#8b5cf6', '#a78bfa'],
    dark: ['#16161a', '#1c1c21'],
    card: ['#1c1c21', '#16161a'],
  },
  
  // === Прозрачности для оверлеев ===
  overlay: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    heavy: 'rgba(0, 0, 0, 0.7)',
  },
  
  // === Тени для elevation (iOS стиль) ===
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 10,
    },
  },
} as const;

// === Семантические токены дизайн-системы ===
export const DesignTokens = {
  // Типографика
  typography: {
    // Заголовки
    titleXL: {
      fontSize: 32,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    titleL: {
      fontSize: 24,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 32,
    },
    titleM: {
      fontSize: 20,
      fontWeight: '700' as const,
      letterSpacing: -0.2,
      lineHeight: 28,
    },
    titleS: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: -0.1,
      lineHeight: 24,
    },
    
    // Основной текст
    bodyL: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyM: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    bodyS: {
      fontSize: 13,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    
    // Подписи
    caption: {
      fontSize: 11,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      lineHeight: 16,
    },
    label: {
      fontSize: 11,
      fontWeight: '700' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
  
  // Радиусы скругления
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
  },
  
  // Отступы
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Анимации (по спеке раздел 3.2)
  animation: {
    fast: 150,      // Быстрые взаимодействия
    normal: 250,    // Стандартные переходы
    slow: 400,      // Медленные анимации
    spring: {
      damping: 15,
      stiffness: 100,
    },
  },
  
  // Z-индексы
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    tooltip: 1400,
    fab: 100,
    fabMenu: 99,
    backdrop: 98,
  },
} as const;

// === Темы ===
export const Themes = {
  dark: Colors, // Основная темная тема
  
  // AMOLED тема (чистый черный)
  amoled: {
    ...Colors,
    background: '#000000',
    backgroundElevated: '#0a0a0a',
    surface: '#0f0f0f',
    surfaceElevated: '#1a1a1a',
  },
  
  // Системная тема (будет переключаться автоматически)
  system: Colors,
} as const;

// === Хелперы для градиентов ===
export const getGradient = (type: keyof typeof Colors.gradients) => {
  return Colors.gradients[type];
};

// === Хелперы для теней ===
export const getShadow = (size: keyof typeof Colors.shadows) => {
  return Colors.shadows[size];
};

// === Экспорт по умолчанию для обратной совместимости ===
export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#2563eb',
    tabIconDefault: '#ccc',
    tabIconSelected: '#2563eb',
  },
  dark: {
    text: Colors.textPrimary,
    background: Colors.background,
    tint: Colors.primary,
    tabIconDefault: Colors.tabBarInactive,
    tabIconSelected: Colors.tabBarActive,
  },
};