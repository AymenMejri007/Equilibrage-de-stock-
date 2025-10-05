# AI Rules for Frontend Application

This document outlines the core technologies and libraries used in this frontend application, along with guidelines for their appropriate usage.

## Tech Stack Description

*   **React**: The primary JavaScript library for building user interfaces.
*   **Vite**: A fast build tool that provides an excellent development experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Shadcn/ui**: A collection of reusable components built with Radix UI and styled with Tailwind CSS, providing a consistent and accessible UI.
*   **React Router DOM**: For declarative routing within the application.
*   **React Hook Form & Zod**: For efficient form management and schema-based validation.
*   **Lucide React**: A library for beautiful and customizable open-source icons.
*   **Sonner**: A modern toast component for displaying notifications.
*   **TypeScript**: (Implicitly, as Dyad defaults to TypeScript, though current files are `.jsx`, the intention is to use TypeScript for new files).

## Library Usage Rules

*   **UI Components**: Always prioritize using existing Shadcn/ui components. If a specific component is not available or needs significant modification, create a new component in `src/components/` and style it with Tailwind CSS. Do not modify existing Shadcn/ui component files directly.
*   **Styling**: Use Tailwind CSS exclusively for all styling. Leverage the `cn` utility function from `src/lib/utils.js` for conditionally combining Tailwind classes.
*   **Icons**: Use icons from the `lucide-react` library.
*   **Routing**: Implement all application routing using `react-router-dom`. Define routes within `src/App.jsx` (or `src/App.tsx` if converted to TypeScript).
*   **Form Handling**: Use `react-hook-form` for managing form state and submissions. For form validation, integrate `zod` schemas with `@hookform/resolvers`.
*   **Date Pickers**: Use `react-day-picker` for date selection functionalities, leveraging `date-fns` for date manipulation.
*   **Notifications**: For displaying toast notifications, use the `sonner` library.
*   **Mobile Detection**: Utilize the `useIsMobile` hook from `src/hooks/use-mobile.js` for responsive logic based on screen size.
*   **Animations**: For complex, interactive animations, use `framer-motion`. For simpler CSS-based animations, `tw-animate-css` can be used.
*   **Charts**: Use `recharts` for all data visualization and charting needs.
*   **Theming**: Manage dark/light mode and other theme-related functionalities using `next-themes`.
*   **Dialogs/Drawers**: For mobile-friendly bottom sheets or drawers, use `vaul`. For standard desktop dialogs, use `@radix-ui/react-dialog`.
*   **Utility Functions**: Place general utility functions in `src/lib/utils.js` (or `src/lib/utils.ts`).