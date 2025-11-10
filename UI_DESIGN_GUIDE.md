# E-VioPay - UI Design Guide

## 🎨 Design Philosophy

The E-VioPay UI is designed with a modern, clean, and user-friendly approach that reflects the vibrant and progressive nature of Las Piñas City. The design emphasizes accessibility, efficiency, and trust - essential for a government payment platform.

## 🌈 Color Palette

### Primary Colors (Green Theme)
Our primary color scheme is inspired by Las Piñas' natural beauty and growth, using various shades of green:

```css
/* Primary Green Palette */
--primary-50: #f0fdf4    /* Lightest green - backgrounds */
--primary-100: #dcfce7   /* Very light green - subtle accents */
--primary-200: #bbf7d0   /* Light green - borders, dividers */
--primary-300: #86efac   /* Medium light green - hover states */
--primary-400: #4ade80   /* Medium green - secondary actions */
--primary-500: #22c55e   /* Base green - primary actions */
--primary-600: #16a34a   /* Dark green - primary buttons */
--primary-700: #15803d   /* Darker green - hover states */
--primary-800: #166534   /* Dark green - text, emphasis */
--primary-900: #14532d   /* Darkest green - headings */
```

### Secondary Colors (Blue Accent)
```css
/* Secondary Blue Palette */
--secondary-50: #f0f9ff   /* Lightest blue */
--secondary-100: #e0f2fe  /* Very light blue */
--secondary-200: #bae6fd  /* Light blue */
--secondary-300: #7dd3fc  /* Medium light blue */
--secondary-400: #38bdf8  /* Medium blue */
--secondary-500: #0ea5e9  /* Base blue */
--secondary-600: #0284c7  /* Dark blue */
--secondary-700: #0369a1  /* Darker blue */
--secondary-800: #075985  /* Dark blue */
--secondary-900: #0c4a6e  /* Darkest blue */
```

### Accent Colors (Warm Orange/Yellow)
```css
/* Accent Colors */
--accent-50: #fffbeb     /* Lightest yellow */
--accent-100: #fef3c7    /* Very light yellow */
--accent-200: #fde68a    /* Light yellow */
--accent-300: #fcd34d    /* Medium light yellow */
--accent-400: #fbbf24    /* Medium yellow */
--accent-500: #f59e0b    /* Base orange */
--accent-600: #d97706    /* Dark orange */
--accent-700: #b45309    /* Darker orange */
--accent-800: #92400e    /* Dark orange */
--accent-900: #78350f    /* Darkest orange */
```

### Semantic Colors
```css
/* Success (Green) */
--success-500: #22c55e
--success-600: #16a34a
--success-700: #15803d

/* Warning (Yellow/Orange) */
--warning-500: #f59e0b
--warning-600: #d97706
--warning-700: #b45309

/* Danger (Red) */
--danger-500: #ef4444
--danger-600: #dc2626
--danger-700: #b91c1c
```

## 🎯 Typography

### Font Families
- **Primary**: Inter (Google Fonts) - Clean, modern, highly readable
- **Secondary**: Poppins (Google Fonts) - Friendly, approachable for headings
- **Fallback**: system-ui, sans-serif

### Font Scale
```css
/* Heading Sizes */
--text-xs: 0.75rem     /* 12px - Small labels */
--text-sm: 0.875rem    /* 14px - Body text */
--text-base: 1rem      /* 16px - Default body */
--text-lg: 1.125rem    /* 18px - Large body */
--text-xl: 1.25rem     /* 20px - Small headings */
--text-2xl: 1.5rem     /* 24px - Medium headings */
--text-3xl: 1.875rem   /* 30px - Large headings */
--text-4xl: 2.25rem    /* 36px - Extra large headings */
--text-5xl: 3rem       /* 48px - Hero headings */
--text-6xl: 3.75rem    /* 60px - Display headings */
--text-7xl: 4.5rem     /* 72px - Hero display */
```

### Font Weights
- **Light**: 300 - Subtle text
- **Regular**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings
- **Extrabold**: 800 - Large headings
- **Black**: 900 - Hero text

