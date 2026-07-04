import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers"

// @testing-library/jest-dom augmente le module "vitest", mais Vitest 3 ré-exporte
// `Assertion` depuis "@vitest/expect" : on augmente donc aussi ce module pour que
// `tsc` voie les matchers jest-dom (toBeInTheDocument, etc.) sur `expect(...)`.
declare module "@vitest/expect" {
  interface Assertion<T = unknown> extends TestingLibraryMatchers<unknown, T> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, unknown> {}
}
