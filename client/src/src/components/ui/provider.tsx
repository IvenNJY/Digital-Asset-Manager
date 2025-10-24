"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { Toaster } from "./toaster"

export function Provider({ children, ...props }: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme={"light"} enableSystem={true} {...props}>
        {children}
        <Toaster />
      </ColorModeProvider>
    </ChakraProvider>
  )
}
