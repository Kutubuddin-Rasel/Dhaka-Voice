// Design System - DhakaVoice
// Professional, consistent design patterns for industrial-grade frontend

export const designSystem = {
  // Color Palette - Professional & Accessible
  colors: {
    // Primary Brand Colors
    primary: {
      50: 'hsl(214, 100%, 97%)',
      100: 'hsl(214, 95%, 93%)',
      200: 'hsl(213, 97%, 87%)',
      300: 'hsl(212, 96%, 78%)',
      400: 'hsl(213, 94%, 68%)',
      500: 'hsl(217, 91%, 60%)', // Main primary
      600: 'hsl(221, 83%, 53%)',
      700: 'hsl(224, 76%, 48%)',
      800: 'hsl(226, 71%, 40%)',
      900: 'hsl(224, 64%, 33%)',
      950: 'hsl(226, 57%, 21%)',
    },
    
    // Status Colors - Consistent across app
    status: {
      pending: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        icon: 'text-amber-600 dark:text-amber-400',
      },
      inProgress: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      resolved: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        icon: 'text-emerald-600 dark:text-emerald-400',
      },
    },
    
    // Complaint Type Colors
    complaintType: {
      roads: {
        bg: 'bg-orange-50 dark:bg-orange-950/20',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
      },
      electricity: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/20',
        text: 'text-yellow-700 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
      },
      water: {
        bg: 'bg-cyan-50 dark:bg-cyan-950/20',
        text: 'text-cyan-700 dark:text-cyan-300',
        border: 'border-cyan-200 dark:border-cyan-800',
        icon: 'text-cyan-600 dark:text-cyan-400',
      },
      pollution: {
        bg: 'bg-red-50 dark:bg-red-950/20',
        text: 'text-red-700 dark:text-red-300',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
      },
      transport: {
        bg: 'bg-green-50 dark:bg-green-950/20',
        text: 'text-green-700 dark:text-green-300',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
      },
      others: {
        bg: 'bg-slate-50 dark:bg-slate-950/20',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-800',
        icon: 'text-slate-600 dark:text-slate-400',
      },
    },
  },

  // Spacing Scale - Consistent 4px base
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    '2xl': '2rem',    // 32px
    '3xl': '3rem',    // 48px
    '4xl': '4rem',    // 64px
    '5xl': '6rem',    // 96px
  },

  // Typography Scale
  typography: {
    // Headings
    h1: 'text-4xl font-bold tracking-tight lg:text-5xl',
    h2: 'text-3xl font-bold tracking-tight lg:text-4xl',
    h3: 'text-2xl font-semibold tracking-tight lg:text-3xl',
    h4: 'text-xl font-semibold tracking-tight lg:text-2xl',
    h5: 'text-lg font-semibold tracking-tight lg:text-xl',
    h6: 'text-base font-semibold tracking-tight lg:text-lg',
    
    // Body text
    body: 'text-base leading-7',
    bodyLarge: 'text-lg leading-8',
    bodySmall: 'text-sm leading-6',
    bodyXSmall: 'text-xs leading-5',
    
    // Special text
    lead: 'text-xl text-muted-foreground',
    muted: 'text-sm text-muted-foreground',
    small: 'text-xs text-muted-foreground',
  },

  // Border Radius Scale
  radius: {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  },

  // Shadow Scale
  shadows: {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    inner: 'shadow-inner',
  },

  // Animation Durations
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Component Patterns
  components: {
    // Card Patterns
    card: {
      base: 'rounded-xl border bg-card text-card-foreground shadow-sm',
      elevated: 'rounded-xl border bg-card text-card-foreground shadow-lg',
      interactive: 'rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-200',
    },
    
    // Button Patterns
    button: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    
    // Badge Patterns
    badge: {
      base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      outline: 'text-foreground border border-input',
    },
    
    // Input Patterns
    input: {
      base: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    },
  },

  // Layout Patterns
  layout: {
    container: 'container mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 lg:py-12',
    grid: {
      responsive: 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      auto: 'grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6',
    },
  },
} as const;

// Helper functions for consistent usage
export const getStatusColors = (status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED') => {
  const statusMap = {
    PENDING: designSystem.colors.status.pending,
    IN_PROGRESS: designSystem.colors.status.inProgress,
    RESOLVED: designSystem.colors.status.resolved,
  };
  return statusMap[status];
};

export const getComplaintTypeColors = (type: 'ROADS' | 'ELECTRICITY' | 'WATER' | 'POLLUTION' | 'TRANSPORT' | 'OTHERS') => {
  const typeMap = {
    ROADS: designSystem.colors.complaintType.roads,
    ELECTRICITY: designSystem.colors.complaintType.electricity,
    WATER: designSystem.colors.complaintType.water,
    POLLUTION: designSystem.colors.complaintType.pollution,
    TRANSPORT: designSystem.colors.complaintType.transport,
    OTHERS: designSystem.colors.complaintType.others,
  };
  return typeMap[type];
};

// Consistent labels
export const labels = {
  status: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
  },
  complaintType: {
    ROADS: 'Roads',
    ELECTRICITY: 'Electricity',
    WATER: 'Water',
    POLLUTION: 'Pollution',
    TRANSPORT: 'Transport',
    OTHERS: 'Others',
  },
} as const;
