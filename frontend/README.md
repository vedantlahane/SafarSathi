# SafarSathi Frontend

SafarSathi is a travel safety companion showcasing secure onboarding, live risk awareness,
and SOS tooling. The React codebase now includes JSDoc-style documentation across the
primary pages, components, utilities, and the authentication context to make onboarding
new contributors easier.

## Developer Notes

- Page components (`Login`, `Register`, `Dashboard`, `MapView`) document their key event
	handlers and effects, outlining validation, geolocation, and sharing workflows.
- Shared services such as `AuthContext` and helpers in `src/utils/helpers.js` include
	parameter/return annotations for quick reference.
- Trigger `npm run build` to validate edits; the output warns about bundle size but still
	succeeds.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
