# Enterprise Design System - Component Index

## 📚 Component Library Reference

### Core UI Components (Phase 5)

#### Button
**Path:** `src/components/ui/Button.jsx`  
**Variants:** primary, secondary, ghost, danger, success  
**Sizes:** sm, md, lg  
**Features:** Loading states, icon support, hover animations

```jsx
import Button from '@/components/ui/Button';
<Button variant="primary" size="md" icon={Icon}>
  Click Me
</Button>
```

---

#### Input
**Path:** `src/components/ui/Input.jsx`  
**Features:** Label,error states, icon support, validation feedback

```jsx
import Input from '@/components/ui/Input';
<Input 
  label="Email" 
  type="email"
  icon={Mail}
  error="Invalid email"
  required
/>
```

---

#### Card
**Path:** `src/components/ui/Card.jsx`  
**Variants:** `default`, `feature`, `kpi`, `glass`, `dark`  
**Subcomponents:** `Card.Header`, `Card.Title`, `Card.Body`, `Card.Footer`  
**Phase 13:** Now uses `.card-premium` glassmorphism style by default — frosted white glass with gradient top-line border.

```jsx
import Card from '@/components/ui/Card';
<Card variant="default" hoverable>   {/* Glassmorphism by default */}
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Body>Content</Card.Body>
</Card>

<Card variant="glass">              {/* Extra frosted for overlays */}
<Card variant="dark">               {/* Dark slate for dark sections */}
```

---

#### Badge
**Path:** `src/components/ui/Badge.jsx`  
**Variants:** default, success, warning, error, info, primary  
**Sizes:** sm, md, lg

```jsx
import Badge from '@/components/ui/Badge';
<Badge variant="success" size="md">Active</Badge>
```

---

#### Modal
**Path:** `src/components/ui/Modal.jsx`  
**Features:** Backdrop blur, ESC key, body scroll lock  
**Sizes:** sm, md, lg, xl

```jsx
import Modal from '@/components/ui/Modal';
<Modal isOpen={open} onClose={() => setOpen(false)} title="Title">
  Modal content
</Modal>
```

---

#### ProgressBar
**Path:** `src/components/ui/ProgressBar.jsx`  
**Variants:** primary, success, warning, error, info  
**Features:** Shimmer animation, percentage label

```jsx
import ProgressBar from '@/components/ui/ProgressBar';
<ProgressBar value={75} max={100} showLabel />
```

---

#### Skeleton
**Path:** `src/components/ui/Skeleton.jsx`  
**Variants:** text, title, avatar, button, card  
**Presets:** SkeletonCard, SkeletonTable

```jsx
import Skeleton, { SkeletonCard } from '@/components/ui/Skeleton';
<Skeleton variant="text" count={3} />
<SkeletonCard />
```

---

### Feedback Components (Phase 4)

#### Toast
**Path:** `src/components/feedback/Toast.jsx`  
**Types:** success, error, warning, info  
**Features:** Auto-dismiss, stacking, manual close

```jsx
import { ToastProvider, useToast } from '@/components/feedback/Toast';

// In App.jsx
<ToastProvider>{children}</ToastProvider>

// In component
const toast = useToast();
toast.success('Operation successful!');
```

---

### Dashboard Components (Phase 3)

#### KPICard
**Path:** `src/components/dashboard/KPICard.jsx`  
**Features:** Trend visualization, change indicators, animated progress

```jsx
import KPICard from '@/components/dashboard/KPICard';
<KPICard
  title="Total Revenue"
  value="$2.4M"
  change="+12.5%"
  changeType="positive"
  icon={DollarSign}
/>
```

---

#### WelcomeBanner
**Path:** `src/components/dashboard/WelcomeBanner.jsx`  
**Features:** Dynamic greeting, gradient background, last login

```jsx
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
<WelcomeBanner userName="John" lastLogin="2024-02-18" />
```

---

### Data Components

#### DataTable
**Path:** `src/components/tables/DataTable.jsx`  
**Features:** Sortable columns, custom renderers, empty states

```jsx
import DataTable from '@/components/tables/DataTable';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'value', label: 'Value', render: (val) => `$${val}` }
];

<DataTable columns={columns} data={data} sortable />
```

---

#### ForecastChart
**Path:** `src/components/charts/ForecastChart.jsx`  
**Features:** Confidence intervals, custom tooltip, gradient fills

```jsx
import ForecastChart from '@/components/charts/ForecastChart';
<ForecastChart data={chartData} showConfidence />
```

---

### Authentication Components (Phase 2)

#### TrustSignals
**Path:** `src/components/auth/TrustSignals.jsx`  
**Features:** Security badges, stagger animation

```jsx
import TrustSignals from '@/components/auth/TrustSignals';
<TrustSignals />
```

---

#### AnimatedChartPreview
**Path:** `src/components/auth/AnimatedChartPreview.jsx`  
**Features:** Live forecast demo, accuracy badge

```jsx
import AnimatedChartPreview from '@/components/auth/AnimatedChartPreview';
<AnimatedChartPreview />
```

---

#### PasswordStrength
**Path:** `src/components/auth/PasswordStrength.jsx`  
**Features:** 5-bar indicator, requirements checklist, color-coded

```jsx
import PasswordStrength from '@/components/auth/PasswordStrength';
<PasswordStrength password={password} />
```

---

### Animation Components

