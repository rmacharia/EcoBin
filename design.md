# EcoBin Design System

## Design Philosophy

### Visual Language
**Environmental Consciousness**: Clean, natural design that evokes sustainability and environmental responsibility. The interface should feel like a modern, eco-friendly tool that users trust with their waste management journey.

**Approachable Technology**: Balance technical sophistication with user-friendly accessibility. The design should make advanced waste management technology feel approachable and easy to use for all age groups and technical skill levels.

**Data-Driven Clarity**: Every visual element should help users understand their environmental impact and waste patterns. Clear data visualization and intuitive interfaces guide users toward better environmental practices.

## Color Palette

### Primary Colors
- **Forest Green**: `#2D5A3D` - Primary brand color, representing nature and sustainability
- **Earth Brown**: `#8B6914` - Secondary color, evoking soil and natural materials
- **Clean White**: `#FFFFFF` - Background color, representing cleanliness and purity
- **Charcoal Gray**: `#3A3A3A` - Primary text color, ensuring excellent readability

### Accent Colors
- **Recycling Blue**: `#6B8CAE` - Information and educational elements
- **Success Green**: `#4A6741` - Positive actions and achievements
- **Warning Amber**: `#B8860B` - Alerts and important notices
- **Error Rust**: `#8B4513` - Error states and critical alerts

### Semantic Colors
- **Organic**: `#4A6741` - Organic waste category
- **Plastic**: `#6B8CAE` - Plastic waste category
- **Paper**: `#B8860B` - Paper waste category
- **Metal**: `#8B6914` - Metal waste category
- **Glass**: `#C4A484` - Glass waste category

## Typography

### Primary Typeface: Tiempos Headline
- **Usage**: Headings, titles, and display text
- **Characteristics**: Modern serif with strong personality, excellent for environmental content
- **Weights**: Regular (400), Medium (500), Bold (700)

### Secondary Typeface: Suisse Int'l
- **Usage**: Body text, UI elements, and interface labels
- **Characteristics**: Clean, neutral sans-serif with excellent readability
- **Weights**: Light (300), Regular (400), Medium (500), Semibold (600)

### Monospace: JetBrains Mono
- **Usage**: Data displays, statistics, and technical information
- **Characteristics**: Developer-friendly with excellent character distinction

## Visual Effects

### Background Treatment
**Organic Patterns**: Subtle leaf and nature-inspired patterns using p5.js, creating a connection to nature without being distracting. Patterns move slowly and respond to user interaction.

### Animation Library Usage
- **Anime.js**: Smooth transitions for UI elements, staggered animations for waste tracking cards
- **Typed.js**: Typewriter effect for environmental tips and educational content
- **Splitting.js**: Text reveal animations for headings and important messages
- **ECharts.js**: Data visualizations with environmental color palette and smooth transitions

### Interactive Elements
- **Hover Effects**: Subtle scale (1.02x) and shadow elevation on cards and buttons
- **Waste Category Icons**: Animated icons that respond to user interaction
- **Loading States**: Nature-inspired loading animations with leaf and growth motifs
- **Micro-interactions**: Subtle feedback for all user actions with environmental themes

## Layout & Spacing

### Grid System
- **Container**: Max-width 1200px with responsive breakpoints
- **Columns**: 12-column grid with 24px gutters
- **Spacing**: 8px base unit system (8, 16, 24, 32, 48, 64px)

### Component Spacing
- **Section Padding**: 64px vertical, 32px horizontal
- **Card Spacing**: 24px internal padding, 16px between cards
- **Text Spacing**: 1.6 line-height for body text, 1.2 for headings

## Component Design

### Waste Tracking Cards
- **Background**: White with subtle shadow (0 4px 12px rgba(0,0,0,0.1))
- **Border**: 1px solid rgba(45, 90, 61, 0.1)
- **Border Radius**: 12px
- **Hover State**: Elevated shadow and slight scale increase with green accent

### Interactive Buttons
- **Primary**: Forest Green background with white text
- **Secondary**: Transparent with Forest Green border and text
- **Hover**: Earth Brown accent with smooth color transition

### Form Elements
- **Input Fields**: Clean White background with Charcoal Gray text
- **Focus State**: Forest Green border with subtle glow
- **Labels**: Suisse Int'l Medium in Charcoal Gray

### Data Visualization
- **Charts**: Environmental color palette with subtle gradients
- **Waste Categories**: Color-coded system using semantic colors
- **Progress Indicators**: Organic shapes and natural progress metaphors

## Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Mobile Adaptations
- **Navigation**: Bottom tab navigation for thumb-friendly access
- **Cards**: Full-width with increased touch targets
- **Typography**: Slightly larger base font size (18px vs 16px)

## Accessibility

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements have clear focus indicators
- Color is never the only way to convey information

### Typography
- Minimum 16px font size for body text
- Clear hierarchy with appropriate heading levels
- Sufficient line spacing for readability

## Brand Elements

### Logo Treatment
- **Primary**: Wordmark in Tiempos Headline Bold
- **Icon**: Simplified recycling symbol in Forest Green
- **Usage**: Consistent sizing and spacing across applications

### Iconography
- **Style**: Minimal line icons with 2px stroke weight
- **Color**: Charcoal Gray with hover states in Forest Green
- **Size**: 24px standard, 32px for primary actions

## Environmental Metaphors

### Visual Metaphors
- **Growth**: Upward animations and organic shapes for positive actions
- **Cycles**: Circular progress indicators representing recycling cycles
- **Nature**: Leaf patterns and organic textures for background elements
- **Cleanliness**: Pure whites and clean lines for data presentation

### Animation Principles
- **Organic Motion**: Easing functions that mimic natural movement
- **Sustainable Pacing**: Thoughtful timing that doesn't rush users
- **Feedback Loops**: Visual feedback that reinforces positive environmental actions
- **Progressive Disclosure**: Information revealed in digestible, logical steps

## Implementation Notes

### CSS Custom Properties
```css
:root {
  --color-primary: #2D5A3D;
  --color-secondary: #8B6914;
  --color-background: #FFFFFF;
  --color-text: #3A3A3A;
  --color-accent: #6B8CAE;
  --font-primary: 'Tiempos Headline', serif;
  --font-secondary: 'Suisse Int\'l', sans-serif;
  --spacing-unit: 8px;
}
```

### Animation Timing
- **Fast**: 150ms for micro-interactions
- **Medium**: 300ms for UI transitions
- **Slow**: 500ms for page transitions
- **Easing**: cubic-bezier(0.4, 0.0, 0.2, 1) for natural feel

### Environmental Impact Visualization
- **Carbon Footprint**: Tree icons and green color scaling for positive impact
- **Waste Reduction**: Downward trending animations for waste reduction
- **Recycling Rates**: Circular progress indicators with recycling colors
- **Community Impact**: Network visualizations showing collective impact

This design system creates a cohesive, environmentally-conscious interface that supports the complex functionality of a smart waste management system while maintaining visual elegance and usability.