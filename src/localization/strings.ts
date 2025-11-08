import { SupportedLanguage } from '@/stores/useSettingsStore';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'ru', 'uz', 'ar', 'tr'];

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uz: 'uz-UZ',
  ar: 'ar',
  tr: 'tr-TR',
};

export type AppTranslations = {
  home: {
    header: {
      todayLabel: string;
      openProfile: string;
      previousDay: string;
      nextDay: string;
    };
    greeting: {
      morning: string;
      afternoon: string;
      evening: string;
    };
    widgets: {
      title: string;
      edit: string;
      emptyTitle: string;
      emptySubtitle: string;
    };
    progress: {
      tasks: string;
      budget: string;
      habit: string;
      progressSuffix: string;
    };
  };
  tabs: {
    home: string;
    finance: string;
    planner: string;
    insights: string;
    more: string;
  };
  widgets: {
    budgetProgress: {
      title: string;
      defaults: { housing: string; groceries: string; entertainment: string };
      placeholders: { empty: string; add: string };
    };
    cashFlow: {
      title: string;
      summary: { income: string; expenses: string; net: string };
      days: { mon: string; tue: string; wed: string; thu: string; fri: string };
    };
    dailyTasks: {
      title: string;
      placeholders: [string, string, string];
    };
    focusSessions: {
      title: string;
      stats: { completed: string; totalTime: string; nextSession: string };
      placeholders: { none: string; free: string };
    };
    goals: {
      title: string;
      placeholderText: string;
      placeholders: [string, string];
    };
    habits: {
      title: string;
      placeholders: [string, string];
      streakLabel: string;
      noStreak: string;
    };
    productivityInsights: {
      title: string;
      metrics: { focusScore: string; tasksCompleted: string; deepWork: string };
      trendTitle: string;
      vsLastWeek: string;
      noTrend: string;
    };
    spendingSummary: {
      title: string;
      categories: { food: string; transport: string; shopping: string };
      placeholders: [string, string];
      total: string;
    };
    transactions: {
      title: string;
      placeholders: [string, string];
    };
    weeklyReview: {
      title: string;
      stats: { completion: string; focusTime: string; currentStreak: string };
      summary: { success: string; empty: string };
      streakUnit: string;
    };
    wellnessOverview: {
      title: string;
      metrics: { energy: string; mood: string; sleep: string };
      messages: { balanced: string; logPrompt: string };
    };
  };
  language: {
    sectionTitle: string;
    helperTitle: string;
    helperDescription: string;
  };
  more: {
    premiumBadge: string;
    sections: {
      account: string;
      settings: string;
      data: string;
      integration: string;
      help: string;
    };
    accountItems: {
      profile: string;
      premium: string;
      achievements: string;
      statistics: string;
    };
    settingsItems: {
      appearance: string;
      notifications: string;
      aiAssistant: string;
      security: string;
      language: string;
    };
    dataItems: {
      synchronization: string;
      backup: string;
      export: string;
      cache: string;
    };
    integrationItems: {
      calendars: string;
      banks: string;
      apps: string;
      devices: string;
    };
    helpItems: {
      manual: string;
      faq: string;
      support: string;
      about: string;
    };
    values: {
      enabled: string;
      disabled: string;
      on: string;
      off: string;
      themeLight: string;
      themeDark: string;
      aiAlpha: string;
      languageLabel: string;
      level: string;
    };
    logout: string;
    confirmLogout: {
      title: string;
      message: string;
      cancel: string;
      confirm: string;
    };
  };
};

