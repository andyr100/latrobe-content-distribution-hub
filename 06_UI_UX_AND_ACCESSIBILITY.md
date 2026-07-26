# UI, UX and Accessibility Specification

## Visual direction

Professional, restrained glassmorphism suitable for a university application.

Use:

- frosted translucent cards
- subtle backdrop blur
- fine borders
- rounded corners
- controlled cyan/violet/magenta accents
- restrained glow
- clear typography
- generous spacing
- strong hierarchy

Avoid:

- cyberpunk excess
- crowded dashboards
- enterprise administration complexity
- low-contrast surfaces
- grey dropdowns with white text
- default-browser-looking forms
- animation without purpose

## Themes

Provide designed light and dark themes.

Transition theme colours, backgrounds, borders, shadows, fills, strokes and text over approximately two seconds.

Do not transition layout sizes or positioning.

Under `prefers-reduced-motion`, make theme changes immediate or nearly immediate.

## Navigation

Desktop:

- compact left sidebar
- icons and text labels
- current route highlighted
- six required destinations

Mobile:

- hamburger button
- animated transform-based drawer
- blurred glass surface
- Escape closes
- selection closes
- focus returns to button
- starts closed

## Posts UX

Internal and External RSS are tabs within one page.

Toolbar remains compact and adjacent to affected content.

Cards prioritise scanning:

1. classification/source
2. title
3. author and date
4. body/summary
5. channels/status
6. action

## Channel multi-select

- searchable
- keyboard usable
- All Channels option
- visible selected count
- removable inline pills
- pills wrap
- clear hover/focus
- listbox surface has intentional theme colours

## Modals

Use one visual modal system.

Requirements:

- labelled title
- focus moved inside on open
- focus contained while open
- Escape closes unless publishing
- focus returns to trigger
- background interaction disabled
- responsive at 360 px
- blurred backdrop
- no stacked unrelated modals

## Toasts

- top-right on desktop
- safe full-width placement on mobile
- slide/fade motion
- close button
- approximately five seconds
- polite screen-reader announcement
- reduced-motion alternative

## Accessibility

- semantic header/nav/main/footer
- one `h1` per page
- logical heading hierarchy
- visible skip link
- visible focus styles
- native buttons and links
- labelled controls
- `aria-expanded`/`aria-controls` for drawer and collapsibles
- accessible modal labelling
- no colour-only meaning
- contrast checked in both themes
- article and channel expansion keyboard accessible
- disabled publishing state communicated
- loading state announced
- reduced motion supported

## Responsive widths

Verify at:

- 360 px
- 768 px
- 1024 px
- 1440 px

No horizontal scrolling, clipped modals, off-screen dropdowns or unreadable pills.
