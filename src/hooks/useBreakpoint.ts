import { useMediaQuery } from "./useMediaQuery"

/**
 * Breakpoints alinhados com Tailwind CSS.
 *
 * | Breakpoint | Min Width | Tailwind Prefix |
 * |------------|-----------|-----------------|
 * | sm         | 640px     | sm:             |
 * | md         | 768px     | md:             |
 * | lg         | 1024px    | lg:             |
 * | xl         | 1280px    | xl:             |
 * | 2xl        | 1536px    | 2xl:            |
 */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const

export type BreakpointKey = keyof typeof breakpoints

/**
 * Hook de conveniência que expõe todos os breakpoints como booleans.
 *
 * @example
 * const { isMobile, isTablet, isDesktop } = useBreakpoint()
 *
 * if (isMobile) {
 *   // Renderizar versão mobile
 * }
 */
export function useBreakpoint() {
  const sm = useMediaQuery(breakpoints.sm)
  const md = useMediaQuery(breakpoints.md)
  const lg = useMediaQuery(breakpoints.lg)
  const xl = useMediaQuery(breakpoints.xl)
  const xxl = useMediaQuery(breakpoints["2xl"])

  return {
    // Breakpoints individuais (>= breakpoint)
    sm,
    md,
    lg,
    xl,
    "2xl": xxl,

    // Aliases semânticos
    /** Tela < 768px (celulares) */
    isMobile: !md,
    /** Tela >= 768px e < 1024px (tablets) */
    isTablet: md && !lg,
    /** Tela >= 1024px (desktops) */
    isDesktop: lg,

    // Helpers para orientação de layout
    /** Sidebar deve ser colapsável (< 1024px) */
    shouldCollapseSidebar: !lg,
  }
}
