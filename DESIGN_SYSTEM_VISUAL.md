# E-VioPay - Visual Design System

## 🎨 Color Palette Visualization

### Primary Green Theme
```
🟢 Primary Green Scale
┌─────────────────────────────────────────────────────────────┐
│ #f0fdf4  #dcfce7  #bbf7d0  #86efac  #4ade80  #22c55e  #16a34a  #15803d  #166534  #14532d │
│   50      100     200     300     400     500     600     700     800     900     │
│ Lightest → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → Darkest │
└─────────────────────────────────────────────────────────────┘

Usage:
- 50-200: Backgrounds, subtle accents
- 300-400: Hover states, secondary elements  
- 500-600: Primary actions, buttons
- 700-900: Text, emphasis, headings
```

### Secondary Blue Theme
```
🔵 Secondary Blue Scale
┌─────────────────────────────────────────────────────────────┐
│ #f0f9ff  #e0f2fe  #bae6fd  #7dd3fc  #38bdf8  #0ea5e9  #0284c7  #0369a1  #075985  #0c4a6e │
│   50      100     200     300     400     500     600     700     800     900     │
│ Lightest → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → Darkest │
└─────────────────────────────────────────────────────────────┘

Usage:
- Technology, reliability, professionalism
- Secondary actions and information
- Trust and security indicators
```

### Accent Orange/Yellow Theme
```
🟠 Accent Orange Scale
┌─────────────────────────────────────────────────────────────┐
│ #fffbeb  #fef3c7  #fde68a  #fcd34d  #fbbf24  #f59e0b  #d97706  #b45309  #92400e  #78350f │
│   50      100     200     300     400     500     600     700     800     900     │
│ Lightest → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → → Darkest │
└─────────────────────────────────────────────────────────────┘

Usage:
- Energy, action, attention-grabbing
- Call-to-action buttons
- Highlights and special features
```

## 🧩 Component Hierarchy

### Button System
```
┌─────────────────────────────────────────────────────────────┐
│                        BUTTON HIERARCHY                     │
├─────────────────────────────────────────────────────────────┤
│  Primary (Green)     Secondary (Blue)     Accent (Orange)   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │ Get Started │     │ Learn More  │     │ Special CTA │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
│                                                             │
│  Outline (Green)     Danger (Red)        Success (Green)    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐   │
│  │ Cancel      │     │ Delete      │     │ Complete    │   │
│  └─────────────┘     └─────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Card System
```
┌─────────────────────────────────────────────────────────────┐
│                         CARD SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│  Standard Card          Glass Card           Gradient Card  │
│  ┌─────────────┐       ┌─────────────┐      ┌─────────────┐│
│  │ ███████████ │       │ ░░░░░░░░░░░ │      │ ▓▓▓▓▓▓▓▓▓▓▓ ││
│  │ █ Content  █ │       │ ░ Content ░ │      │ ▓ Content ▓ ││
│  │ ███████████ │       │ ░░░░░░░░░░░ │      │ ▓▓▓▓▓▓▓▓▓▓▓ ││
│  └─────────────┘       └─────────────┘      └─────────────┘│
│  General content       Overlays, modals     Featured content│
└─────────────────────────────────────────────────────────────┘
```

## 🎭 Visual Effects

### Gradient Examples
```
┌─────────────────────────────────────────────────────────────┐
│                        GRADIENTS                           │
├─────────────────────────────────────────────────────────────┤
│ Primary Gradient:  #16a34a → #15803d                       │
│ Accent Gradient:   #f59e0b → #d97706                       │
│ Text Gradient:     #16a34a → #166534 (text only)           │
│ Background:        #f0fdf4 → #ffffff → #f0fdf4             │
└─────────────────────────────────────────────────────────────┘
```

### Animation Types
```
┌─────────────────────────────────────────────────────────────┐
│                       ANIMATIONS                           │
├─────────────────────────────────────────────────────────────┤
│ Fade In:     opacity 0 → 1 (0.5s)                          │
│ Slide Up:    translateY(10px) → 0 (0.3s)                   │
│ Float:       translateY(0) ↔ translateY(-10px) (3s loop)   │
│ Bounce:      translateY(0) ↔ translateY(-5px) (2s loop)    │
│ Hover Lift:  translateY(0) → translateY(-2px) (0.2s)       │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

