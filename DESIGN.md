# Design System Strategy: The Technical Architect

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Technical Architect."** 

Unlike standard developer portfolios that lean into neon-on-black terminal aesthetics, this system is an exercise in high-end editorial precision. It treats code and technical expertise as a craft, utilizing a "light black" canvas to create an environment of focus and intellectual depth. 

The system moves away from the rigid, boxed-in layouts of traditional templates. Instead, it utilizes **intentional asymmetry** and **tonal layering** to guide the eye. We achieve a "premium" feel by breaking the grid with overlapping glass elements and using a high-contrast typography scale that feels both authoritative and modern. This is not just a site; it is a digital dossier.

---

## 2. Colors & Surface Philosophy
The palette is built on a foundation of deep neutrals and "Atmospheric Blues." We avoid absolute blacks to maintain a sense of soft, premium texture.

### The Palette
- **Background (`surface`):** `#131313` – Our "light black" base.
- **Primary (`primary`):** `#adc7ff` – A soft, luminous blue for high-visibility actions.
- **Secondary (`secondary`):** `#b7c6ee` – Desaturated navy for supporting elements.
- **Tertiary (`tertiary`):** `#00daf3` – The "Electric Highlight" used sparingly for impact.

### The "No-Line" Rule
To achieve an editorial look, **1px solid borders for sectioning are prohibited.** Boundaries must be defined through background color shifts. Use `surface-container-low` for large section blocks and `surface-container-high` for interactive cards. If two sections meet, they should be distinguished by their tonal value, never a line.

### The "Glass & Gradient" Rule
To add "soul" to the technical layout:
- **Floating Elements:** Use `surface-variant` at 40% opacity with a `backdrop-blur` of 12px to create a glassmorphism effect.
- **Signature Textures:** Apply a subtle linear gradient from `primary_container` to `surface` at a 135-degree angle for hero background accents. This prevents the dark theme from feeling "flat."

---

## 3. Typography
We utilize a tri-font system to create a sophisticated hierarchy that balances technical precision with editorial flair.

*   **Display & Headlines (Manrope):** Chosen for its geometric purity. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) for hero statements to command attention.
*   **Body (Inter):** The workhorse. Inter provides maximum legibility for project descriptions. Stick to `body-md` (0.875rem) for most content to maintain a "dense, professional" feel.
*   **Data & Labels (Space Grotesk):** This is our "Technical" accent. Use `label-md` for tags, stats, and mono-styled metadata. It adds the necessary developer-centric "flavor" without compromising the premium aesthetic.

---

## 4. Elevation & Depth
In this system, depth is a measure of importance, not just a visual effect.

### The Layering Principle
Hierarchy is achieved by stacking `surface-container` tiers:
1.  **Level 0 (Base):** `surface` (#131313)
2.  **Level 1 (Sections):** `surface-container-low` (#1C1B1B)
3.  **Level 2 (Cards):** `surface-container-high` (#2A2A2A)

### Ambient Shadows
Avoid traditional drop shadows. If an element must float (like a modal or a floating nav), use a shadow color tinted with the primary hue: `rgba(0, 46, 104, 0.4)` with a 40px blur. This creates a "glow" rather than a "shadow," mimicking the light of a high-end monitor.

### The "Ghost Border" Fallback
If a container requires a border for accessibility, use the **Ghost Border**: `outline-variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` with `on-primary` text. Use `xl` (1.5rem) rounding. No shadow—use a subtle 2px inner-glow on hover.
*   **Secondary:** Glass-style. `surface-variant` at 20% opacity with a `backdrop-blur`. 
*   **Tertiary (The "Electric" CTA):** Text-only using `tertiary` (#00daf3) with an underline that expands from the center on hover.

### Cards & Lists
*   **The Rule:** No divider lines. Separate list items using 16px of vertical white space from the spacing scale.
*   **Hover State:** Cards should transition from `surface-container-high` to `surface-bright` on hover, accompanied by a subtle 2px upward shift.

### Input Fields
*   **Style:** Minimalist. Only a bottom border (the Ghost Border). Focus state triggers the border to expand into a 2px `primary` line. Use `label-sm` (Space Grotesk) for floating labels.

### Interactive Code Blocks
*   Use `surface-container-lowest` (#0E0E0E) for the background to create a "recessed" look. Use `tertiary` for syntax highlighting to ensure the "Electric Blue" draws the eye to the craft.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place a large `display-lg` headline on the left and a small `label-md` metadata block on the far right to create tension.
*   **Embrace Negative Space:** Let the `surface` color breathe. High-end design is defined by what you leave out.
*   **Layer Glass:** Use semi-transparent layers for the navigation bar so the content "bleeds" through as the user scrolls.

### Don’t:
*   **Don't use 100% white text:** Use `on-surface-variant` (#C5C6CF) for body text to reduce eye strain and maintain the "Technical Architect" mood. 
*   **Don't use "Card Fatigue":** Avoid making every section a card. Use tonal shifts for sections and reserve cards only for truly interactive items.
*   **Don't use sharp corners:** Even in a "technical" system, use the `DEFAULT` (0.5rem) or `md` (0.75rem) roundedness to keep the interface feeling engineered and ergonomic.