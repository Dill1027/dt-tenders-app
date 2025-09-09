# DT Tenders App Styling Guide

This document outlines the styling architecture and best practices for the DT Tenders App.

## CSS Architecture

The application uses a combination of component-specific CSS files and global utility styles:

### Global Styles

- `variables.css`: Contains CSS variables for consistent theming (colors, typography, spacing, etc.)
- `utilities.css`: Provides utility classes for common styling needs (flex box, margins, padding, etc.)
- `index.css`: Base styles that apply to the entire application

### Component-Specific Styles

Each major component has its own CSS file:

- `Dashboard.css`: Styles for the Dashboard component
- `ProjectView.css`: Styles for the ProjectView component
- `ProjectForm.css`: Styles for the ProjectForm component
- `progressBar.css`: Styles for progress bars used throughout the application

## Best Practices

1. **Use CSS Variables**: Use the variables defined in `variables.css` for consistent theming.

   ```css
   .my-component {
     color: var(--primary);
     margin: var(--spacing-4);
   }
   ```

2. **Use Utility Classes**: Leverage utility classes for common styling patterns.

   ```html
   <div className="flex items-center gap-3 p-4 rounded-lg shadow-md">
     <!-- Content -->
   </div>
   ```

3. **Component-Specific CSS**: Keep component-specific styles in their respective CSS files.

4. **BEM Naming Convention**: Use BEM (Block, Element, Modifier) for class naming when appropriate.

   ```css
   .card {} /* Block */
   .card__title {} /* Element */
   .card--featured {} /* Modifier */
   ```

5. **Mobile-First Approach**: Design for mobile first, then enhance for larger screens.

   ```css
   .container {
     padding: 1rem;
   }
   
   @media (min-width: 768px) {
     .container {
       padding: 2rem;
     }
   }
   ```

6. **Avoid !important**: Only use `!important` as a last resort.

7. **Comment Your CSS**: Add comments to explain complex styling decisions.

## CSS Modules vs. Regular CSS

This project uses regular CSS files, but you can consider migrating to CSS Modules for better encapsulation if needed:

```jsx
// With CSS Modules
import styles from './Button.module.css';

function Button() {
  return <button className={styles.button}>Click me</button>;
}
```

## Adding New Styles

1. For global styles or variables, update the appropriate files in the `styles` directory.
2. For component-specific styles, add to the component's CSS file.
3. Consider whether a new style should be a utility class or component-specific.

## Accessibility

Ensure all styling maintains proper accessibility:

- Maintain sufficient color contrast
- Don't rely on color alone to convey information
- Ensure focus states are visible
- Test with screen readers and keyboard navigation
