import React from 'react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import ThemeToggle from './ThemeToggle'

type HeaderProps = {
  title: string;
  description: string;
};

function Header({ title, description }: HeaderProps) {
  return (
    <div>
    <HStack justifyContent="space-between" mb={4}>
            <Stack gap={1} flex="1">
              <Text fontSize="xl" fontWeight="semibold">
                  {title}
              </Text>
              <Text fontSize="md" color={{ base: 'gray.600', _dark: 'whiteAlpha.700' }}>
                  {description}
              </Text>
            </Stack>
            <ThemeToggle />
      </HStack>
    </div>
  )
}

export default Header