## 🧩 Component Design System

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply bg-gradient-to-r from-primary-600 to-primary-700 text-white 
         hover:from-primary-700 hover:to-primary-800 
         focus:ring-primary-500 shadow-lg hover:shadow-xl 
         transform hover:-translate-y-0.5 transition-all duration-200;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply bg-gradient-to-r from-secondary-600 to-secondary-700 text-white 
         hover:from-secondary-700 hover:to-secondary-800 
         focus:ring-secondary-500 shadow-lg hover:shadow-xl 
         transform hover:-translate-y-0.5 transition-all duration-200;
}
```

#### Outline Button
```css
.btn-outline {
  @apply border-2 border-primary-300 text-primary-700 bg-white 
         hover:bg-primary-50 hover:border-primary-400 
         focus:ring-primary-500 shadow-md hover:shadow-lg 
         transform hover:-translate-y-0.5 transition-all duration-200;
}
```

#### Accent Button
```css
.btn-accent {
  @apply bg-gradient-to-r from-accent-500 to-accent-600 text-white 
         hover:from-accent-600 hover:to-accent-700 
         focus:ring-accent-500 shadow-lg hover:shadow-xl 
         transform hover:-translate-y-0.5 transition-all duration-200;
}
```

### Cards

#### Standard Card
```css
.card {
  @apply bg-white/80 backdrop-blur-sm overflow-hidden shadow-xl 
         rounded-2xl border border-white/20 hover:shadow-2xl 
         transition-all duration-300;
}
```

#### Glass Card
```css
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 
         shadow-2xl rounded-2xl;
}
```

#### Gradient Card
```css
.gradient-card {
  @apply bg-gradient-to-br from-white via-green-50 to-white 
         border border-green-100 shadow-xl rounded-2xl;
}
```

### Form Elements

#### Input Fields
```css
.input {
  @apply block w-full rounded-lg border-2 border-gray-200 shadow-sm 
         focus:border-primary-500 focus:ring-primary-500 sm:text-sm 
         transition-all duration-200 hover:border-primary-300;
}
```

#### Labels
```css
.form-label {
  @apply block text-sm font-medium text-gray-700;
}
```

### Badges

#### Success Badge
```css
.badge-success {
  @apply badge bg-gradient-to-r from-success-100 to-success-200 
         text-success-800 border border-success-300;
}
```

#### Info Badge
```css
.badge-info {
  @apply badge bg-gradient-to-r from-primary-100 to-primary-200 
         text-primary-800 border border-primary-300;
}
```

## 🎭 Layout Principles

### Spacing System
Based on 8px grid system:
- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)
- **2xl**: 4rem (64px)
- **3xl**: 6rem (96px)

### Border Radius
- **sm**: 0.25rem (4px) - Small elements
- **md**: 0.5rem (8px) - Standard elements
- **lg**: 0.75rem (12px) - Large elements
- **xl**: 1rem (16px) - Extra large elements
- **2xl**: 1.5rem (24px) - Cards, containers
- **full**: 9999px - Pills, circles

### Shadows
- **sm**: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- **md**: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- **lg**: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- **xl**: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
- **2xl**: 0 25px 50px -12px rgba(0, 0, 0, 0.25)

## 🎨 Visual Effects

### Gradients
```css
/* Primary Gradient */
bg-gradient-to-r from-primary-600 to-primary-700

/* Accent Gradient */
bg-gradient-to-r from-accent-500 to-accent-600

/* Text Gradient */
bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent
```

### Animations
```css
/* Fade In */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  0% { transform: translateY(10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Float */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

/* Bounce Gentle */
@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

### Backdrop Effects
```css
/* Glass Effect */
.glass-effect {
  @apply bg-white/20 backdrop-blur-md border border-white/30;
}

/* Hero Pattern */
.hero-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
}
```

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px - Small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Laptops
- **xl**: 1280px - Desktops
- **2xl**: 1536px - Large screens

### Mobile-First Approach
All components are designed mobile-first with progressive enhancement for larger screens.

## ♿ Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 ratio)
- Interactive elements meet WCAG AAA standards (7:1 ratio)

### Focus States
- All interactive elements have visible focus indicators
- Focus rings use primary color with 2px width

### Screen Reader Support
- Semantic HTML structure
- ARIA labels where needed
- Alt text for all images

## 🎯 Component Usage Guidelines

### When to Use Each Button Type
- **Primary**: Main actions (Submit, Pay, Search)
- **Secondary**: Secondary actions (Cancel, Back)
- **Outline**: Alternative actions (Learn More, View Details)
- **Accent**: Special actions (Get Started, Create Account)

### When to Use Each Card Type
- **Standard Card**: General content containers
- **Glass Card**: Overlays, modals, floating elements
- **Gradient Card**: Featured content, highlights

### Color Usage
- **Primary Green**: Trust, growth, success, nature
- **Secondary Blue**: Technology, reliability, professionalism
- **Accent Orange**: Energy, action, attention-grabbing
- **Success Green**: Completed actions, positive feedback
- **Warning Orange**: Caution, pending actions
- **Danger Red**: Errors, destructive actions

## 🌟 Las Piñas Cultural Elements

### Design Inspiration
- **Bamboo Organ Church**: Clean, vertical lines and natural materials
- **Salt Industry Heritage**: Crystalline patterns and geometric shapes
- **Coastal Location**: Flowing curves and wave-like patterns
- **Urban Development**: Modern, progressive design elements

### Visual Motifs
- Subtle geometric patterns inspired by traditional Filipino designs
- Natural color palette reflecting the city's green spaces
- Modern typography representing technological advancement
- Clean, efficient layouts reflecting good governance

## 🤝 Brand & Attribution

### The Heedful — Design & Engineering Partner
- E‑VioPay is designed and engineered in partnership with **The Heedful**.
- Portfolio link: https://vengeth.github.io/The-Heedful
- Brand usage:
  - Keep E‑VioPay as the primary product brand.
  - Add “Designed & engineered by The Heedful” footer attribution with an external link.
  - Maintain neutral, modern styling; do not introduce conflicting brand colors.

## 📋 Implementation Checklist

### Before Development
- [ ] Review color palette and ensure brand consistency
- [ ] Check component library for existing patterns
- [ ] Verify responsive breakpoints
- [ ] Confirm accessibility requirements

### During Development
- [ ] Use semantic HTML elements
- [ ] Apply consistent spacing using the 8px grid
- [ ] Implement proper focus states
- [ ] Test on multiple screen sizes
- [ ] Verify color contrast ratios

### After Development
- [ ] Test with screen readers
- [ ] Validate HTML markup
- [ ] Check performance impact of animations
- [ ] Review with stakeholders
- [ ] Document any deviations from guidelines

## 🔧 Customization

### Theme Variables
All colors and spacing can be customized by modifying the Tailwind configuration file:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Customize primary colors here
        }
      }
    }
  }
}
```

### Component Variants
Create new component variants by extending the base classes:

```css
.btn-custom {
  @apply btn bg-gradient-to-r from-custom-500 to-custom-600 
         text-white hover:from-custom-600 hover:to-custom-700;
}
```

---

*This design guide ensures consistency, accessibility, and a professional appearance across the E-VioPay platform. For questions or updates, please contact the development team.*