const t = {
  en: {
    home: {
      header: {
        todayLabel: 'TODAY',
        openProfile: 'Open profile',
        previousDay: 'Previous day',
        nextDay: 'Next day',
      },
      greeting: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
      },
      widgets: {
        title: 'Widgets',
        edit: 'Edit',
        emptyTitle: 'No widgets available',
        emptySubtitle: 'Tap Edit to add widgets to your dashboard.',
      },
      progress: {
        tasks: 'Tasks',
        budget: 'Budget',
        habit: 'Habit',
        progressSuffix: 'progress',
      },
    },
    tabs: {
      home: 'Home',
      finance: 'Finance',
      planner: 'Planner',
      insights: 'Insights',
      more: 'More',
    },
    widgets: {
      budgetProgress: {
        title: 'Budget Progress',
        defaults: { housing: 'Housing', groceries: 'Groceries', entertainment: 'Entertainment' },
        placeholders: {
          empty: 'No budgets configured',
          add: 'Add a budget to track',
        },
      },
      cashFlow: {
        title: 'Cash Flow',
        summary: { income: 'Income', expenses: 'Expenses', net: 'Net' },
        days: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' },
      },
      dailyTasks: {
        title: 'Daily tasks',
        placeholders: ['No tasks scheduled', 'Enjoy a break', 'Add a new task'],
      },
      focusSessions: {
        title: 'Focus Sessions',
        stats: { completed: 'Completed', totalTime: 'Total Time', nextSession: 'Next Session' },
        placeholders: { none: 'No sessions logged', free: 'Calendar is free' },
      },
      goals: {
        title: 'Goals',
        placeholderText: 'Add a goal to start tracking progress.',
        placeholders: ['No goals tracked yet', 'Tap to add a new goal'],
      },
      habits: {
        title: 'Habits',
        placeholders: ['No habits tracked today', 'Log a habit to get started'],
        streakLabel: 'day streak',
        noStreak: 'No streak yet',
      },
      productivityInsights: {
        title: 'Productivity Insights',
        metrics: {
          focusScore: 'Focus score',
          tasksCompleted: 'Tasks completed',
          deepWork: 'Deep work hrs',
        },
        trendTitle: 'Focus trend',
        vsLastWeek: 'vs last week',
        noTrend: 'No trend yet',
      },
      spendingSummary: {
        title: 'Spending Summary',
        categories: {
          food: 'Food & Dining',
          transport: 'Transport',
          shopping: 'Shopping',
        },
        placeholders: ['No spending tracked', 'Log a purchase to begin'],
        total: 'Total spent',
      },
      transactions: {
        title: 'Transactions',
        placeholders: ['No activity logged', 'Start tracking transactions'],
      },
      weeklyReview: {
        title: 'Weekly Review',
        stats: {
          completion: 'Completion',
          focusTime: 'Focus Time',
          currentStreak: 'Current streak',
        },
        summary: {
          success: 'Great week! You completed {completed} of {total} tasks.',
          empty: 'Complete sessions to unlock weekly insights.',
        },
        streakUnit: 'days',
      },
      wellnessOverview: {
        title: 'Wellness Overview',
        metrics: { energy: 'Energy', mood: 'Mood', sleep: 'Sleep quality' },
        messages: {
          balanced: 'Balanced week — keep up the routines',
          logPrompt: 'Log your wellness check-ins to unlock insights',
        },
      },
    },
    language: {
      sectionTitle: 'Language',
      helperTitle: 'Note',
      helperDescription:
        'Language changes will apply across insights, coach messages, and future updates. Some experimental features may stay in English until localisation is complete.',
    },
    more: {
      premiumBadge: 'Premium until',
      sections: {
        account: 'Account',
        settings: 'Settings',
        data: 'Data',
        integration: 'Integration',
        help: 'Help',
      },
      accountItems: {
        profile: 'Profile',
        premium: 'Premium status',
        achievements: 'Achievements',
        statistics: 'Statistics',
      },
      settingsItems: {
        appearance: 'Appearance',
        notifications: 'Notifications',
        aiAssistant: 'AI Assistant',
        security: 'Security',
        language: 'Language and Region',
      },
      dataItems: {
        synchronization: 'Synchronization',
        backup: 'Backup / Restore',
        export: 'Export data',
        cache: 'Clear cache',
      },
      integrationItems: {
        calendars: 'Calendars',
        banks: 'Banks',
        apps: 'Apps',
        devices: 'Devices',
      },
      helpItems: {
        manual: 'Manual',
        faq: 'FAQ',
        support: 'Support',
        about: 'About LEORA',
      },
      values: {
        enabled: 'Enabled',
        disabled: 'Disabled',
        on: 'On',
        off: 'Off',
        themeLight: 'Light',
        themeDark: 'Dark',
        aiAlpha: 'Alpha',
        languageLabel: 'English',
        level: 'Level',
      },
      logout: 'Log out',
      confirmLogout: {
        title: 'Log out',
        message: 'Are you sure you want to log out?',
        cancel: 'Cancel',
        confirm: 'Log out',
      },
    },
  },
  ru: {
    home: {
      header: {
        todayLabel: 'СЕГОДНЯ',
        openProfile: 'Открыть профиль',
        previousDay: 'Предыдущий день',
        nextDay: 'Следующий день',
      },
      greeting: {
        morning: 'Доброе утро',
        afternoon: 'Добрый день',
        evening: 'Добрый вечер',
      },
      widgets: {
        title: 'Виджеты',
        edit: 'Править',
        emptyTitle: 'Нет доступных виджетов',
        emptySubtitle: 'Нажмите «Править», чтобы добавить виджеты на главную.',
      },
      progress: {
        tasks: 'Задачи',
        budget: 'Бюджет',
        habit: 'Привычка',
        progressSuffix: 'прогресс',
      },
    },
    tabs: {
      home: 'Главная',
      finance: 'Финансы',
      planner: 'Планер',
      insights: 'Аналитика',
      more: 'Ещё',
    },
    widgets: {
      budgetProgress: {
        title: 'Прогресс бюджета',
        defaults: { housing: 'Жильё', groceries: 'Продукты', entertainment: 'Развлечения' },
        placeholders: {
          empty: 'Бюджеты не настроены',
          add: 'Добавьте бюджет, чтобы отслеживать расходы',
        },
      },
      cashFlow: {
        title: 'Денежный поток',
        summary: { income: 'Доход', expenses: 'Расходы', net: 'Баланс' },
        days: { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт' },
      },
      dailyTasks: {
        title: 'Задачи дня',
        placeholders: ['Задач нет', 'Сделайте паузу', 'Добавьте новую задачу'],
      },
      focusSessions: {
        title: 'Фокус-сессии',
        stats: { completed: 'Выполнено', totalTime: 'Общее время', nextSession: 'Следующая сессия' },
        placeholders: { none: 'Сессий пока нет', free: 'Календарь свободен' },
      },
      goals: {
        title: 'Цели',
        placeholderText: 'Добавьте цель, чтобы начать отслеживание.',
        placeholders: ['Цели еще не добавлены', 'Нажмите, чтобы добавить новую цель'],
      },
      habits: {
        title: 'Привычки',
        placeholders: ['Нет привычек на сегодня', 'Добавьте привычку для старта'],
        streakLabel: 'дней подряд',
        noStreak: 'Серия пока отсутствует',
      },
      productivityInsights: {
        title: 'Аналитика продуктивности',
        metrics: {
          focusScore: 'Индекс фокуса',
          tasksCompleted: 'Задач выполнено',
          deepWork: 'Глубокая работа',
        },
        trendTitle: 'Динамика фокуса',
        vsLastWeek: 'к прошлой неделе',
        noTrend: 'Данных о тренде нет',
      },
      spendingSummary: {
        title: 'Расходы по категориям',
        categories: {
          food: 'Еда и кафе',
          transport: 'Транспорт',
          shopping: 'Покупки',
        },
        placeholders: ['Расходов пока нет', 'Добавьте покупку, чтобы начать'],
        total: 'Всего потрачено',
      },
      transactions: {
        title: 'Транзакции',
        placeholders: ['Операций нет', 'Начните отслеживать транзакции'],
      },
      weeklyReview: {
        title: 'Еженедельный обзор',
        stats: {
          completion: 'Выполнение',
          focusTime: 'Время фокуса',
          currentStreak: 'Текущая серия',
        },
        summary: {
          success: 'Отличная неделя! Вы завершили {completed} из {total} задач.',
          empty: 'Завершайте сессии, чтобы открыть аналитику недели.',
        },
        streakUnit: 'дн.',
      },
      wellnessOverview: {
        title: 'Баланс самочувствия',
        metrics: { energy: 'Энергия', mood: 'Настроение', sleep: 'Качество сна' },
        messages: {
          balanced: 'Неделя в балансе — продолжайте в том же духе',
          logPrompt: 'Фиксируйте самочувствие, чтобы получать инсайты',
        },
      },
    },
    language: {
      sectionTitle: 'Язык',
      helperTitle: 'Примечание',
      helperDescription:
        'Выбранный язык применяется к аналитике, подсказкам и будущим обновлениям. Некоторые экспериментальные функции могут временно оставаться на английском.',
    },
    more: {
      premiumBadge: 'Премиум до',
      sections: {
        account: 'Аккаунт',
        settings: 'Настройки',
        data: 'Данные',
        integration: 'Интеграции',
        help: 'Помощь',
      },
      accountItems: {
        profile: 'Профиль',
        premium: 'Статус Premium',
        achievements: 'Достижения',
        statistics: 'Статистика',
      },
      settingsItems: {
        appearance: 'Оформление',
        notifications: 'Уведомления',
        aiAssistant: 'ИИ‑ассистент',
        security: 'Безопасность',
        language: 'Язык и регион',
      },
      dataItems: {
        synchronization: 'Синхронизация',
        backup: 'Резервное копирование',
        export: 'Экспорт данных',
        cache: 'Очистить кэш',
      },
      integrationItems: {
        calendars: 'Календари',
        banks: 'Банки',
        apps: 'Приложения',
        devices: 'Устройства',
      },
      helpItems: {
        manual: 'Руководство',
        faq: 'FAQ',
        support: 'Поддержка',
        about: 'О LEORA',
      },
      values: {
        enabled: 'Вкл.',
        disabled: 'Выкл.',
        on: 'Вкл.',
        off: 'Выкл.',
        themeLight: 'Светлая',
        themeDark: 'Тёмная',
        aiAlpha: 'Альфа',
        languageLabel: 'Русский',
        level: 'Уровень',
      },
      logout: 'Выйти',
      confirmLogout: {
        title: 'Выйти из аккаунта',
        message: 'Вы уверены, что хотите выйти?',
        cancel: 'Отмена',
        confirm: 'Выйти',
      },
    },
  },
  uz: {
    home: {
      header: {
        todayLabel: 'BUGUN',
        openProfile: 'Profilni ochish',
        previousDay: 'Oldingi kun',
        nextDay: 'Keyingi kun',
      },
      greeting: {
        morning: 'Xayrli tong',
        afternoon: 'Xayrli kun',
        evening: 'Xayrli oqshom',
      },
      widgets: {
        title: 'Vidjetlar',
        edit: 'Tahrirlash',
        emptyTitle: 'Vidjetlar mavjud emas',
        emptySubtitle: 'Bosh sahifaga vidjet qo‘shish uchun "Tahrirlash" tugmasini bosing.',
      },
      progress: {
        tasks: 'Vazifalar',
        budget: 'Byudjet',
        habit: 'Odat',
        progressSuffix: 'ko‘rsatkich',
      },
    },
    tabs: {
      home: 'Bosh sahifa',
      finance: 'Moliya',
      planner: 'Reja',
      insights: 'Tahlillar',
      more: 'Ko‘proq',
    },
    widgets: {
      budgetProgress: {
        title: 'Byudjet holati',
        defaults: { housing: 'Uy-joy', groceries: 'Oziq-ovqat', entertainment: 'Hordiq' },
        placeholders: {
          empty: 'Byudjetlar yaratilmagan',
          add: 'Kuzatish uchun byudjet qo‘shing',
        },
      },
      cashFlow: {
        title: 'Pul oqimi',
        summary: { income: 'Daromad', expenses: 'Xarajat', net: 'Balans' },
        days: { mon: 'Du', tue: 'Se', wed: 'Chor', thu: 'Pay', fri: 'Ju' },
      },
      dailyTasks: {
        title: 'Kundalik vazifalar',
        placeholders: ['Vazifalar yo‘q', 'Dam oling', 'Yangi vazifa qo‘shing'],
      },
      focusSessions: {
        title: 'Fokus sessiyalar',
        stats: { completed: 'Bajarildi', totalTime: 'Umumiy vaqt', nextSession: 'Keyingi sessiya' },
        placeholders: { none: 'Sessiyalar yo‘q', free: 'Kalendar bo‘sh' },
      },
      goals: {
        title: 'Maqsadlar',
        placeholderText: 'Maqsad qo‘shib natijani kuzating.',
        placeholders: ['Maqsadlar hali yo‘q', 'Yangi maqsad qo‘shing'],
      },
      habits: {
        title: 'Odatlar',
        placeholders: ['Bugunga odatlar yo‘q', 'Odat qo‘shib boshlang'],
        streakLabel: 'kunlik seriya',
        noStreak: 'Seriya hali yo‘q',
      },
      productivityInsights: {
        title: 'Samaradorlik tahlili',
        metrics: {
          focusScore: 'Fokus balli',
          tasksCompleted: 'Bajarilgan vazifalar',
          deepWork: 'Chuqur ish soati',
        },
        trendTitle: 'Fokus trendlari',
        vsLastWeek: 'o‘tgan haftaga nisbatan',
        noTrend: 'Trend maʼlumotlari yo‘q',
      },
      spendingSummary: {
        title: 'Xarajatlar yig‘indisi',
        categories: {
          food: 'Oziq-ovqat',
          transport: 'Transport',
          shopping: 'Xaridlar',
        },
        placeholders: ['Xarajat qayd etilmagan', 'Xarid qo‘shib boshlang'],
        total: 'Jami sarf',
      },
      transactions: {
        title: 'Tranzaksiyalar',
        placeholders: ['Faoliyat qayd etilmagan', 'Tranzaksiyalarni kuzatishni boshlang'],
      },
      weeklyReview: {
        title: 'Haftalik sharh',
        stats: {
          completion: 'Bajarilish',
          focusTime: 'Fokus vaqti',
          currentStreak: 'Joriy seriya',
        },
        summary: {
          success: 'Zo‘r hafta! {completed} / {total} vazifa bajarildi.',
          empty: 'Haftalik tahlilni ochish uchun sessiyalarni yakunlang.',
        },
        streakUnit: 'kun',
      },
      wellnessOverview: {
        title: 'Salomatlik holati',
        metrics: { energy: 'Energiya', mood: 'Kayfiyat', sleep: 'Uyqu sifati' },
        messages: {
          balanced: 'Hafta barqaror o‘tdi — shu zaylda davom eting',
          logPrompt: 'Ichki holatingizni yozib boring, shunda tahlillar chiqadi',
        },
      },
    },
    language: {
      sectionTitle: 'Til',
      helperTitle: 'Eslatma',
      helperDescription:
        'Til sozlamasi tahlillar, yordamchi xabarlar va yangilanishlarga qo‘llanadi. Ayrim tajriba funksiyalar hali ingliz tilida qolishi mumkin.',
    },
    more: {
      premiumBadge: 'Premium muddati',
      sections: {
        account: 'Profil',
        settings: 'Sozlamalar',
        data: 'Maʼlumotlar',
        integration: 'Integratsiya',
        help: 'Yordam',
      },
      accountItems: {
        profile: 'Profil',
        premium: 'Premium holati',
        achievements: 'Yutuqlar',
        statistics: 'Statistika',
      },
      settingsItems: {
        appearance: 'Ko‘rinish',
        notifications: 'Bildirishnomalar',
        aiAssistant: 'AI yordamchi',
        security: 'Xavfsizlik',
        language: 'Til va mintaqa',
      },
      dataItems: {
        synchronization: 'Sinxronlash',
        backup: 'Zaxira / Tiklash',
        export: 'Maʼlumotni eksport qilish',
        cache: 'Keshni tozalash',
      },
      integrationItems: {
        calendars: 'Kalendarlar',
        banks: 'Banklar',
        apps: 'Ilovalar',
        devices: 'Qurilmalar',
      },
      helpItems: {
        manual: 'Qo‘llanma',
        faq: 'FAQ',
        support: 'Qo‘llab-quvvatlash',
        about: 'LEORA haqida',
      },
      values: {
        enabled: 'Yoniq',
        disabled: 'O‘chiq',
        on: 'Yoqilgan',
        off: 'O‘chirilgan',
        themeLight: 'Yorug‘',
        themeDark: 'Qorong‘i',
        aiAlpha: 'Alfa',
        languageLabel: 'O‘zbekcha',
        level: 'Daraja',
      },
      logout: 'Chiqish',
      confirmLogout: {
        title: 'Chiqishni tasdiqlang',
        message: 'Haqiqatan ham tizimdan chiqmoqchimisiz?',
        cancel: 'Bekor qilish',
        confirm: 'Chiqish',
      },
    },
  },
  ar: {
    home: {
      header: {
        todayLabel: 'اليوم',
        openProfile: 'افتح الملف الشخصي',
        previousDay: 'اليوم السابق',
        nextDay: 'اليوم التالي',
      },
      greeting: {
        morning: 'صباح الخير',
        afternoon: 'نهار سعيد',
        evening: 'مساء الخير',
      },
      widgets: {
        title: 'الويدجت',
        edit: 'تحرير',
        emptyTitle: 'لا توجد عناصر واجهة',
        emptySubtitle: 'اضغط "تحرير" لإضافة عناصر إلى لوحتك.',
      },
      progress: {
        tasks: 'المهام',
        budget: 'الميزانية',
        habit: 'العادات',
        progressSuffix: 'التقدم',
      },
    },
    tabs: {
      home: 'الرئيسية',
      finance: 'الماليات',
      planner: 'المخطط',
      insights: 'الرؤى',
      more: 'المزيد',
    },
    widgets: {
      budgetProgress: {
        title: 'تقدم الميزانية',
        defaults: { housing: 'السكن', groceries: 'المشتريات اليومية', entertainment: 'الترفيه' },
        placeholders: {
          empty: 'لم يتم إعداد ميزانيات',
          add: 'أضف ميزانية للمتابعة',
        },
      },
      cashFlow: {
        title: 'التدفق النقدي',
        summary: { income: 'الدخل', expenses: 'المصروفات', net: 'الصافي' },
        days: { mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' },
      },
      dailyTasks: {
        title: 'مهام اليوم',
        placeholders: ['لا مهام حالياً', 'استمتع باستراحة', 'أضف مهمة جديدة'],
      },
      focusSessions: {
        title: 'جلسات التركيز',
        stats: { completed: 'مكتمل', totalTime: 'الوقت الكلي', nextSession: 'الجلسة التالية' },
        placeholders: { none: 'لا جلسات مسجلة', free: 'الجدول فارغ' },
      },
      goals: {
        title: 'الأهداف',
        placeholderText: 'أضف هدفاً لبدء المتابعة.',
        placeholders: ['لا أهداف بعد', 'اضغط لإضافة هدف جديد'],
      },
      habits: {
        title: 'العادات',
        placeholders: ['لا عادات لهذا اليوم', 'سجل عادة للبدء'],
        streakLabel: 'أيام على التوالي',
        noStreak: 'لا سلسلة بعد',
      },
      productivityInsights: {
        title: 'رؤى الإنتاجية',
        metrics: {
          focusScore: 'درجة التركيز',
          tasksCompleted: 'المهام المنجزة',
          deepWork: 'ساعات العمل العميق',
        },
        trendTitle: 'منحنى التركيز',
        vsLastWeek: 'مقارنة بالأسبوع الماضي',
        noTrend: 'لا يوجد منحنى بعد',
      },
      spendingSummary: {
        title: 'ملخص الإنفاق',
        categories: {
          food: 'الطعام والمطاعم',
          transport: 'النقل',
          shopping: 'التسوق',
        },
        placeholders: ['لا إنفاق مسجل', 'سجل عملية شراء للبدء'],
        total: 'إجمالي الإنفاق',
      },
      transactions: {
        title: 'المعاملات',
        placeholders: ['لا نشاط مالي', 'ابدأ بتتبع المعاملات'],
      },
      weeklyReview: {
        title: 'مراجعة الأسبوع',
        stats: {
          completion: 'نسبة الإنجاز',
          focusTime: 'وقت التركيز',
          currentStreak: 'السلسلة الحالية',
        },
        summary: {
          success: 'أسبوع ممتاز! أنجزت {completed} من أصل {total} مهام.',
          empty: 'أكمل الجلسات لعرض ملخص الأسبوع.',
        },
        streakUnit: 'يوم',
      },
      wellnessOverview: {
        title: 'نظرة على العافية',
        metrics: { energy: 'الطاقة', mood: 'المزاج', sleep: 'جودة النوم' },
        messages: {
          balanced: 'أسبوع متوازن — استمر بهذه الوتيرة',
          logPrompt: 'سجل فحوصات العافية للحصول على الرؤى',
        },
      },
    },
    language: {
      sectionTitle: 'اللغة',
      helperTitle: 'ملاحظة',
      helperDescription:
        'سيتم تطبيق اللغة على اللوحات والرؤى والتحديثات القادمة. قد تبقى بعض الميزات التجريبية بالإنجليزية مؤقتاً.',
    },
    more: {
      premiumBadge: 'مميز حتى',
      sections: {
        account: 'الحساب',
        settings: 'الإعدادات',
        data: 'البيانات',
        integration: 'التكامل',
        help: 'المساعدة',
      },
      accountItems: {
        profile: 'الملف الشخصي',
        premium: 'وضع Premium',
        achievements: 'الإنجازات',
        statistics: 'الإحصائيات',
      },
      settingsItems: {
        appearance: 'المظهر',
        notifications: 'الإشعارات',
        aiAssistant: 'مساعد الذكاء الاصطناعي',
        security: 'الأمان',
        language: 'اللغة والمنطقة',
      },
      dataItems: {
        synchronization: 'المزامنة',
        backup: 'نسخ احتياطي / استعادة',
        export: 'تصدير البيانات',
        cache: 'مسح الذاكرة المؤقتة',
      },
      integrationItems: {
        calendars: 'التقاويم',
        banks: 'البنوك',
        apps: 'التطبيقات',
        devices: 'الأجهزة',
      },
      helpItems: {
        manual: 'الدليل',
        faq: 'الأسئلة الشائعة',
        support: 'الدعم',
        about: 'عن LEORA',
      },
      values: {
        enabled: 'مفعل',
        disabled: 'متوقف',
        on: 'تشغيل',
        off: 'إيقاف',
        themeLight: 'فاتح',
        themeDark: 'داكن',
        aiAlpha: 'ألفا',
        languageLabel: 'العربية',
        level: 'المستوى',
      },
      logout: 'تسجيل الخروج',
      confirmLogout: {
        title: 'تأكيد تسجيل الخروج',
        message: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
        cancel: 'إلغاء',
        confirm: 'تسجيل الخروج',
      },
    },
  },
  tr: {
    home: {
      header: {
        todayLabel: 'BUGÜN',
        openProfile: 'Profili aç',
        previousDay: 'Önceki gün',
        nextDay: 'Sonraki gün',
      },
      greeting: {
        morning: 'Günaydın',
        afternoon: 'İyi günler',
        evening: 'İyi akşamlar',
      },
      widgets: {
        title: 'Widgetler',
        edit: 'Düzenle',
        emptyTitle: 'Widget yok',
        emptySubtitle: 'Paneline widget eklemek için "Düzenle" tuşuna bas.',
      },
      progress: {
        tasks: 'Görevler',
        budget: 'Bütçe',
        habit: 'Alışkanlık',
        progressSuffix: 'durumu',
      },
    },
    tabs: {
      home: 'Ana sayfa',
      finance: 'Finans',
      planner: 'Planlayıcı',
      insights: 'İçgörüler',
      more: 'Diğer',
    },
    widgets: {
      budgetProgress: {
        title: 'Bütçe ilerlemesi',
        defaults: { housing: 'Konut', groceries: 'Market', entertainment: 'Eğlence' },
        placeholders: {
          empty: 'Bütçe eklenmemiş',
          add: 'Takip için bütçe ekleyin',
        },
      },
      cashFlow: {
        title: 'Nakit akışı',
        summary: { income: 'Gelir', expenses: 'Gider', net: 'Net' },
        days: { mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum' },
      },
      dailyTasks: {
        title: 'Günlük görevler',
        placeholders: ['Görev yok', 'Kısa mola ver', 'Yeni görev ekle'],
      },
      focusSessions: {
        title: 'Odak seansları',
        stats: { completed: 'Tamamlandı', totalTime: 'Toplam süre', nextSession: 'Sonraki seans' },
        placeholders: { none: 'Seans kaydı yok', free: 'Takvim boş' },
      },
      goals: {
        title: 'Hedefler',
        placeholderText: 'İlerlemeyi görmek için hedef ekleyin.',
        placeholders: ['Henüz hedef yok', 'Yeni hedef eklemek için dokunun'],
      },
      habits: {
        title: 'Alışkanlıklar',
        placeholders: ['Bugün alışkanlık yok', 'Başlamak için alışkanlık ekleyin'],
        streakLabel: 'günlük seri',
        noStreak: 'Seri yok',
      },
      productivityInsights: {
        title: 'Üretkenlik içgörüleri',
        metrics: {
          focusScore: 'Fokus puanı',
          tasksCompleted: 'Tamamlanan görev',
          deepWork: 'Derin çalışma saati',
        },
        trendTitle: 'Fokus eğrisi',
        vsLastWeek: 'geçen haftaya göre',
        noTrend: 'Henüz eğri yok',
      },
      spendingSummary: {
        title: 'Harcama özeti',
        categories: {
          food: 'Yemek & restoran',
          transport: 'Ulaşım',
          shopping: 'Alışveriş',
        },
        placeholders: ['Harcama kaydı yok', 'Başlamak için alışveriş ekleyin'],
        total: 'Toplam harcama',
      },
      transactions: {
        title: 'İşlemler',
        placeholders: ['İşlem yok', 'İşlem takibini başlatın'],
      },
      weeklyReview: {
        title: 'Haftalık özet',
        stats: {
          completion: 'Tamamlama',
          focusTime: 'Fokus süresi',
          currentStreak: 'Seri',
        },
        summary: {
          success: 'Harika hafta! {completed}/{total} görevi tamamladın.',
          empty: 'Haftalık içgörüyü görmek için seans tamamla.',
        },
        streakUnit: 'gün',
      },
      wellnessOverview: {
        title: 'Wellness görünümü',
        metrics: { energy: 'Enerji', mood: 'Ruh hali', sleep: 'Uyku kalitesi' },
        messages: {
          balanced: 'Dengeli hafta — böyle devam et',
          logPrompt: 'İçgörü almak için wellness kayıtlarını gir',
        },
      },
    },
    language: {
      sectionTitle: 'Dil',
      helperTitle: 'Not',
      helperDescription:
        'Dil ayarı içgörüler, koç mesajları ve güncellemelerde kullanılacak. Bazı deneysel özellikler geçici olarak İngilizce kalabilir.',
    },
    more: {
      premiumBadge: 'Premium bitişi',
      sections: {
        account: 'Hesap',
        settings: 'Ayarlar',
        data: 'Veriler',
        integration: 'Entegrasyon',
        help: 'Yardım',
      },
      accountItems: {
        profile: 'Profil',
        premium: 'Premium durumu',
        achievements: 'Başarılar',
        statistics: 'İstatistikler',
      },
      settingsItems: {
        appearance: 'Tema',
        notifications: 'Bildirimler',
        aiAssistant: 'Yapay zekâ asistanı',
        security: 'Güvenlik',
        language: 'Dil ve bölge',
      },
      dataItems: {
        synchronization: 'Senkronizasyon',
        backup: 'Yedekle / Geri yükle',
        export: 'Veri dışa aktarımı',
        cache: 'Önbelleği temizle',
      },
      integrationItems: {
        calendars: 'Takvimler',
        banks: 'Bankalar',
        apps: 'Uygulamalar',
        devices: 'Cihazlar',
      },
      helpItems: {
        manual: 'Kılavuz',
        faq: 'SSS',
        support: 'Destek',
        about: 'LEORA hakkında',
      },
      values: {
        enabled: 'Aktif',
        disabled: 'Pasif',
        on: 'Açık',
        off: 'Kapalı',
        themeLight: 'Açık',
        themeDark: 'Koyu',
        aiAlpha: 'Alfa',
        languageLabel: 'Türkçe',
        level: 'Seviye',
      },
      logout: 'Çıkış',
      confirmLogout: {
        title: 'Çıkış yap',
        message: 'Oturumu kapatmak istediğine emin misin?',
        cancel: 'Vazgeç',
        confirm: 'Çıkış yap',
      },
    },
  },
} satisfies Record<SupportedLanguage, AppTranslations>;

export const APP_TRANSLATIONS: Record<SupportedLanguage, AppTranslations> = t;
