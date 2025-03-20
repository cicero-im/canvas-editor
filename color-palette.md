# Color Palette for Integration

The following color palette should be used for styling the integration between Open WebUI and Canvas Editor:

```css
:root {
  /* Primary colors - the signature scarlet palette */
  --primary-50: #FEE9EA;
  --primary-100: #FCCBCF;
  --primary-200: #F79DA3;
  --primary-300: #EF7078;
  --primary-400: #E34955;
  --primary-500: #9D0208; /* The flagship scarlet color */
  --primary-600: #8C0207;
  --primary-700: #790106;
  --primary-800: #650105;
  --primary-900: #500104;
  --primary-950: #2A0102;
  
  /* Neutral colors - the cream and soft black canvas */
  --gray-50: #F9F7F4; /* Cream background */
  --gray-100: #F0EDE8;
  --gray-200: #E5E5E5; /* Subtle gray */
  --gray-300: #CFCFCF;
  --gray-400: #9E9E9E;
  --gray-500: #7B7B7B;
  --gray-600: #555555;
  --gray-700: #393939;
  --gray-800: #2A2A2A;
  --gray-900: #1A1A1A; /* Soft black */
  --gray-950: #0F0F0F;
  
  /* Functional colors - the emotional spectrum */
  --success-50: #eff6ff;
  --success-500: #3b82f6;
  --success-900: #1e3a8a;
  
  --warning-50: #fffbeb;
  --warning-500: #f6913e;
  --warning-900: #78350f;
  
  --error-50: #fef2f2;
  --error-500: #9D0208; /* Using scarlet for error states */
  --error-900: #7f1d1d;
  
  --info-50: #eff6ff;
  --info-500: #3b82f6;
  --info-900: #1e3a8a;
  
  /* Typography - the written voice */
  --font-sans: 'Cormorant', Georgia, serif;
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-mono: 'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
}
```

## Implementation Notes

1. This color palette and typography should be shared between both applications to maintain visual consistency.

2. In the containerized setup, this palette should be included in the shared integration volume.

3. Each application should reference these variables in their CSS/SCSS files.

4. Key UI elements to use this palette:
   - Editor button in OpenWebUI (primary colors)
   - Return button in Canvas Editor (primary colors)
   - Authentication screens (primary for actions, gray for backgrounds)
   - Error states (error colors)
   - Loading indicators (primary or info colors)

5. Typography implementation:
   - Use var(--font-sans) for UI elements
   - Use var(--font-serif) for headings and display text
   - Use var(--font-mono) for code elements
   - The Canvas Editor's editing area should continue to use its default fonts (Times New Roman, etc.)

6. Font imports:
   ```css
   @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
   ```

7. For local testing, ensure both applications load this palette at startup.