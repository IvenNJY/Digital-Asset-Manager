"use client"

import React, { createContext, useContext } from 'react';
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const AppContext = createContext({});

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider defaultTheme='dark' enableSystem = {false} {...props} />
    </ChakraProvider>
  )
};

export const useAppContext = () => useContext(AppContext);