```
┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIVE DESIGN                       │
├─────────────────────────────────────────────────────────────┤
│ Mobile First Approach:                                      │
│                                                             │
│ sm:  640px  ████████████████████████████████████████████   │
│ md:  768px  ████████████████████████████████████████████████│
│ lg: 1024px  ████████████████████████████████████████████████│
│ xl: 1280px  ████████████████████████████████████████████████│
│ 2xl:1536px  ████████████████████████████████████████████████│
│                                                             │
│ All components scale fluidly between breakpoints            │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Typography Scale

```
┌─────────────────────────────────────────────────────────────┐
│                     TYPOGRAPHY SCALE                       │
├─────────────────────────────────────────────────────────────┤
│ Display:     72px  ████████████████████████████████████████│
│ Hero:        60px  ███████████████████████████████████████ │
│ Large:       48px  ████████████████████████████████████    │
│ Heading:     36px  ████████████████████████████████        │
│ Subheading:  30px  ████████████████████████████            │
│ Large Text:  24px  ████████████████████████                │
│ Body:        20px  ████████████████████                    │
│ Small:       18px  ██████████████████                      │
│ Caption:     16px  ████████████████                        │
│ Label:       14px  ██████████████                          │
│ Tiny:        12px  ████████████                            │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 Las Piñas Cultural Integration

### Design Elements Inspired by Las Piñas
```
┌─────────────────────────────────────────────────────────────┐
│                 CULTURAL DESIGN ELEMENTS                   │
├─────────────────────────────────────────────────────────────┤
│ 🏛️  Bamboo Organ Church:                                   │
│    - Clean vertical lines                                  │
│    - Natural material textures                              │
│    - Traditional geometric patterns                        │
│                                                             │
│ 🧂  Salt Industry Heritage:                                │
│    - Crystalline patterns                                  │
│    - Geometric salt crystal shapes                         │
│    - Clean, structured layouts                             │
│                                                             │
│ 🌊  Coastal Location:                                      │
│    - Flowing wave patterns                                 │
│    - Ocean-inspired gradients                              │
│    - Smooth, organic curves                                │
│                                                             │
│ 🏙️  Urban Development:                                     │
│    - Modern, progressive design                            │
│    - Clean, efficient layouts                              │
│    - Technology-forward aesthetics                         │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Component Usage Matrix

```
┌─────────────────────────────────────────────────────────────┐
│                   COMPONENT USAGE GUIDE                    │
├─────────────────────────────────────────────────────────────┤
│ Button Types:                                               │
│ ┌─────────────┬─────────────┬─────────────┬─────────────┐   │
│ │ Primary     │ Secondary   │ Accent      │ Outline     │   │
│ │ (Green)     │ (Blue)      │ (Orange)    │ (Green)     │   │
│ ├─────────────┼─────────────┼─────────────┼─────────────┤   │
│ │ Submit      │ Learn More  │ Get Started │ Cancel      │   │
│ │ Pay         │ View Details│ Create      │ Back        │   │
│ │ Search      │ Info        │ Special     │ Alternative │   │
│ └─────────────┴─────────────┴─────────────┴─────────────┘   │
│                                                             │
│ Card Types:                                                 │
│ ┌─────────────┬─────────────┬─────────────┐                 │
│ │ Standard    │ Glass       │ Gradient    │                 │
│ │ (White)     │ (Transparent│ (Green)     │                 │
│ ├─────────────┼─────────────┼─────────────┤                 │
│ │ Content     │ Overlays    │ Featured    │                 │
│ │ Lists       │ Modals      │ Highlights  │                 │
│ │ Forms       │ Floating    │ Special     │                 │
│ └─────────────┴─────────────┴─────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## ♿ Accessibility Features

```
┌─────────────────────────────────────────────────────────────┐
│                    ACCESSIBILITY DESIGN                    │
├─────────────────────────────────────────────────────────────┤
│ Color Contrast:                                             │
│ ✅ Text: 4.5:1 ratio (WCAG AA)                             │
│ ✅ Interactive: 7:1 ratio (WCAG AAA)                       │
│                                                             │
│ Focus States:                                               │
│ ✅ 2px primary color ring                                   │
│ ✅ High contrast indicators                                 │
│ ✅ Keyboard navigation support                              │
│                                                             │
│ Screen Reader:                                              │
│ ✅ Semantic HTML structure                                  │
│ ✅ ARIA labels and roles                                    │
│ ✅ Alt text for images                                      │
│                                                             │
│ Motion:                                                     │
│ ✅ Respects prefers-reduced-motion                          │
│ ✅ Subtle, purposeful animations                            │
└─────────────────────────────────────────────────────────────┘
```

---

*This visual guide provides a comprehensive overview of the E-VioPay design system. Use this as a reference for maintaining consistency across all components and pages.*
