import { SupportedLanguage } from '@/stores/useSettingsStore';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'ru', 'uz', 'ar', 'tr'];

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  uz: 'uz-UZ',
  ar: 'ar',
  tr: 'tr-TR',
};

export type PlannerGoalId = 'dream-car' | 'emergency-fund' | 'fitness' | 'language';
export type PlannerHabitId = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
export type GoalSummaryKey = 'left' | 'pace' | 'prediction';

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
  plannerScreens: {
    tabs: {
      tasks: string;
      goals: string;
      habits: string;
    };
    tasks: {
      headerTemplate: string;
      todayLabel: string;
      filter: string;
      sectionCountLabel: string;
      sectionTip: string;
      sections: Record<'morning' | 'afternoon' | 'evening', { title: string; time: string }>;
      actions: {
        complete: string;
        restore: string;
        remove: string;
        delete: string;
      };
      history: {
        title: string;
        subtitle: string;
        tip: string;
        deletedBadge: string;
      };
      defaults: {
        startToday: string;
        startTomorrow: string;
        startPick: string;
        newTaskTitle: string;
        defaultContext: string;
      };
      aiPrefix: string;
    };
    goals: {
      header: { title: string; subtitle: string };
      empty: { title: string; subtitle: string };
      sections: Record<'financial' | 'personal', { title: string; subtitle: string }>;
      cards: {
        summaryLabels: Record<GoalSummaryKey, string>;
        actions: {
          addValue: string;
          refresh: string;
          edit: string;
          addValueA11y: string;
          refreshA11y: string;
          editA11y: string;
          openDetailsA11y: string;
        };
      };
      details: { milestones: string; history: string; showMore: string };
      data: Record<
        PlannerGoalId,
        {
          title: string;
          currentAmount: string;
          targetAmount: string;
          summary: Record<GoalSummaryKey, string>;
          milestones: [string, string, string, string];
          history: { label: string; delta: string }[];
          aiTip: string;
          aiTipHighlight?: string;
        }
      >;
    };
    habits: {
      headerTitle: string;
      badgeSuffix: string;
      stats: {
        streak: string;
        record: string;
        completion: string;
      };
      ctas: {
        checkIn: string;
        startTimer: string;
        completed: string;
        failed: string;
        edit: string;
        delete: string;
      };
      expand: {
        titles: { statistics: string; pattern: string; achievements: string };
        lines: {
          overallCompletion: string;
          successPercentile: string;
          averageStreak: string;
          bestMonth: string;
          bestTime: string;
          worstTime: string;
          afterWeekends: string;
        };
        badges: {
          firstWeek: string;
          monthNoBreak: string;
          hundredCompletions: string;
          marathoner: string;
        };
      };
      data: Record<
        PlannerHabitId,
        {
          title: string;
          aiNote?: string;
          chips?: string[];
        }
      >;
    };
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
      days: { mon: string; tue: string; wed: string; thu: string; fri: string };
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
    header: {
      title: string;
      profileAction: string;
      notificationsAction: string;
      badgeLabel: string;
      dateLabel: string;
    };
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
  profile: {
    title: string;
    sections: {
      personal: string;
      stats: string;
      preferences: string;
      actions: string;
    };
    fields: {
      fullName: string;
      email: string;
      phone: string;
      username: string;
      joined: string;
      bio: string;
      visibility: string;
      visibilityOptions: { public: string; friends: string; private: string };
      showLevel: string;
      showAchievements: string;
      showStatistics: string;
    };
    stats: {
      daysWithApp: string;
      completedTasks: string;
      activeTasks: string;
      level: string;
    };
    xp: {
      label: string;
      toNext: string;
    };
    buttons: {
      edit: string;
      save: string;
      cancel: string;
      delete: string;
      logout: string;
      changePhoto: string;
      removePhoto: string;
      confirmDeleteTitle: string;
      confirmDeleteMessage: string;
      confirmDeleteConfirm: string;
      confirmDeleteCancel: string;
    };
  };
  financeScreens: {
    tabs: {
      review: string;
      accounts: string;
      transactions: string;
      budgets: string;
      analytics: string;
      debts: string;
    };
    review: {
      totalBalance: string;
      income: string;
      outcome: string;
      monthBalance: string;
      used: string;
      progress: string;
      expenseStructure: string;
      recentTransactions: string;
      seeAll: string;
      importantEvents: string;
      table: { type: string; amount: string; date: string };
    };
    accounts: {
      header: string;
      income: string;
      outcome: string;
      goalProgress: string;
      historyTitle: string;
      historyHeaders: { type: string; amount: string; time: string };
      actions: { edit: string; archive: string; delete: string };
    };
    transactions: {
      header: string;
      details: {
        title: string;
        amount: string;
        account: string;
        category: string;
        date: string;
        note: string;
        relatedDebt: string;
        close: string;
      };
    };
    budgets: {
      today: string;
      dateTemplate: string;
      mainTitle: string;
      categoriesTitle: string;
      addCategory: string;
      setLimit: string;
      states: { exceeding: string; fixed: string; within: string };
    };
    analytics: {
      header: string;
      expenseDynamics: string;
      comparison: string;
      topExpenses: string;
      aiInsights: string;
      stats: { peak: string; average: string; trend: string };
      comparisonRows: { income: string; outcome: string; savings: string };
    };
    debts: {
      sections: { incoming: string; outgoing: string };
      timeline: {
        incoming: string;
        outgoing: string;
        today: string;
        inDays: string;
        overdue: string;
      };
      actions: {
        incoming: { notify: string; cancel: string };
        outgoing: { plan: string; partial: string };
      };
      summary: {
        balanceLabel: string;
        givenLabel: string;
        takenLabel: string;
        givenChange: string;
        takenChange: string;
      };
      modal: {
        title: string;
        editTitle: string;
        subtitle: string;
        person: string;
        personPlaceholder: string;
        amount: string;
        accountLabel: string;
        accountHelper: string;
        accountPickerTitle: string;
        currencyLabel: string;
        currencyHelper: string;
        currencyPickerTitle: string;
        dateLabel: string;
        changeDate: string;
        clear: string;
        selectAccount: string;
        expectedReturn: string;
        expectedPlaceholder: string;
        selectDate: string;
        note: string;
        notePlaceholder: string;
        toggles: { incoming: string; outgoing: string };
        manageActions: string;
        buttons: {
          cancel: string;
          save: string;
          saveChanges: string;
          delete: string;
        };
        defaults: { name: string; description: string; due: string };
        deleteTitle: string;
        deleteDescription: string;
        status: { lent: string; borrowed: string };
        scheduleTitle: string;
        reminderTitle: string;
        reminderToggle: string;
        reminderTimeLabel: string;
        reminderEnabledLabel: string;
        reminderDisabledLabel: string;
        payment: {
          title: string;
          amount: string;
          accountLabel: string;
          currencyLabel: string;
          note: string;
          helper: string;
          submit: string;
          limitError: string;
        };
        actionsBar: {
          pay: string;
          partial: string;
          notify: string;
          schedule: string;
        };
        fullPaymentTitle: string;
        fullPaymentDescription: string;
        fullPaymentSubmit: string;
      };
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
      insights: 'Insight',
      more: 'More',
    },
    plannerScreens: {
      tabs: {
        tasks: 'Tasks',
        goals: 'Goals',
        habits: 'Habits',
      },
      tasks: {
        headerTemplate: 'Plans for {date}',
        todayLabel: 'today',
        filter: 'Filter',
        sectionCountLabel: 'tasks',
        sectionTip:
          'Hold briefly, swipe right to toggle done, swipe left to delete (even completed tasks).',
        sections: {
          morning: { title: 'Morning', time: '(06:00 - 12:00)' },
          afternoon: { title: 'Afternoon', time: '(12:00 - 18:00)' },
          evening: { title: 'Evening', time: '(18:00 - 22:00)' },
        },
        actions: {
          complete: 'COMPLETE',
          restore: 'RESTORE',
          remove: 'REMOVE',
          delete: 'DELETE TASK',
        },
        history: {
          title: 'Tasks History',
          subtitle: 'Swipe to restore or remove',
          tip: 'Hold briefly, swipe right to restore a task or swipe left to remove it permanently.',
          deletedBadge: 'Deleted',
        },
        defaults: {
          startToday: 'Today',
          startTomorrow: 'Tomorrow',
          startPick: 'Pick',
          newTaskTitle: 'New task',
          defaultContext: '@work',
        },
        aiPrefix: 'AI:',
      },
      goals: {
        header: {
          title: 'Strategic goals',
          subtitle: 'Forward momentum for financial and personal wins',
        },
        empty: {
          title: 'Create your first goal',
          subtitle:
            'Track milestones, projections, and AI-backed insights once you add your first objective. Use the universal add button to get started.',
        },
        sections: {
          financial: {
            title: 'Financial goals',
            subtitle: 'Investment focus and savings priorities',
          },
          personal: {
            title: 'Personal goals',
            subtitle: 'Lifestyle upgrades and wellness wins',
          },
        },
        cards: {
          summaryLabels: {
            left: 'Left',
            pace: 'Pace',
            prediction: 'Prediction',
          },
          actions: {
            addValue: 'Add value',
            refresh: 'Refresh',
            edit: 'Edit',
            addValueA11y: 'Add value',
            refreshA11y: 'Refresh goal',
            editA11y: 'Edit goal',
            openDetailsA11y: 'Open goal details',
          },
        },
        details: {
          milestones: 'Milestones',
          history: 'History',
          showMore: 'Show more',
        },
        data: {
          'dream-car': {
            title: 'Dream car',
            currentAmount: '4.1M UZS',
            targetAmount: '5M UZS',
            summary: {
              left: '900 000 UZS remaining',
              pace: '450 000 UZS / Mon.',
              prediction: 'On track · March 2025',
            },
            milestones: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'],
            history: [
              { label: 'Dec', delta: '+450 000 UZS' },
              { label: 'Nov', delta: '+320 000 UZS' },
              { label: 'Oct', delta: '+280 000 UZS' },
            ],
            aiTip: 'At the current pace, you will reach your goal in March.',
            aiTipHighlight: 'Increase monthly contributions by 100k to hit February.',
          },
          'emergency-fund': {
            title: 'Emergency fund',
            currentAmount: '3.5M UZS',
            targetAmount: '6M UZS',
            summary: {
              left: '2.5M UZS remaining',
              pace: '300 000 UZS / Mon.',
              prediction: 'Forecast · June 2025',
            },
            milestones: ['Nov 2024', 'Jan 2025', 'Mar 2025', 'Jun 2025'],
            history: [
              { label: 'Dec', delta: '+300 000 UZS' },
              { label: 'Nov', delta: '+300 000 UZS' },
              { label: 'Oct', delta: '+250 000 UZS' },
            ],
            aiTip: 'Adjusting contributions to 350k keeps you inside your comfort buffer.',
          },
          fitness: {
            title: 'Peak fitness plan',
            currentAmount: '92 / 210 sessions',
            targetAmount: '210 sessions',
            summary: {
              left: '118 sessions remaining',
              pace: '4 sessions / Week',
              prediction: 'On track · August 2025',
            },
            milestones: ['Nov 2024', 'Jan 2025', 'Apr 2025', 'Aug 2025'],
            history: [
              { label: 'Week 48', delta: '+4 sessions' },
              { label: 'Week 47', delta: '+5 sessions' },
              { label: 'Week 46', delta: '+3 sessions' },
            ],
            aiTip: 'Consistency is improving. Add one extra cardio day to accelerate results.',
          },
          language: {
            title: 'Spanish language immersion',
            currentAmount: '34 / 50 lessons',
            targetAmount: '50 lessons',
            summary: {
              left: '16 lessons remaining',
              pace: '3 lessons / Week',
              prediction: 'Arriving · February 2025',
            },
            milestones: ['Oct 2024', 'Dec 2024', 'Jan 2025', 'Mar 2025'],
            history: [
              { label: 'Week 48', delta: '+3 lessons' },
              { label: 'Week 47', delta: '+4 lessons' },
              { label: 'Week 46', delta: '+3 lessons' },
            ],
            aiTip: 'Pair each lesson with a 15 min conversational recap to reach fluency sooner.',
          },
        },
      },
      habits: {
        headerTitle: 'Habits',
        badgeSuffix: 'days',
        stats: {
          streak: 'Streak: {days} days straight',
          record: 'Record: {days} days',
          completion: 'Completion: {percent}% ({completed}/{target} weekly)',
        },
        ctas: {
          checkIn: 'Check in today',
          startTimer: 'Start timer',
          completed: 'Completed',
          failed: 'Failed',
          edit: 'Edit',
          delete: 'Delete',
        },
        expand: {
          titles: {
            statistics: 'Statistics',
            pattern: 'Pattern',
            achievements: 'Achievements',
          },
          lines: {
            overallCompletion: 'Overall completion: 156',
            successPercentile: 'Success percentile: 78%',
            averageStreak: 'Average streak: 8 days',
            bestMonth: 'Best month: November (93%)',
            bestTime: 'Best time: 7:00–7:30 (85% success rate)',
            worstTime: 'Worst time: Weekends (45%)',
            afterWeekends: 'After weekends: −30% probability',
          },
          badges: {
            firstWeek: 'First week',
            monthNoBreak: 'Month without break',
            hundredCompletions: '100 completions',
            marathoner: 'Marathoner (42 days straight)',
          },
        },
        data: {
          h1: {
            title: 'Morning workout',
            aiNote: 'Try it in the morning, right after your workout',
          },
          h2: {
            title: 'Meditation',
            aiNote: 'AI: “Try it in the morning, right after your workout”',
          },
          h3: {
            title: 'Reading 30 min',
          },
          h4: {
            title: 'Drink 2l water',
            aiNote: 'New achievement!',
            chips: ['+ 250ml', '+ 500ml', '+ 1l'],
          },
          h5: {
            title: 'Without social networks',
          },
        },
      },
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
        days: { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' },
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
      header: {
        title: 'More',
        profileAction: 'Open profile',
        notificationsAction: 'Notifications',
        badgeLabel: 'Premium',
        dateLabel: '15 March',
      },
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
    profile: {
      title: 'Profile',
      sections: {
        personal: 'Personal info',
        stats: 'Usage stats',
        preferences: 'Public profile',
        actions: 'Account actions',
      },
      fields: {
        fullName: 'Full name',
        email: 'Email',
        phone: 'Phone',
        username: 'Username',
        joined: 'Joined',
        bio: 'About you',
        visibility: 'Profile visibility',
        visibilityOptions: { public: 'Public', friends: 'Friends only', private: 'Private' },
        showLevel: 'Show level badge',
        showAchievements: 'Show achievements',
        showStatistics: 'Show statistics',
      },
      stats: {
        daysWithApp: 'Days with LEORA',
        completedTasks: 'Tasks completed',
        activeTasks: 'Active tasks',
        level: 'Current level',
      },
      xp: {
        label: 'XP progress',
        toNext: '{value} XP to next level',
      },
      buttons: {
        edit: 'Edit profile',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete account',
        logout: 'Log out',
        changePhoto: 'Change photo',
        removePhoto: 'Remove photo',
        confirmDeleteTitle: 'Delete account',
        confirmDeleteMessage: 'This action removes your account and all stored data. Continue?',
        confirmDeleteConfirm: 'Delete',
        confirmDeleteCancel: 'Cancel',
      },
    },
    financeScreens: {
      tabs: {
        review: 'Review',
        accounts: 'Accounts',
        transactions: 'Transactions',
        budgets: 'Budgets',
        analytics: 'Analytics',
        debts: 'Debts',
      },
      review: {
        totalBalance: 'Total balance',
        income: 'Income',
        outcome: 'Outcome',
        monthBalance: 'Balance at the end of the month',
        used: 'Used',
        progress: 'Progress',
        expenseStructure: 'Expense structure',
        recentTransactions: 'Recent transactions',
        seeAll: 'See all',
        importantEvents: 'Important events',
        table: { type: 'Type', amount: 'Amount', date: 'Date' },
      },
      accounts: {
        header: 'My accounts',
        income: 'Income',
        outcome: 'Outcome',
        goalProgress: '{value}% of the goal',
        historyTitle: 'Transaction history',
        historyHeaders: { type: 'Type', amount: 'Amount', time: 'Time' },
        actions: { edit: 'Edit', archive: 'Archive', delete: 'Delete' },
      },
      transactions: {
        header: 'Transactions history',
        details: {
          title: 'Transaction details',
          amount: 'Amount',
          account: 'Account',
          category: 'Category',
          date: 'Date',
          note: 'Note',
          relatedDebt: 'Linked debt',
          close: 'Close',
        },
      },
      budgets: {
        today: "Today's budget overview",
        dateTemplate: 'Budget overview for {date}',
        mainTitle: 'Main budget',
        categoriesTitle: 'Categories',
        addCategory: 'Add category',
        setLimit: 'Set a limit',
        states: { exceeding: 'Exceeding', fixed: 'Fixed', within: 'Within' },
      },
      analytics: {
        header: 'Financial analytics',
        expenseDynamics: 'Expense dynamics',
        comparison: 'Comparison with the previous month',
        topExpenses: 'Top expenses by categories',
        aiInsights: 'AI insights',
        stats: { peak: 'Peak', average: 'Average', trend: 'Trend' },
        comparisonRows: { income: 'Income:', outcome: 'Outcome:', savings: 'Savings:' },
      },
      debts: {
        sections: { incoming: 'Debts', outgoing: 'My debts' },
        timeline: {
          incoming: 'Gives back in',
          outgoing: 'Period',
          today: 'Due today',
          inDays: 'Due in {count} days',
          overdue: '{count} days overdue',
        },
        actions: {
          incoming: { notify: 'Notify', cancel: 'Cancel debt' },
          outgoing: { plan: 'Plan', partial: 'Pay partly' },
        },
        summary: {
          balanceLabel: 'Total balance',
          givenLabel: 'Total given',
          takenLabel: 'Total debt',
          givenChange: '+15% December',
          takenChange: '-8% December',
        },
        modal: {
          title: 'Add new debt',
          editTitle: 'Edit debt',
          subtitle: 'Track money you lend or borrow',
          person: 'Name / Person',
          personPlaceholder: 'Who is this debt for?',
          amount: 'Amount',
          accountLabel: 'Wallet',
          accountHelper: 'Select the wallet involved in this debt',
          accountPickerTitle: 'Select wallet',
          currencyLabel: 'Currency',
          currencyHelper: 'Choose the currency for this debt',
          currencyPickerTitle: 'Select currency',
          dateLabel: 'Date',
          changeDate: 'Change date',
          clear: 'Clear',
          selectAccount: 'Select wallet',
          expectedReturn: 'Expected return date',
          expectedPlaceholder: 'No return date set',
        selectDate: 'Select date',
        note: 'Note',
        notePlaceholder: 'Add optional description or context…',
        toggles: { incoming: 'They owe me', outgoing: 'I owe' },
        manageActions: 'Manage debt',
        buttons: {
          cancel: 'Cancel',
          save: 'Save',
          saveChanges: 'Save',
          delete: 'Delete',
        },
        defaults: { name: 'New debt', description: 'Description', due: 'No period' },
        deleteTitle: 'Delete debt',
        deleteDescription: 'Are you sure you want to delete this debt? This action cannot be undone.',
        status: {
          lent: 'You lent money',
          borrowed: 'You borrowed money',
        },
        scheduleTitle: 'Repayment schedule',
        reminderTitle: 'Notifications',
        reminderToggle: 'Enable notification',
        reminderTimeLabel: 'Reminder time (HH:MM)',
        reminderEnabledLabel: 'Notifications on',
        reminderDisabledLabel: 'Notifications off',
        payment: {
          title: 'Record payment',
          amount: 'Payment amount',
          accountLabel: 'Pay from wallet',
          currencyLabel: 'Payment currency',
          note: 'Payment note',
          helper: 'Track partial repayments and settlements.',
          submit: 'Apply payment',
          limitError: 'Payment exceeds remaining balance',
        },
        actionsBar: {
          pay: 'Pay debt',
          partial: 'Partial payment',
          notify: 'Notification',
          schedule: 'Manage dates',
        },
        fullPaymentTitle: 'Pay debt in full',
        fullPaymentDescription: 'You will settle the entire remaining balance of {amount}.',
        fullPaymentSubmit: 'Pay in full',
      },
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
      insights: 'Инсайт',
      more: 'Ещё',
    },
    plannerScreens: {
      tabs: {
        tasks: 'Задачи',
        goals: 'Цели',
        habits: 'Привычки',
      },
      tasks: {
        headerTemplate: 'Планы на {date}',
        todayLabel: 'сегодня',
        filter: 'Фильтр',
        sectionCountLabel: 'задач',
        sectionTip:
          'Удерживайте и смахните вправо, чтобы отметить выполненной, и влево — чтобы удалить (даже выполненные задачи).',
        sections: {
          morning: { title: 'Утро', time: '(06:00 - 12:00)' },
          afternoon: { title: 'День', time: '(12:00 - 18:00)' },
          evening: { title: 'Вечер', time: '(18:00 - 22:00)' },
        },
        actions: {
          complete: 'ГОТОВО',
          restore: 'ВОССТАНОВИТЬ',
          remove: 'УДАЛИТЬ',
          delete: 'УДАЛИТЬ ЗАДАЧУ',
        },
        history: {
          title: 'История задач',
          subtitle: 'Смахните, чтобы восстановить или удалить',
          tip: 'Удерживайте и смахните вправо, чтобы восстановить задачу, или влево — чтобы удалить навсегда.',
          deletedBadge: 'Удалено',
        },
        defaults: {
          startToday: 'Сегодня',
          startTomorrow: 'Завтра',
          startPick: 'Выбрать',
          newTaskTitle: 'Новая задача',
          defaultContext: '@work',
        },
        aiPrefix: 'ИИ:',
      },
      goals: {
        header: {
          title: 'Стратегические цели',
          subtitle: 'Движение вперёд для финансовых и личных побед',
        },
        empty: {
          title: 'Создайте первую цель',
          subtitle:
            'Отслеживайте этапы, прогнозы и подсказки ИИ, как только добавите первую цель. Нажмите универсальную кнопку добавления, чтобы начать.',
        },
        sections: {
          financial: {
            title: 'Финансовые цели',
            subtitle: 'Фокус на инвестициях и приоритетных накоплениях',
          },
          personal: {
            title: 'Личные цели',
            subtitle: 'Улучшения образа жизни и самочувствия',
          },
        },
        cards: {
          summaryLabels: {
            left: 'Осталось',
            pace: 'Темп',
            prediction: 'Прогноз',
          },
          actions: {
            addValue: 'Добавить вклад',
            refresh: 'Обновить',
            edit: 'Редактировать',
            addValueA11y: 'Добавить вклад',
            refreshA11y: 'Обновить цель',
            editA11y: 'Редактировать цель',
            openDetailsA11y: 'Открыть детали цели',
          },
        },
        details: {
          milestones: 'Этапы',
          history: 'История',
          showMore: 'Показать ещё',
        },
        data: {
          'dream-car': {
            title: 'Машина мечты',
            currentAmount: '4,1 млн сум',
            targetAmount: '5 млн сум',
            summary: {
              left: 'Осталось 900 000 сум',
              pace: '450 000 сум / мес.',
              prediction: 'На пути · март 2025',
            },
            milestones: ['Янв 2025', 'Фев 2025', 'Мар 2025', 'Апр 2025'],
            history: [
              { label: 'Дек', delta: '+450 000 сум' },
              { label: 'Ноя', delta: '+320 000 сум' },
              { label: 'Окт', delta: '+280 000 сум' },
            ],
            aiTip: 'При текущем темпе цель будет достигнута в марте.',
            aiTipHighlight: 'Увеличьте взносы на 100 тыс., чтобы перейти на февральский график.',
          },
          'emergency-fund': {
            title: 'Резервный фонд',
            currentAmount: '3,5 млн сум',
            targetAmount: '6 млн сум',
            summary: {
              left: 'Осталось 2,5 млн сум',
              pace: '300 000 сум / мес.',
              prediction: 'Прогноз · июнь 2025',
            },
            milestones: ['Ноя 2024', 'Янв 2025', 'Мар 2025', 'Июн 2025'],
            history: [
              { label: 'Дек', delta: '+300 000 сум' },
              { label: 'Ноя', delta: '+300 000 сум' },
              { label: 'Окт', delta: '+250 000 сум' },
            ],
            aiTip: 'Взносы по 350 тыс. сохраняют комфортный буфер.',
          },
          fitness: {
            title: 'План пиковой формы',
            currentAmount: '92 / 210 тренировок',
            targetAmount: '210 тренировок',
            summary: {
              left: 'Осталось 118 тренировок',
              pace: '4 тренировки / нед.',
              prediction: 'На пути · август 2025',
            },
            milestones: ['Ноя 2024', 'Янв 2025', 'Апр 2025', 'Авг 2025'],
            history: [
              { label: 'Нед. 48', delta: '+4 тренировки' },
              { label: 'Нед. 47', delta: '+5 тренировок' },
              { label: 'Нед. 46', delta: '+3 тренировки' },
            ],
            aiTip: 'Последовательность растёт. Добавьте ещё один день кардио для ускорения.',
          },
          language: {
            title: 'Испанское погружение',
            currentAmount: '34 / 50 уроков',
            targetAmount: '50 уроков',
            summary: {
              left: 'Осталось 16 уроков',
              pace: '3 урока / нед.',
              prediction: 'Прибытие · февраль 2025',
            },
            milestones: ['Окт 2024', 'Дек 2024', 'Янв 2025', 'Мар 2025'],
            history: [
              { label: 'Нед. 48', delta: '+3 урока' },
              { label: 'Нед. 47', delta: '+4 урока' },
              { label: 'Нед. 46', delta: '+3 урока' },
            ],
            aiTip: 'Закрепляйте каждый урок 15-минутным разговором, чтобы быстрее выйти на беглость.',
          },
        },
      },
      habits: {
        headerTitle: 'Привычки',
        badgeSuffix: 'дн.',
        stats: {
          streak: 'Серия: {days} дн. подряд',
          record: 'Рекорд: {days} дн.',
          completion: 'Выполнение: {percent}% ({completed}/{target} в неделю)',
        },
        ctas: {
          checkIn: 'Отметиться сегодня',
          startTimer: 'Запустить таймер',
          completed: 'Выполнено',
          failed: 'Не удалось',
          edit: 'Редактировать',
          delete: 'Удалить',
        },
        expand: {
          titles: {
            statistics: 'Статистика',
            pattern: 'Паттерны',
            achievements: 'Достижения',
          },
          lines: {
            overallCompletion: 'Общее выполнение: 156',
            successPercentile: 'Процентиль успеха: 78%',
            averageStreak: 'Средняя серия: 8 дн.',
            bestMonth: 'Лучший месяц: ноябрь (93%)',
            bestTime: 'Лучшее время: 7:00–7:30 (85% успеха)',
            worstTime: 'Худшее время: выходные (45%)',
            afterWeekends: 'После выходных: −30% вероятность',
          },
          badges: {
            firstWeek: 'Первая неделя',
            monthNoBreak: 'Месяц без перерывов',
            hundredCompletions: '100 выполнений',
            marathoner: 'Марафонец (42 дня подряд)',
          },
        },
        data: {
          h1: {
            title: 'Утренние тренировки',
            aiNote: 'Попробуйте утром, сразу после разминки',
          },
          h2: {
            title: 'Медитация',
            aiNote: 'ИИ: «Попробуйте утром, сразу после разминки»',
          },
          h3: {
            title: 'Чтение 30 мин',
          },
          h4: {
            title: 'Выпивать 2 л воды',
            aiNote: 'Новое достижение!',
            chips: ['+ 250 мл', '+ 500 мл', '+ 1 л'],
          },
          h5: {
            title: 'Без соцсетей',
          },
        },
      },
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
        days: { mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт' },
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
      header: {
        title: 'Ещё',
        profileAction: 'Открыть профиль',
        notificationsAction: 'Уведомления',
        badgeLabel: 'Премиум',
        dateLabel: '15 марта',
      },
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
    profile: {
      title: 'Профиль',
      sections: {
        personal: 'Личные данные',
        stats: 'Статистика использования',
        preferences: 'Публичный профиль',
        actions: 'Действия с аккаунтом',
      },
      fields: {
        fullName: 'Имя',
        email: 'Email',
        phone: 'Телефон',
        username: 'Имя пользователя',
        joined: 'С нами с',
        bio: 'О себе',
        visibility: 'Видимость профиля',
        visibilityOptions: { public: 'Публичный', friends: 'Только друзья', private: 'Приватный' },
        showLevel: 'Показывать уровень',
        showAchievements: 'Показывать достижения',
        showStatistics: 'Показывать статистику',
      },
      stats: {
        daysWithApp: 'Дней с LEORA',
        completedTasks: 'Задач выполнено',
        activeTasks: 'Активные задачи',
        level: 'Текущий уровень',
      },
      xp: {
        label: 'Прогресс XP',
        toNext: '{value} XP до нового уровня',
      },
      buttons: {
        edit: 'Редактировать профиль',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить аккаунт',
        logout: 'Выйти',
        changePhoto: 'Сменить фото',
        removePhoto: 'Удалить фото',
        confirmDeleteTitle: 'Удаление аккаунта',
        confirmDeleteMessage: 'Все данные будут удалены без возможности восстановления. Продолжить?',
        confirmDeleteConfirm: 'Удалить',
        confirmDeleteCancel: 'Отмена',
      },
    },
    financeScreens: {
      tabs: {
        review: 'Обзор',
        accounts: 'Счета',
        transactions: 'Транзакции',
        budgets: 'Бюджеты',
        analytics: 'Аналитика',
        debts: 'Долги',
      },
      review: {
        totalBalance: 'Общий баланс',
        income: 'Доход',
        outcome: 'Расход',
        monthBalance: 'Баланс на конец месяца',
        used: 'Использовано',
        progress: 'Прогресс',
        expenseStructure: 'Структура расходов',
        recentTransactions: 'Последние транзакции',
        seeAll: 'Показать все',
        importantEvents: 'Важные события',
        table: { type: 'Тип', amount: 'Сумма', date: 'Дата' },
      },
      accounts: {
        header: 'Мои счета',
        income: 'Доход',
        outcome: 'Расход',
        goalProgress: '{value}% от цели',
        historyTitle: 'История транзакций',
        historyHeaders: { type: 'Тип', amount: 'Сумма', time: 'Время' },
        actions: { edit: 'Изменить', archive: 'Архивировать', delete: 'Удалить' },
      },
      transactions: {
        header: 'История транзакций',
        details: {
          title: 'Детали транзакции',
          amount: 'Сумма',
          account: 'Счёт',
          category: 'Категория',
          date: 'Дата',
          note: 'Заметка',
          relatedDebt: 'Связанный долг',
          close: 'Закрыть',
        },
      },
      budgets: {
        today: 'Обзор бюджета на сегодня',
        dateTemplate: 'Обзор бюджета за {date}',
        mainTitle: 'Главный бюджет',
        categoriesTitle: 'Категории',
        addCategory: 'Добавить категорию',
        setLimit: 'Установить лимит',
        states: { exceeding: 'Превышение', fixed: 'Фиксировано', within: 'В пределах' },
      },
      analytics: {
        header: 'Финансовая аналитика',
        expenseDynamics: 'Динамика расходов',
        comparison: 'Сравнение с прошлым месяцем',
        topExpenses: 'Топ расходов по категориям',
        aiInsights: 'AI‑инсайты',
        stats: { peak: 'Пик', average: 'Среднее', trend: 'Тренд' },
        comparisonRows: { income: 'Доход:', outcome: 'Расход:', savings: 'Сбережения:' },
      },
      debts: {
        sections: { incoming: 'Долги', outgoing: 'Мои долги' },
        timeline: {
          incoming: 'Вернёт через',
          outgoing: 'Период',
          today: 'Срок сегодня',
          inDays: 'Через {count} дней',
          overdue: 'Просрочено на {count} дней',
        },
        actions: {
          incoming: { notify: 'Напомнить', cancel: 'Отменить долг' },
          outgoing: { plan: 'Запланировать', partial: 'Оплатить частично' },
        },
        summary: {
          balanceLabel: 'Общий баланс',
          givenLabel: 'Выдано',
          takenLabel: 'Общий долг',
          givenChange: '+15% в декабре',
          takenChange: '-8% в декабре',
        },
        modal: {
          title: 'Добавить долг',
          editTitle: 'Редактировать долг',
          subtitle: 'Отслеживайте занятые и одолженные суммы',
          person: 'Имя / Человек',
          personPlaceholder: 'Для кого этот долг?',
          amount: 'Сумма',
          accountLabel: 'Кошелёк',
          accountHelper: 'Выберите счёт для этой операции',
          accountPickerTitle: 'Выберите кошелёк',
          currencyLabel: 'Валюта',
          currencyHelper: 'Укажите валюту долга',
          currencyPickerTitle: 'Выберите валюту',
          dateLabel: 'Дата',
          changeDate: 'Изменить дату',
          clear: 'Очистить',
          selectAccount: 'Выберите кошелёк',
          expectedReturn: 'Ожидаемая дата возврата',
          expectedPlaceholder: 'Дата возврата не установлена',
          selectDate: 'Выберите дату',
          note: 'Заметка',
          notePlaceholder: 'Добавьте описание или детали…',
          toggles: { incoming: 'Мне должны', outgoing: 'Я должен' },
          manageActions: 'Управление долгом',
          buttons: {
            cancel: 'Отмена',
            save: 'Сохранить',
            saveChanges: 'Сохранить',
            delete: 'Удалить',
          },
          defaults: { name: 'Новый долг', description: 'Описание', due: 'Без срока' },
          deleteTitle: 'Удалить долг',
          deleteDescription: 'Вы уверены, что хотите удалить этот долг? Действие нельзя отменить.',
        status: {
          lent: 'Вы одолжили деньги',
          borrowed: 'Вы заняли деньги',
        },
        scheduleTitle: 'График погашения',
        reminderTitle: 'Уведомления',
        reminderToggle: 'Включить уведомление',
        reminderTimeLabel: 'Время напоминания (HH:MM)',
        reminderEnabledLabel: 'Уведомления включены',
        reminderDisabledLabel: 'Уведомления выключены',
        payment: {
          title: 'Записать платеж',
          amount: 'Сумма платежа',
          accountLabel: 'С какого кошелька',
          currencyLabel: 'Валюта платежа',
          note: 'Заметка к платежу',
          helper: 'Используйте для частичных погашений и списаний.',
          submit: 'Применить платеж',
          limitError: 'Сумма превышает остаток долга',
        },
        actionsBar: {
          pay: 'Погасить долг',
          partial: 'Частичный платеж',
          notify: 'Уведомление',
          schedule: 'Управление датами',
        },
        fullPaymentTitle: 'Полностью погасить долг',
        fullPaymentDescription: 'Вы погасите всю оставшуюся сумму {amount}.',
        fullPaymentSubmit: 'Оплатить полностью',
      },
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
      insights: 'Insayt',
      more: 'Ko‘proq',
    },
    plannerScreens: {
      tabs: {
        tasks: 'Vazifalar',
        goals: 'Maqsadlar',
        habits: 'Odatlar',
      },
      tasks: {
        headerTemplate: '{date} uchun rejalar',
        todayLabel: 'bugun',
        filter: 'Filtr',
        sectionCountLabel: 'vazifa',
        sectionTip:
          'Qisqa bosib, o‘ngga suring — bajarildi, chapga suring — o‘chirib tashlash (hatto bajarilganlari ham).',
        sections: {
          morning: { title: 'Tong', time: '(06:00 - 12:00)' },
          afternoon: { title: 'Kunduzi', time: '(12:00 - 18:00)' },
          evening: { title: 'Kechqurun', time: '(18:00 - 22:00)' },
        },
        actions: {
          complete: 'BAJARILDI',
          restore: 'QAYTARISH',
          remove: 'O‘CHIRISH',
          delete: 'VAZIFANI O‘CHIRISH',
        },
        history: {
          title: 'Vazifalar tarixi',
          subtitle: 'Qaytarish yoki o‘chirish uchun suring',
          tip: 'Qisqa bosib, o‘ngga suring — vazifani qaytaring, chapga suring — butunlay o‘chiring.',
          deletedBadge: 'O‘chirildi',
        },
        defaults: {
          startToday: 'Bugun',
          startTomorrow: 'Ertaga',
          startPick: 'Tanlash',
          newTaskTitle: 'Yangi vazifa',
          defaultContext: '@work',
        },
        aiPrefix: 'AI:',
      },
      goals: {
        header: {
          title: 'Strategik maqsadlar',
          subtitle: 'Moliya va shaxsiy g‘alabalar uchun barqaror harakat',
        },
        empty: {
          title: 'Birinchi maqsadni yarating',
          subtitle:
            'Maqsad qo‘shgach, bosqichlar, prognozlar va AI tavsiyalarini kuzatishingiz mumkin. Boshlash uchun qo‘shish tugmasidan foydalaning.',
        },
        sections: {
          financial: {
            title: 'Moliyaviy maqsadlar',
            subtitle: 'Investitsiya va jamg‘arma ustuvorliklari',
          },
          personal: {
            title: 'Shaxsiy maqsadlar',
            subtitle: 'Hayot tarzi va farovonlik yutuqlari',
          },
        },
        cards: {
          summaryLabels: {
            left: 'Qoldi',
            pace: 'Surʼat',
            prediction: 'Prognoz',
          },
          actions: {
            addValue: 'Qiymat qo‘shish',
            refresh: 'Yangilash',
            edit: 'Tahrirlash',
            addValueA11y: 'Qiymat qo‘shish',
            refreshA11y: 'Maqsadni yangilash',
            editA11y: 'Maqsadni tahrirlash',
            openDetailsA11y: 'Maqsad tafsilotlarini ochish',
          },
        },
        details: {
          milestones: 'Bosqichlar',
          history: 'Tarix',
          showMore: 'Ko‘proq ko‘rsat',
        },
        data: {
          'dream-car': {
            title: 'Orzu mashinam',
            currentAmount: '4,1 mln so‘m',
            targetAmount: '5 mln so‘m',
            summary: {
              left: '900 000 so‘m qoldi',
              pace: '450 000 so‘m / oy',
              prediction: 'Jadvalda · mart 2025',
            },
            milestones: ['Yan 2025', 'Fev 2025', 'Mar 2025', 'Apr 2025'],
            history: [
              { label: 'Dek', delta: '+450 000 so‘m' },
              { label: 'Noy', delta: '+320 000 so‘m' },
              { label: 'Okt', delta: '+280 000 so‘m' },
            ],
            aiTip: 'Joriy surʼat bilan maqsad mart oyida bajariladi.',
            aiTipHighlight: 'Fevralga ulgurish uchun oyiga yana 100 ming qo‘shing.',
          },
          'emergency-fund': {
            title: 'Favqulodda jamg‘arma',
            currentAmount: '3,5 mln so‘m',
            targetAmount: '6 mln so‘m',
            summary: {
              left: '2,5 mln so‘m qoldi',
              pace: '300 000 so‘m / oy',
              prediction: 'Prognoz · iyun 2025',
            },
            milestones: ['Noy 2024', 'Yan 2025', 'Mar 2025', 'Iyun 2025'],
            history: [
              { label: 'Dek', delta: '+300 000 so‘m' },
              { label: 'Noy', delta: '+300 000 so‘m' },
              { label: 'Okt', delta: '+250 000 so‘m' },
            ],
            aiTip: '350 minglik badallar xavfsiz buferni saqlab turadi.',
          },
          fitness: {
            title: 'Eng yuqori forma rejasi',
            currentAmount: '92 / 210 mashg‘ulot',
            targetAmount: '210 mashg‘ulot',
            summary: {
              left: '118 mashg‘ulot qoldi',
              pace: 'Haftasiga 4 ta mashg‘ulot',
              prediction: 'Jadvalda · avgust 2025',
            },
            milestones: ['Noy 2024', 'Yan 2025', 'Apr 2025', 'Avg 2025'],
            history: [
              { label: 'Hafta 48', delta: '+4 mashg‘ulot' },
              { label: 'Hafta 47', delta: '+5 mashg‘ulot' },
              { label: 'Hafta 46', delta: '+3 mashg‘ulot' },
            ],
            aiTip: 'Barqarorlik oshmoqda. Natijani tezlashtirish uchun bir kun kardio qo‘shing.',
          },
          language: {
            title: 'Ispan tili immersioni',
            currentAmount: '34 / 50 dars',
            targetAmount: '50 dars',
            summary: {
              left: '16 dars qoldi',
              pace: 'Haftasiga 3 dars',
              prediction: 'Kutilmoqda · fevral 2025',
            },
            milestones: ['Okt 2024', 'Dek 2024', 'Yan 2025', 'Mar 2025'],
            history: [
              { label: 'Hafta 48', delta: '+3 dars' },
              { label: 'Hafta 47', delta: '+4 dars' },
              { label: 'Hafta 46', delta: '+3 dars' },
            ],
            aiTip: 'Har bir darsni 15 daqiqalik suhbat bilan mustahkamlang — tezroq ravonlikka erishasiz.',
          },
        },
      },
      habits: {
        headerTitle: 'Odatlar',
        badgeSuffix: 'kun',
        stats: {
          streak: 'Seriya: {days} kun ketma-ket',
          record: 'Rekord: {days} kun',
          completion: 'Bajarilish: {percent}% ({completed}/{target} haftalik)',
        },
        ctas: {
          checkIn: 'Bugun belgilash',
          startTimer: 'Taymerni boshlash',
          completed: 'Bajarildi',
          failed: 'Bajarilmadi',
          edit: 'Tahrirlash',
          delete: 'O‘chirish',
        },
        expand: {
          titles: {
            statistics: 'Statistika',
            pattern: 'Namunalar',
            achievements: 'Yutuqlar',
          },
          lines: {
            overallCompletion: 'Umumiy bajarilish: 156',
            successPercentile: 'Muvaffaqiyat foizi: 78%',
            averageStreak: 'O‘rtacha seriya: 8 kun',
            bestMonth: 'Eng yaxshi oy: noyabr (93%)',
            bestTime: 'Eng yaxshi vaqt: 7:00–7:30 (85% muvaffaqiyat)',
            worstTime: 'Eng yomon vaqt: dam olish kunlari (45%)',
            afterWeekends: 'Dam olishdan keyin: −30% ehtimol',
          },
          badges: {
            firstWeek: 'Birinchi hafta',
            monthNoBreak: 'Bir oy tanaffussiz',
            hundredCompletions: '100 marta bajarildi',
            marathoner: 'Marafonchi (42 kun ketma-ket)',
          },
        },
        data: {
          h1: {
            title: 'Tonggi mashg‘ulot',
            aiNote: 'Mashg‘ulotdan keyin tongda bajarib ko‘ring',
          },
          h2: {
            title: 'Meditatsiya',
            aiNote: 'AI: "Mashg‘ulotdan keyin tongda bajarib ko‘ring"',
          },
          h3: {
            title: '30 daqiqa o‘qish',
          },
          h4: {
            title: 'Kuniga 2 l suv ichish',
            aiNote: 'Yangi yutuq!',
            chips: ['+ 250 ml', '+ 500 ml', '+ 1 l'],
          },
          h5: {
            title: 'Ijtimoiy tarmoqsiz',
          },
        },
      },
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
        days: { mon: 'Du', tue: 'Se', wed: 'Chor', thu: 'Pay', fri: 'Ju' },
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
      header: {
        title: 'Ko‘proq',
        profileAction: 'Profilni ochish',
        notificationsAction: 'Bildirishnomalar',
        badgeLabel: 'Premium',
        dateLabel: '15 mart',
      },
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
    profile: {
      title: 'Profil',
      sections: {
        personal: 'Shaxsiy maʼlumotlar',
        stats: 'Foydalanish statistikasi',
        preferences: 'Ochiq profil',
        actions: 'Amallar',
      },
      fields: {
        fullName: 'Ism familiya',
        email: 'Email',
        phone: 'Telefon',
        username: 'Taxallus',
        joined: 'Qo‘shilgan sana',
        bio: 'Qisqacha maʼlumot',
        visibility: 'Profil ko‘rinishi',
        visibilityOptions: { public: 'Ochiq', friends: 'Faqat do‘stlar', private: 'Yopiq' },
        showLevel: 'Daraja nishonini ko‘rsatish',
        showAchievements: 'Yutuqlarni ko‘rsatish',
        showStatistics: 'Statistikani ko‘rsatish',
      },
      stats: {
        daysWithApp: 'LEORA bilan kunlar',
        completedTasks: 'Bajargan vazifalar',
        activeTasks: 'Faol vazifalar',
        level: 'Joriy daraja',
      },
      xp: {
        label: 'XP jarayoni',
        toNext: 'Keyingi darajaga {value} XP',
      },
      buttons: {
        edit: 'Profilni tahrirlash',
        save: 'Saqlash',
        cancel: 'Bekor qilish',
        delete: 'Akkauntni o‘chirish',
        logout: 'Chiqish',
        changePhoto: 'Rasmni almashtirish',
        removePhoto: 'Rasmni o‘chirish',
        confirmDeleteTitle: 'Akkauntni o‘chirish',
        confirmDeleteMessage: 'Barcha maʼlumotlar butunlay o‘chiriladi. Davom etasizmi?',
        confirmDeleteConfirm: 'O‘chirish',
        confirmDeleteCancel: 'Bekor qilish',
      },
    },
    financeScreens: {
      tabs: {
        review: 'Umumiy',
        accounts: 'Hisoblar',
        transactions: 'Tranzaksiyalar',
        budgets: 'Byudjetlar',
        analytics: 'Analitika',
        debts: 'Qarzlar',
      },
      review: {
        totalBalance: 'Umumiy balans',
        income: 'Daromad',
        outcome: 'Xarajat',
        monthBalance: 'Oyning oxiridagi balans',
        used: 'Sarflandi',
        progress: 'Jarayon',
        expenseStructure: 'Xarajatlar tuzilmasi',
        recentTransactions: 'So‘nggi tranzaksiyalar',
        seeAll: 'Hammasini ko‘rish',
        importantEvents: 'Muhim hodisalar',
        table: { type: 'Turi', amount: 'Summasi', date: 'Sana' },
      },
      accounts: {
        header: 'Hisoblarim',
        income: 'Daromad',
        outcome: 'Xarajat',
        goalProgress: '{value}% maqsaddan',
        historyTitle: 'Tranzaksiya tarixi',
        historyHeaders: { type: 'Turi', amount: 'Summasi', time: 'Vaqti' },
        actions: { edit: 'Tahrirlash', archive: 'Arxivlash', delete: 'O‘chirish' },
      },
      transactions: {
        header: 'Tranzaksiyalar tarixi',
        details: {
          title: 'Tranzaksiya tafsilotlari',
          amount: 'Summasi',
          account: 'Hisob',
          category: 'Kategoriya',
          date: 'Sana',
          note: 'Izoh',
          relatedDebt: 'Bog‘langan qarz',
          close: 'Yopish',
        },
      },
      budgets: {
        today: 'Bugungi byudjet sharhi',
        dateTemplate: '{date} uchun byudjet sharhi',
        mainTitle: 'Asosiy byudjet',
        categoriesTitle: 'Kategoriyalar',
        addCategory: 'Kategoriya qo‘shish',
        setLimit: 'Limit qo‘yish',
        states: { exceeding: 'Limitdan oshgan', fixed: 'Belgilangan', within: 'Doirada' },
      },
      analytics: {
        header: 'Moliyaviy analitika',
        expenseDynamics: 'Xarajatlar dinamikasi',
        comparison: 'O‘tgan oy bilan taqqoslash',
        topExpenses: 'Kategoriyalar bo‘yicha top xarajatlar',
        aiInsights: 'AI tavsiyalari',
        stats: { peak: 'Pik', average: 'O‘rtacha', trend: 'Trend' },
        comparisonRows: { income: 'Daromad:', outcome: 'Xarajat:', savings: 'Jamg‘arma:' },
      },
      debts: {
        sections: { incoming: 'Qarzlar', outgoing: 'Mening qarzlarim' },
        timeline: {
          incoming: 'Qaytarish muddati',
          outgoing: 'Davr',
          today: 'Bugun qaytariladi',
          inDays: '{count} kun ichida qaytariladi',
          overdue: '{count} kun kechikkan',
        },
        actions: {
          incoming: { notify: 'Eslatish', cancel: 'Qarzdan voz kechish' },
          outgoing: { plan: 'Rejalashtirish', partial: 'Qisman to‘lash' },
        },
        summary: {
          balanceLabel: 'Umumiy balans',
          givenLabel: 'Berilgan qarz',
          takenLabel: 'Umumiy qarz',
          givenChange: '+15% Dekabr',
          takenChange: '-8% Dekabr',
        },
        modal: {
          title: 'Yangi qarz qo‘shish',
          editTitle: 'Qarzlarni tahrirlash',
          subtitle: 'Olingan va berilgan qarzlarni kuzating',
          person: 'Ism / Shaxs',
          personPlaceholder: 'Bu qarz kim uchun?',
          amount: 'Summasi',
          accountLabel: 'Hamyon',
          accountHelper: 'Qaysi hisobdan mablag‘ olinadi',
          accountPickerTitle: 'Hamyonni tanlang',
          currencyLabel: 'Valyuta',
          currencyHelper: 'Qarz valyutasini tanlang',
          currencyPickerTitle: 'Valyutani tanlang',
          dateLabel: 'Sana',
          changeDate: 'Sana o‘zgartirish',
          clear: 'Bekor qilish',
          selectAccount: 'Hisobni tanlang',
          expectedReturn: 'Qaytarish sanasi',
          expectedPlaceholder: 'Qaytarish sanasi belgilanmagan',
          selectDate: 'Sana tanlang',
          note: 'Izoh',
          notePlaceholder: 'Qo‘shimcha izoh yoki tafsilot kiriting…',
          toggles: { incoming: 'Menga qarzdor', outgoing: 'Men qarzdorman' },
          manageActions: 'Qarzni boshqarish',
          buttons: {
            cancel: 'Bekor qilish',
            save: 'Saqlash',
            saveChanges: 'Saqlash',
            delete: 'O‘chirish',
          },
          defaults: { name: 'Yangi qarz', description: 'Tavsif', due: 'Muddat belgilanmagan' },
          deleteTitle: 'Qarzlarni o‘chirish',
          deleteDescription: 'Bu qarzni o‘chirib tashlamoqchimisiz? Bu amalni qaytarib bo‘lmaydi.',
        status: {
          lent: 'Siz qarz berdingiz',
          borrowed: 'Siz qarz oldingiz',
        },
        scheduleTitle: 'To‘lov jadvali',
        reminderTitle: 'Bildirishnomalar',
        reminderToggle: 'Bildirishnomani yoqish',
        reminderTimeLabel: 'Bildirish vaqti (HH:MM)',
        reminderEnabledLabel: 'Bildirishnomalar yoqilgan',
        reminderDisabledLabel: 'Bildirishnomalar o‘chirilgan',
        payment: {
          title: 'To‘lovni qayd etish',
          amount: 'To‘lov summasi',
          accountLabel: 'Qaysi hisobdan',
          currencyLabel: 'To‘lov valyutasi',
          note: 'To‘lov izohi',
          helper: 'Qisman to‘lov va yopishlarni kuzatish uchun.',
          submit: 'To‘lovni qo‘llash',
          limitError: 'To‘lov miqdori qarz qoldig‘idan oshib ketdi',
        },
        actionsBar: {
          pay: 'Qarzni to‘lash',
          partial: 'Qisman to‘lov',
          notify: 'Bildirishnoma',
          schedule: 'Sanalarni boshqarish',
        },
        fullPaymentTitle: 'Qarzini to‘liq to‘lash',
        fullPaymentDescription: 'Qolgan {amount} summa to‘liq yopiladi.',
        fullPaymentSubmit: 'To‘liq to‘lash',
      },
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
      insights: 'إنسايت',
      more: 'المزيد',
    },
    plannerScreens: {
      tabs: {
        tasks: 'المهام',
        goals: 'الأهداف',
        habits: 'العادات',
      },
      tasks: {
        headerTemplate: 'خطط لـ {date}',
        todayLabel: 'اليوم',
        filter: 'تصفية',
        sectionCountLabel: 'مهام',
        sectionTip:
          'اضغط مطولاً ثم اسحب لليمين لوضع علامة منجزة، أو لليسار للحذف (حتى المهام المكتملة).',
        sections: {
          morning: { title: 'الصباح', time: '(06:00 - 12:00)' },
          afternoon: { title: 'بعد الظهر', time: '(12:00 - 18:00)' },
          evening: { title: 'المساء', time: '(18:00 - 22:00)' },
        },
        actions: {
          complete: 'إكمال',
          restore: 'استعادة',
          remove: 'حذف',
          delete: 'حذف المهمة',
        },
        history: {
          title: 'سجل المهام',
          subtitle: 'اسحب للاستعادة أو الحذف',
          tip: 'اضغط قليلاً ثم اسحب لليمين لاستعادة المهمة أو لليسار لحذفها نهائياً.',
          deletedBadge: 'تم الحذف',
        },
        defaults: {
          startToday: 'اليوم',
          startTomorrow: 'غداً',
          startPick: 'اختيار',
          newTaskTitle: 'مهمة جديدة',
          defaultContext: '@work',
        },
        aiPrefix: 'الذكاء الاصطناعي:',
      },
      goals: {
        header: {
          title: 'أهداف استراتيجية',
          subtitle: 'زخم مستمر للنجاحات المالية والشخصية',
        },
        empty: {
          title: 'أنشئ هدفك الأول',
          subtitle:
            'تابع المراحل والتوقعات ورؤى الذكاء الاصطناعي بعد إضافة الهدف الأول. استخدم زر الإضافة للبدء.',
        },
        sections: {
          financial: {
            title: 'أهداف مالية',
            subtitle: 'تركيز على الاستثمار وأولويات الادخار',
          },
          personal: {
            title: 'أهداف شخصية',
            subtitle: 'ترقيات نمط الحياة ونجاحات العافية',
          },
        },
        cards: {
          summaryLabels: {
            left: 'متبقٍ',
            pace: 'الوتيرة',
            prediction: 'التوقع',
          },
          actions: {
            addValue: 'إضافة تقدم',
            refresh: 'تحديث',
            edit: 'تحرير',
            addValueA11y: 'إضافة تقدم',
            refreshA11y: 'تحديث الهدف',
            editA11y: 'تحرير الهدف',
            openDetailsA11y: 'فتح تفاصيل الهدف',
          },
        },
        details: {
          milestones: 'المعالم',
          history: 'السجل',
          showMore: 'عرض المزيد',
        },
        data: {
          'dream-car': {
            title: 'سيارة الأحلام',
            currentAmount: '4.1 مليون سوم',
            targetAmount: '5 مليون سوم',
            summary: {
              left: 'متبقٍ 900 000 سوم',
              pace: '450 000 سوم / شهر',
              prediction: 'على المسار · مارس 2025',
            },
            milestones: ['ينا 2025', 'فبر 2025', 'مارس 2025', 'أبريل 2025'],
            history: [
              { label: 'ديس', delta: '+450 000 سوم' },
              { label: 'نوف', delta: '+320 000 سوم' },
              { label: 'أكت', delta: '+280 000 سوم' },
            ],
            aiTip: 'بالوتيرة الحالية ستصل إلى الهدف في مارس.',
            aiTipHighlight: 'زد المساهمة الشهرية 100 ألف لتحقق فبراير.',
          },
          'emergency-fund': {
            title: 'صندوق الطوارئ',
            currentAmount: '3.5 مليون سوم',
            targetAmount: '6 مليون سوم',
            summary: {
              left: 'متبقٍ 2.5 مليون سوم',
              pace: '300 000 سوم / شهر',
              prediction: 'توقع · يونيو 2025',
            },
            milestones: ['نوف 2024', 'ينا 2025', 'مارس 2025', 'يونيو 2025'],
            history: [
              { label: 'ديس', delta: '+300 000 سوم' },
              { label: 'نوف', delta: '+300 000 سوم' },
              { label: 'أكت', delta: '+250 000 سوم' },
            ],
            aiTip: 'رفع المساهمة إلى 350 ألف يحافظ على هامش الأمان.',
          },
          fitness: {
            title: 'خطة لياقة قصوى',
            currentAmount: '92 / 210 حصة',
            targetAmount: '210 حصة',
            summary: {
              left: 'متبقٍ 118 حصة',
              pace: '4 حصص / أسبوع',
              prediction: 'على المسار · أغسطس 2025',
            },
            milestones: ['نوف 2024', 'ينا 2025', 'أبريل 2025', 'أغسطس 2025'],
            history: [
              { label: 'أسبوع 48', delta: '+4 حصص' },
              { label: 'أسبوع 47', delta: '+5 حصص' },
              { label: 'أسبوع 46', delta: '+3 حصص' },
            ],
            aiTip: 'الالتزام يتحسن. أضف يوم كارديو إضافي لنتائج أسرع.',
          },
          language: {
            title: 'انغماس اللغة الإسبانية',
            currentAmount: '34 / 50 درساً',
            targetAmount: '50 درساً',
            summary: {
              left: 'متبقٍ 16 درساً',
              pace: '3 دروس / أسبوع',
              prediction: 'الوصول · فبراير 2025',
            },
            milestones: ['أكتوبر 2024', 'ديسمبر 2024', 'ينا 2025', 'مارس 2025'],
            history: [
              { label: 'أسبوع 48', delta: '+3 دروس' },
              { label: 'أسبوع 47', delta: '+4 دروس' },
              { label: 'أسبوع 46', delta: '+3 دروس' },
            ],
            aiTip: 'أضف ملخصاً حوارياً لمدة 15 دقيقة بعد كل درس لبلوغ الطلاقة أسرع.',
          },
        },
      },
      habits: {
        headerTitle: 'العادات',
        badgeSuffix: 'يوم',
        stats: {
          streak: 'سلسلة: {days} يوم متتالٍ',
          record: 'أفضل رقم: {days} يوم',
          completion: 'نسبة الإتمام: {percent}% ({completed}/{target} أسبوعياً)',
        },
        ctas: {
          checkIn: 'سجل اليوم',
          startTimer: 'ابدأ المؤقت',
          completed: 'مكتمل',
          failed: 'لم يكتمل',
          edit: 'تحرير',
          delete: 'حذف',
        },
        expand: {
          titles: {
            statistics: 'إحصائيات',
            pattern: 'أنماط',
            achievements: 'إنجازات',
          },
          lines: {
            overallCompletion: 'إجمالي الإتمام: 156',
            successPercentile: 'نسبة النجاح: 78%',
            averageStreak: 'متوسط السلسلة: 8 أيام',
            bestMonth: 'أفضل شهر: نوفمبر (93%)',
            bestTime: 'أفضل وقت: 7:00–7:30 (نجاح 85%)',
            worstTime: 'أسوأ وقت: عطلة نهاية الأسبوع (45%)',
            afterWeekends: 'بعد العطلات: احتمال −30%',
          },
          badges: {
            firstWeek: 'الأسبوع الأول',
            monthNoBreak: 'شهر بلا انقطاع',
            hundredCompletions: '100 إتمام',
            marathoner: 'ماراثوني (42 يوماً متتالياً)',
          },
        },
        data: {
          h1: {
            title: 'تمارين الصباح',
            aiNote: 'جرّبها صباحاً مباشرة بعد التمرين',
          },
          h2: {
            title: 'تأمل',
            aiNote: 'الذكاء الاصطناعي: "جرّبها صباحاً مباشرة بعد التمرين"',
          },
          h3: {
            title: 'قراءة 30 دقيقة',
          },
          h4: {
            title: 'اشرب 2 لتر ماء',
            aiNote: 'إنجاز جديد!',
            chips: ['+ 250 مل', '+ 500 مل', '+ 1 لتر'],
          },
          h5: {
            title: 'من دون شبكات اجتماعية',
          },
        },
      },
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
        days: { mon: 'الإثنين', tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة' },
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
      header: {
        title: 'المزيد',
        profileAction: 'افتح الملف الشخصي',
        notificationsAction: 'الإشعارات',
        badgeLabel: 'مميز',
        dateLabel: '15 مارس',
      },
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
    profile: {
      title: 'الملف الشخصي',
      sections: {
        personal: 'المعلومات الشخصية',
        stats: 'إحصائيات الاستخدام',
        preferences: 'الملف العام',
        actions: 'إجراءات الحساب',
      },
      fields: {
        fullName: 'الاسم الكامل',
        email: 'البريد الإلكتروني',
        phone: 'رقم الهاتف',
        username: 'اسم المستخدم',
        joined: 'تاريخ الانضمام',
        bio: 'نبذة مختصرة',
        visibility: 'خصوصية الملف',
        visibilityOptions: { public: 'عام', friends: 'الأصدقاء فقط', private: 'خاص' },
        showLevel: 'إظهار شارة المستوى',
        showAchievements: 'إظهار الإنجازات',
        showStatistics: 'إظهار الإحصائيات',
      },
      stats: {
        daysWithApp: 'أيام مع LEORA',
        completedTasks: 'المهام المكتملة',
        activeTasks: 'المهام النشطة',
        level: 'المستوى الحالي',
      },
      xp: {
        label: 'تقدم نقاط XP',
        toNext: '{value} نقطة للوصول إلى المستوى التالي',
      },
      buttons: {
        edit: 'تعديل الملف',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف الحساب',
        logout: 'تسجيل الخروج',
        changePhoto: 'تغيير الصورة',
        removePhoto: 'إزالة الصورة',
        confirmDeleteTitle: 'حذف الحساب',
        confirmDeleteMessage: 'سيتم حذف جميع بياناتك نهائياً. هل تريد المتابعة؟',
        confirmDeleteConfirm: 'حذف',
        confirmDeleteCancel: 'إلغاء',
      },
    },
    financeScreens: {
      tabs: {
        review: 'المراجعة',
        accounts: 'الحسابات',
        transactions: 'المعاملات',
        budgets: 'الميزانيات',
        analytics: 'التحليلات',
        debts: 'الديون',
      },
      review: {
        totalBalance: 'إجمالي الرصيد',
        income: 'الدخل',
        outcome: 'المصروف',
        monthBalance: 'الرصيد في نهاية الشهر',
        used: 'المستخدم',
        progress: 'التقدم',
        expenseStructure: 'هيكل المصروفات',
        recentTransactions: 'آخر المعاملات',
        seeAll: 'عرض الكل',
        importantEvents: 'أحداث مهمة',
        table: { type: 'النوع', amount: 'المبلغ', date: 'التاريخ' },
      },
      accounts: {
        header: 'حساباتي',
        income: 'الدخل',
        outcome: 'المصروف',
        goalProgress: '{value}% من الهدف',
        historyTitle: 'سجل المعاملات',
        historyHeaders: { type: 'النوع', amount: 'المبلغ', time: 'الوقت' },
        actions: { edit: 'تحرير', archive: 'أرشفة', delete: 'حذف' },
      },
      transactions: {
        header: 'سجل المعاملات',
        details: {
          title: 'تفاصيل المعاملة',
          amount: 'المبلغ',
          account: 'الحساب',
          category: 'الفئة',
          date: 'التاريخ',
          note: 'ملاحظة',
          relatedDebt: 'دين مرتبط',
          close: 'إغلاق',
        },
      },
      budgets: {
        today: 'نظرة على ميزانية اليوم',
        dateTemplate: 'نظرة على الميزانية لـ {date}',
        mainTitle: 'الميزانية الرئيسية',
        categoriesTitle: 'الفئات',
        addCategory: 'إضافة فئة',
        setLimit: 'تحديد حد',
        states: { exceeding: 'تجاوز', fixed: 'ثابت', within: 'ضمن الحد' },
      },
      analytics: {
        header: 'التحليلات المالية',
        expenseDynamics: 'ديناميكيات المصاريف',
        comparison: 'مقارنة مع الشهر السابق',
        topExpenses: 'أعلى المصاريف حسب الفئات',
        aiInsights: 'رؤى الذكاء الاصطناعي',
        stats: { peak: 'الذروة', average: 'المتوسط', trend: 'الاتجاه' },
        comparisonRows: { income: 'الدخل:', outcome: 'المصروف:', savings: 'المدخرات:' },
      },
      debts: {
        sections: { incoming: 'الديون', outgoing: 'ديوني' },
        timeline: {
          incoming: 'يعيد خلال',
          outgoing: 'الفترة',
          today: 'يستحق اليوم',
          inDays: 'يستحق خلال {count} يوم',
          overdue: 'متأخر {count} يوم',
        },
        actions: {
          incoming: { notify: 'إشعار', cancel: 'إلغاء الدين' },
          outgoing: { plan: 'تخطيط', partial: 'دفع جزئي' },
        },
        summary: {
          balanceLabel: 'إجمالي الرصيد',
          givenLabel: 'إجمالي الممنوح',
          takenLabel: 'إجمالي الدين',
          givenChange: '+15% ديسمبر',
          takenChange: '-8% ديسمبر',
        },
        modal: {
          title: 'إضافة دين',
          editTitle: 'تعديل الدين',
          subtitle: 'تتبع الأموال التي أقرضتها أو اقترضتها',
          person: 'الاسم / الشخص',
          personPlaceholder: 'لمن هذا الدين؟',
          amount: 'المبلغ',
          accountLabel: 'المحفظة',
          accountHelper: 'اختر الحساب المرتبط بهذا الدين',
          accountPickerTitle: 'اختر المحفظة',
          currencyLabel: 'العملة',
          currencyHelper: 'حدد العملة لهذا الدين',
          currencyPickerTitle: 'اختر العملة',
          dateLabel: 'التاريخ',
          changeDate: 'تغيير التاريخ',
          clear: 'مسح',
          selectAccount: 'اختر محفظة',
          expectedReturn: 'تاريخ السداد المتوقع',
          expectedPlaceholder: 'لم يتم تحديد تاريخ سداد',
          selectDate: 'اختر التاريخ',
          note: 'ملاحظة',
          notePlaceholder: 'أضف وصفاً أو تفاصيل إضافية…',
          toggles: { incoming: 'يدينون لي', outgoing: 'أنا مدين' },
          manageActions: 'إدارة الدين',
          buttons: {
            cancel: 'إلغاء',
            save: 'حفظ',
            saveChanges: 'حفظ ',
            delete: 'حذف',
          },
          defaults: { name: 'دين جديد', description: 'وصف', due: 'بدون موعد' },
          deleteTitle: 'حذف الدين',
          deleteDescription: 'هل أنت متأكد أنك تريد حذف هذا الدين؟ لا يمكن التراجع عن هذا الإجراء.',
        status: {
          lent: 'لقد أقرضت المال',
          borrowed: 'لقد اقترضت المال',
        },
        scheduleTitle: 'جدول السداد',
        reminderTitle: 'الإشعارات',
        reminderToggle: 'تفعيل الإشعار',
        reminderTimeLabel: 'وقت التذكير (HH:MM)',
        reminderEnabledLabel: 'الإشعارات مفعّلة',
        reminderDisabledLabel: 'الإشعارات متوقفة',
        payment: {
          title: 'تسجيل دفعة',
          amount: 'مبلغ الدفعة',
          accountLabel: 'من المحفظة',
          currencyLabel: 'عملة الدفعة',
          note: 'ملاحظة الدفعة',
          helper: 'استخدمها لتتبع الدفعات الجزئية وجدولة السداد.',
          submit: 'تطبيق الدفعة',
          limitError: 'المبلغ يتجاوز الرصيد المتبقي للدين',
        },
        actionsBar: {
          pay: 'سداد الدين',
          partial: 'دفع جزئي',
          notify: 'الإشعار',
          schedule: 'إدارة التواريخ',
        },
        fullPaymentTitle: 'سداد الدين بالكامل',
        fullPaymentDescription: 'سيتم سداد الرصيد المتبقي بالكامل ({amount}).',
        fullPaymentSubmit: 'سدّد بالكامل',
      },
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
      insights: 'İnsayt',
      more: 'Diğer',
    },
    plannerScreens: {
      tabs: {
        tasks: 'Görevler',
        goals: 'Hedefler',
        habits: 'Alışkanlıklar',
      },
      tasks: {
        headerTemplate: '{date} planları',
        todayLabel: 'bugün',
        filter: 'Filtre',
        sectionCountLabel: 'görev',
        sectionTip:
          'Kısaca basıp sağa kaydırın — tamamlandı, sola kaydırın — sil (tamamlananlar dahil).',
        sections: {
          morning: { title: 'Sabah', time: '(06:00 - 12:00)' },
          afternoon: { title: 'Öğleden sonra', time: '(12:00 - 18:00)' },
          evening: { title: 'Akşam', time: '(18:00 - 22:00)' },
        },
        actions: {
          complete: 'TAMAMLA',
          restore: 'GERİ AL',
          remove: 'SİL',
          delete: 'GÖREVİ SİL',
        },
        history: {
          title: 'Görev geçmişi',
          subtitle: 'Geri almak veya silmek için kaydır',
          tip: 'Kısaca basıp sağa kaydırarak geri alın, sola kaydırarak kalıcı olarak silin.',
          deletedBadge: 'Silindi',
        },
        defaults: {
          startToday: 'Bugün',
          startTomorrow: 'Yarın',
          startPick: 'Seç',
          newTaskTitle: 'Yeni görev',
          defaultContext: '@work',
        },
        aiPrefix: 'YZ:',
      },
      goals: {
        header: {
          title: 'Stratejik hedefler',
          subtitle: 'Finansal ve kişisel kazanımlar için ivme',
        },
        empty: {
          title: 'İlk hedefini oluştur',
          subtitle:
            'Bir hedef eklediğinde kilometre taşları, tahminler ve YZ içgörülerini görebilirsin. Başlamak için ekle düğmesini kullan.',
        },
        sections: {
          financial: {
            title: 'Finansal hedefler',
            subtitle: 'Yatırım odağı ve tasarruf öncelikleri',
          },
          personal: {
            title: 'Kişisel hedefler',
            subtitle: 'Yaşam tarzı ve wellness kazanımları',
          },
        },
        cards: {
          summaryLabels: {
            left: 'Kaldı',
            pace: 'Tempo',
            prediction: 'Tahmin',
          },
          actions: {
            addValue: 'Değer ekle',
            refresh: 'Yenile',
            edit: 'Düzenle',
            addValueA11y: 'Değer ekle',
            refreshA11y: 'Hedefi yenile',
            editA11y: 'Hedefi düzenle',
            openDetailsA11y: 'Hedef ayrıntılarını aç',
          },
        },
        details: {
          milestones: 'Kilometre taşları',
          history: 'Geçmiş',
          showMore: 'Daha fazlasını gör',
        },
        data: {
          'dream-car': {
            title: 'Hayal arabası',
            currentAmount: '4,1M UZS',
            targetAmount: '5M UZS',
            summary: {
              left: '900 000 UZS kaldı',
              pace: '450 000 UZS / ay',
              prediction: 'Takvimde · Mart 2025',
            },
            milestones: ['Oca 2025', 'Şub 2025', 'Mar 2025', 'Nis 2025'],
            history: [
              { label: 'Ara', delta: '+450 000 UZS' },
              { label: 'Kas', delta: '+320 000 UZS' },
              { label: 'Eki', delta: '+280 000 UZS' },
            ],
            aiTip: 'Bu hızla hedefe mart ayında ulaşırsın.',
            aiTipHighlight: 'Ayda 100 bin daha eklersen şubatta tamamlarsın.',
          },
          'emergency-fund': {
            title: 'Acil durum fonu',
            currentAmount: '3,5M UZS',
            targetAmount: '6M UZS',
            summary: {
              left: '2,5M UZS kaldı',
              pace: '300 000 UZS / ay',
              prediction: 'Tahmin · Haz 2025',
            },
            milestones: ['Kas 2024', 'Oca 2025', 'Mar 2025', 'Haz 2025'],
            history: [
              { label: 'Ara', delta: '+300 000 UZS' },
              { label: 'Kas', delta: '+300 000 UZS' },
              { label: 'Eki', delta: '+250 000 UZS' },
            ],
            aiTip: '350 binlik katkı konfor bölgesini korur.',
          },
          fitness: {
            title: 'Maksimum form planı',
            currentAmount: '92 / 210 seans',
            targetAmount: '210 seans',
            summary: {
              left: '118 seans kaldı',
              pace: 'Haftada 4 seans',
              prediction: 'Takvimde · Ağustos 2025',
            },
            milestones: ['Kas 2024', 'Oca 2025', 'Nis 2025', 'Ağu 2025'],
            history: [
              { label: 'Hafta 48', delta: '+4 seans' },
              { label: 'Hafta 47', delta: '+5 seans' },
              { label: 'Hafta 46', delta: '+3 seans' },
            ],
            aiTip: 'Tutarlılık artıyor. Bir ekstra kardiyo günü ekle ve süreci hızlandır.',
          },
          language: {
            title: 'İspanyolca immersion',
            currentAmount: '34 / 50 ders',
            targetAmount: '50 ders',
            summary: {
              left: '16 ders kaldı',
              pace: 'Haftada 3 ders',
              prediction: 'Varış · Şubat 2025',
            },
            milestones: ['Eki 2024', 'Ara 2024', 'Oca 2025', 'Mar 2025'],
            history: [
              { label: 'Hafta 48', delta: '+3 ders' },
              { label: 'Hafta 47', delta: '+4 ders' },
              { label: 'Hafta 46', delta: '+3 ders' },
            ],
            aiTip: 'Her dersi 15 dakikalık konuşma özetiyle pekiştir, daha hızlı akıcı olursun.',
          },
        },
      },
      habits: {
        headerTitle: 'Alışkanlıklar',
        badgeSuffix: 'gün',
        stats: {
          streak: 'Seri: {days} gün üst üste',
          record: 'Rekor: {days} gün',
          completion: 'Tamamlama: {percent}% ({completed}/{target} haftalık)',
        },
        ctas: {
          checkIn: 'Bugün işaretle',
          startTimer: 'Zamanlayıcıyı başlat',
          completed: 'Tamamlandı',
          failed: 'Başarısız',
          edit: 'Düzenle',
          delete: 'Sil',
        },
        expand: {
          titles: {
            statistics: 'İstatistikler',
            pattern: 'Örüntüler',
            achievements: 'Başarılar',
          },
          lines: {
            overallCompletion: 'Genel tamamlama: 156',
            successPercentile: 'Başarı yüzdesi: %78',
            averageStreak: 'Ortalama seri: 8 gün',
            bestMonth: 'En iyi ay: Kasım (%93)',
            bestTime: 'En iyi zaman: 7:00–7:30 (%85 başarı)',
            worstTime: 'En kötü zaman: Hafta sonu (%45)',
            afterWeekends: 'Hafta sonu sonrası: −%30 olasılık',
          },
          badges: {
            firstWeek: 'İlk hafta',
            monthNoBreak: 'Kesintisiz ay',
            hundredCompletions: '100 tamamlanma',
            marathoner: 'Maratoncu (42 gün üst üste)',
          },
        },
        data: {
          h1: {
            title: 'Sabah antrenmanı',
            aiNote: 'Antrenmandan hemen sonra sabah dene',
          },
          h2: {
            title: 'Meditasyon',
            aiNote: 'YZ: "Antrenmandan hemen sonra sabah dene"',
          },
          h3: {
            title: '30 dk okuma',
          },
          h4: {
            title: 'Günde 2L su iç',
            aiNote: 'Yeni başarı!',
            chips: ['+ 250 ml', '+ 500 ml', '+ 1 L'],
          },
          h5: {
            title: 'Sosyal ağsız',
          },
        },
      },
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
        days: { mon: 'Pzt', tue: 'Sal', wed: 'Çar', thu: 'Per', fri: 'Cum' },
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
      header: {
        title: 'Diğer',
        profileAction: 'Profili aç',
        notificationsAction: 'Bildirimler',
        badgeLabel: 'Premium',
        dateLabel: '15 Mart',
      },
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
    profile: {
      title: 'Profil',
      sections: {
        personal: 'Kişisel bilgiler',
        stats: 'Kullanım istatistikleri',
        preferences: 'Herkese açık profil',
        actions: 'Hesap işlemleri',
      },
      fields: {
        fullName: 'Ad soyad',
        email: 'E-posta',
        phone: 'Telefon',
        username: 'Kullanıcı adı',
        joined: 'Katılma tarihi',
        bio: 'Hakkında',
        visibility: 'Profil görünürlüğü',
        visibilityOptions: { public: 'Herkese açık', friends: 'Sadece arkadaşlar', private: 'Gizli' },
        showLevel: 'Seviye rozetini göster',
        showAchievements: 'Başarıları göster',
        showStatistics: 'İstatistikleri göster',
      },
      stats: {
        daysWithApp: 'LEORA ile gün',
        completedTasks: 'Tamamlanan görevler',
        activeTasks: 'Aktif görevler',
        level: 'Mevcut seviye',
      },
      xp: {
        label: 'XP ilerlemesi',
        toNext: 'Sonraki seviyeye {value} XP',
      },
      buttons: {
        edit: 'Profili düzenle',
        save: 'Kaydet',
        cancel: 'Vazgeç',
        delete: 'Hesabı sil',
        logout: 'Çıkış yap',
        changePhoto: 'Fotoğraf değiştir',
        removePhoto: 'Fotoğrafı kaldır',
        confirmDeleteTitle: 'Hesabı sil',
        confirmDeleteMessage: 'Tüm verileriniz kalıcı olarak silinecek. Devam etmek istiyor musunuz?',
        confirmDeleteConfirm: 'Sil',
        confirmDeleteCancel: 'Vazgeç',
      },
    },
    financeScreens: {
      tabs: {
        review: 'Genel',
        accounts: 'Hesaplar',
        transactions: 'İşlemler',
        budgets: 'Bütçeler',
        analytics: 'Analitik',
        debts: 'Borçlar',
      },
      review: {
        totalBalance: 'Toplam bakiye',
        income: 'Gelir',
        outcome: 'Gider',
        monthBalance: 'Ay sonu bakiyesi',
        used: 'Kullanıldı',
        progress: 'İlerleme',
        expenseStructure: 'Gider yapısı',
        recentTransactions: 'Son işlemler',
        seeAll: 'Hepsini gör',
        importantEvents: 'Önemli olaylar',
        table: { type: 'Tür', amount: 'Tutar', date: 'Tarih' },
      },
      accounts: {
        header: 'Hesaplarım',
        income: 'Gelir',
        outcome: 'Gider',
        goalProgress: '{value}% hedefe ulaşıldı',
        historyTitle: 'İşlem geçmişi',
        historyHeaders: { type: 'Tür', amount: 'Tutar', time: 'Saat' },
        actions: { edit: 'Düzenle', archive: 'Arşivle', delete: 'Sil' },
      },
      transactions: {
        header: 'İşlem geçmişi',
        details: {
          title: 'İşlem detayları',
          amount: 'Tutar',
          account: 'Hesap',
          category: 'Kategori',
          date: 'Tarih',
          note: 'Not',
          relatedDebt: 'Bağlı borç',
          close: 'Kapat',
        },
      },
      budgets: {
        today: 'Bugünkü bütçe özeti',
        dateTemplate: '{date} bütçe özeti',
        mainTitle: 'Ana bütçe',
        categoriesTitle: 'Kategoriler',
        addCategory: 'Kategori ekle',
        setLimit: 'Limit belirle',
        states: { exceeding: 'Limit aşıldı', fixed: 'Sabit', within: 'Sınır içinde' },
      },
      analytics: {
        header: 'Finansal analiz',
        expenseDynamics: 'Gider dinamikleri',
        comparison: 'Önceki ay ile karşılaştırma',
        topExpenses: 'Kategorilere göre en yüksek giderler',
        aiInsights: 'Yapay zekâ içgörüleri',
        stats: { peak: 'Zirve', average: 'Ortalama', trend: 'Trend' },
        comparisonRows: { income: 'Gelir:', outcome: 'Gider:', savings: 'Tasarruf:' },
      },
      debts: {
        sections: { incoming: 'Alacaklarım', outgoing: 'Borçlarım' },
        timeline: {
          incoming: 'Ne zaman döner',
          outgoing: 'Periyot',
          today: 'Bugün vadesi',
          inDays: '{count} gün içinde ödenecek',
          overdue: '{count} gün gecikmiş',
        },
        actions: {
          incoming: { notify: 'Hatırlat', cancel: 'Borca son ver' },
          outgoing: { plan: 'Planla', partial: 'Kısmi ödeme' },
        },
        summary: {
          balanceLabel: 'Toplam bakiye',
          givenLabel: 'Verilen toplam',
          takenLabel: 'Toplam borç',
          givenChange: '+%15 Aralık',
          takenChange: '-%8 Aralık',
        },
        modal: {
          title: 'Yeni borç ekle',
          editTitle: 'Borcu düzenle',
          subtitle: 'Verdiğiniz veya aldığınız borçları takip edin',
          person: 'İsim / Kişi',
          personPlaceholder: 'Bu borç kime ait?',
          amount: 'Tutar',
          accountLabel: 'Cüzdan',
          accountHelper: 'Bu işlem için kullanılacak hesabı seçin',
          accountPickerTitle: 'Cüzdan seç',
          currencyLabel: 'Para birimi',
          currencyHelper: 'Borç hangi para biriminde?',
          currencyPickerTitle: 'Para birimi seç',
          dateLabel: 'Tarih',
          changeDate: 'Tarihi değiştir',
          clear: 'Temizle',
          selectAccount: 'Cüzdan seç',
          expectedReturn: 'Beklenen dönüş tarihi',
          expectedPlaceholder: 'Vade belirlenmedi',
          selectDate: 'Tarih seç',
          note: 'Not',
          notePlaceholder: 'İsteğe bağlı açıklama ekleyin…',
          toggles: { incoming: 'Bana borçlu', outgoing: 'Ben borçluyum' },
          manageActions: 'Borcu yönet',
          buttons: {
            cancel: 'İptal',
            save: 'Kaydet',
            saveChanges: 'Kaydet',
            delete: 'Sil',
          },
          defaults: { name: 'Yeni borç', description: 'Açıklama', due: 'Vade yok' },
          deleteTitle: 'Borcu sil',
          deleteDescription: 'Bu borcu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
        status: {
          lent: 'Para verdiniz',
          borrowed: 'Para aldınız',
        },
        scheduleTitle: 'Ödeme planı',
        reminderTitle: 'Bildirimler',
        reminderToggle: 'Bildirim aç',
        reminderTimeLabel: 'Bildirim saati (SS:dd)',
        reminderEnabledLabel: 'Bildirimler açık',
        reminderDisabledLabel: 'Bildirimler kapalı',
        payment: {
          title: 'Ödeme kaydı',
          amount: 'Ödeme tutarı',
          accountLabel: 'Hangi cüzdandan',
          currencyLabel: 'Ödeme para birimi',
          note: 'Ödeme notu',
          helper: 'Kısmi ödemeleri ve kapatmaları takip edin.',
          submit: 'Ödemeyi uygula',
          limitError: 'Ödeme tutarı kalan borcu aşamaz',
        },
        actionsBar: {
          pay: 'Borcu öde',
          partial: 'Kısmi ödeme',
          notify: 'Bildirim',
          schedule: 'Tarihleri yönet',
        },
        fullPaymentTitle: 'Borcu tamamen öde',
        fullPaymentDescription: 'Kalan {amount} tutarın tamamı ödendi olarak işaretlenecek.',
        fullPaymentSubmit: 'Tamamını öde',
      },
      },
    },
  },
} satisfies Record<SupportedLanguage, AppTranslations>;

export const APP_TRANSLATIONS: Record<SupportedLanguage, AppTranslations> = t;