#### PageTransition
**Path:** `src/components/animations/PageTransition.jsx`  
**Features:** Route change animations

```jsx
import PageTransition from '@/components/animations/PageTransition';
<PageTransition>{children}</PageTransition>
```

---

## 🎣 Hooks (Phase 7)

### useLocalStorage
**Path:** `src/hooks/useLocalStorage.js`  
**Features:** Persistent state, cross-tab sync

```jsx
import useLocalStorage from '@/hooks/useLocalStorage';
const [value, setValue] = useLocalStorage('key', defaultValue);
```

---

### useDebounce
**Path:** `src/hooks/useDebounce.js`  
**Features:** Delay value updates (search optimization)

```jsx
import useDebounce from '@/hooks/useDebounce';
const debouncedValue = useDebounce(value, 500);
```

---

## 🛠️ Utilities

### Validation
**Path:** `src/utils/validation.js`  
**Functions:**
- `validateEmail(email)`
- `validatePassword(password)`
- `validateRequired(value, fieldName)`
- `validateName(name)`
- `validatePhone(phone)`
- `validateURL(url)`
- `getPasswordStrength(password)`

```jsx
import { validateEmail, getPasswordStrength } from '@/utils/validation';
const error = validateEmail('test@example.com');
const strength = getPasswordStrength('MyP@ss123');
```

---

### Animation Variants
**Path:** `src/utils/animations/variants.js`  
**Exports:** fadeIn, fadeInUp, scaleIn, slideIn, staggerContainer, pageTransition, modalContent, toast, etc.

```jsx
import { fadeInUp, staggerContainer } from '@/utils/animations/variants';
<motion.div variants={fadeInUp}>Content</motion.div>
```

---

## 🎨 Design Tokens

### CSS Variables
**Path:** `src/styles/design-tokens.css`

**Colors:**
- `--brand-500` to `--brand-900`: Primary indigo palette
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`
- `--accent-success`, `--accent-warning`, `--accent-error`

**Typography:**
- `--font-sans`: Inter
- `--font-mono`: JetBrains Mono
- `--text-xs` to `--text-5xl`

**Spacing:**
- `--space-1` (4px) to `--space-24` (96px)

**Animations:**
- `--duration-fast` (150ms) to `--duration-slower` (500ms)
- `--ease-in-out`, `--ease-bounce`

---

## 📱 Responsive Design

All components use Tailwind's responsive utilities:
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+
- `xl:` - 1280px+
- `2xl:` - 1536px+

---

## ♿ Accessibility

- Focus states on all interactive elements
- ARIA labels where appropriate
- Keyboard navigation support
- Color contrast WCAG AA compliant
- Screen reader friendly

---

## 📦 Total Components Created

**18 Components**  
**3 Hooks**  
**1 Validation Library**  
**1 Animation Library**  
**4 Style Files**

---

## 🎨 Phase 13: Brand Unification Components (v3.0)

### AdaptIQLogo
**Path:** `src/components/ui/AdaptIQLogo.jsx`  
**Added:** Phase 13 — February 2026  
**Features:** Custom SVG logotype, internal gradient defs (`#00D9FF→#4A9EFF`), scalable via `className` prop

```jsx
import AdaptIQLogo from '@/components/ui/AdaptIQLogo';
<AdaptIQLogo className="w-9 h-9" />   // Sidebar size
<AdaptIQLogo className="w-12 h-12" /> // Auth panel size
```

---

### RainbowMeshCursor
**Path:** `src/components/ui/RainbowMeshCursor.jsx`  
**Added:** Phase 13 (rewritten from Phase 12 stub) — February 2026  
**Features:** 3-layer gradient blob cursor tracking system. Uses `requestAnimationFrame` for smooth 7% lerp. Visible on both dark auth and light dashboard themes.

```jsx
import RainbowMeshCursor from '@/components/ui/RainbowMeshCursor';
// Mounted inside Layout.jsx and AuthLayout.jsx
<div className="fixed inset-0 pointer-events-none z-0">
  <RainbowMeshCursor />
</div>
```

---

### AnimatedText
**Path:** `src/components/ui/AnimatedText.jsx`  
**Added:** Phase 13 — February 2026  
**Features:** Cycles through an array of text strings using Framer Motion `AnimatePresence`. Each string appears with a gradient color. Used in `AuthLayout.jsx` left panel for rotating brand headlines.

```jsx
import AnimatedText from '@/components/ui/AnimatedText';
<AnimatedText
  texts={["Sales Prediction", "Demand Forecasting", "Revenue Intelligence"]}
  className="text-5xl font-bold"
/>
```

---

### AuthLayout
**Path:** `src/components/auth/AuthLayout.jsx`  
**Added:** Phase 12 — February 2026  
**Features:** Two-panel auth wrapper (55% dark brand panel + 45% form panel). Integrates `<RainbowMeshCursor />`, `<AdaptIQLogo />`, and `<AnimatedText />`. The left panel has animated gradient blobs and feature highlights.

```jsx
import AuthLayout from '@/components/auth/AuthLayout';
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

---

## 📦 Total Components (v3.0)

**22 Components** (+4 Phase 13 additions)  
**3 Hooks**  
**1 Validation Library**  
**1 Animation Library**  
**4 Style Files + Phase 13 CSS Utilities**

---

*Last Updated: February 21, 2026 — v3.0 Enterprise Brand Unification*
