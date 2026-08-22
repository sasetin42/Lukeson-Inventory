# Task Plan: Fix Admin Sidebar Initial Load

## Problem
When an Admin logs in, the sidebar functions/menu are blank on initial load because hasAccess in client-layout.tsx returns false for all navigation items when rolePermissions is null or missing in Firestore.

## Proposed Changes
- src/components/client-layout.tsx
- src/context/auth-context.tsx
