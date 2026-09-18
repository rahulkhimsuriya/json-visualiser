---
paths:
  - "app/components/dataset/**/*"
---

# Dataset & Table Virtualization Rules

- **Virtualization Required**: Data tables rendering dynamic or user-supplied rows must use `@tanstack/react-virtual` to ensure DOM efficiency with 10k+ rows.
- **Memoization**: Memoize filtered, searched, and sorted dataset rows with React's `useMemo` to prevent unneeded AlaSQL or JavaScript recalculations during re-renders.
- **Dynamic Columns**: Handle heterogeneous JSON properties and missing/null values gracefully using `NullDisplayFormat` from workspace settings.
