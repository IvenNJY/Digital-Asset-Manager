import React from 'react'
import {
  HStack,
  Button,
  Icon,
  Badge,
  Text,
} from '@chakra-ui/react'
import { FiEye, FiFileText, FiClock } from 'react-icons/fi'

type Action = 'preview' | 'metadata' | 'versions'

interface SwitchViewProps {
  active?: Action
  versionsCount?: number
  onChange?: (action: Action) => void
  // optional callbacks for direct handling
  onPreview?: () => void
  onMetadata?: () => void
  onVersions?: () => void
}

export default function SwitchView({
  active = 'preview',
  versionsCount = 0,
  onChange,
  onPreview,
  onMetadata,
  onVersions,
}: SwitchViewProps) {
  const activeBg = { base: 'gray.100', _dark: 'gray.700' }
  const hoverBg = { base: 'whiteAlpha.200', _dark: 'whiteAlpha.400' }
  const inactiveColor = 'gray.600'

  const handle = (action: Action) => {
    onChange?.(action)
    if (action === 'preview') onPreview?.()
    if (action === 'metadata') onMetadata?.()
    if (action === 'versions') onVersions?.()
  }

  const pill = (action: Action, icon: any, label: string, extra?: React.ReactNode) => {
    const isActive = active === action
    return (
      <Button
        onClick={() => handle(action)}
        size="sm"
        bg={isActive ? activeBg : 'transparent'}
        _hover={{ bg: hoverBg }}
        color={isActive ? undefined : inactiveColor}
        borderRadius="full"
        px={4}
        py={2}
        boxShadow={isActive ? 'sm' : 'none'}
        variant="ghost"
      >
        <Icon as={icon} />
        <HStack gap={2}>
          <Text fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          {extra}
        </HStack>
      </Button>
    )
  }

  return (
    <HStack gap={2} align="center">
      {pill('preview', FiEye, 'Preview')}
      {pill('metadata', FiFileText, 'Metadata')}
      {pill(
        'versions',
        FiClock,
        'Versions',
        versionsCount > 0 ? (
          <Badge ml={1} colorScheme="gray" variant="subtle" fontSize="xs">
            {versionsCount}
          </Badge>
        ) : null
      )}
    </HStack>
  )
}