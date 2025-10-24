import {
  VStack,
  Box,
  Text,
  Flex,
  HStack,
  Avatar,
  Button,
  Badge,
  Icon,
} from "@chakra-ui/react";
import { FiDownload } from "react-icons/fi";

// ✅ Define the version type
interface Version {
  id: number;
  label: string;
  editor: string;
  date: string;
  size: string;
  note: string;
  isCurrent: boolean;
}

// ✅ Define props type for VersionHistory
interface VersionHistoryProps {
  versions: Version[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  return (
    <VStack align="start" w="full" gap={4}>
      <Text fontWeight="semibold" fontSize="lg">
        Version History ({versions.length})
      </Text>

      <VStack w="full" align="stretch" gap={3}>
        {versions.map((ver: Version) => (
          <Box
            key={ver.id}
            w="full"
            p={4}
            bg={{ base: "gray.100", _dark: "gray.800" }}
            borderRadius="xl"
            boxShadow="sm"
          >
            <Flex justify="space-between" align="start" w="full">
              <HStack align="start" gap={4}>
                <Avatar.Icon name={ver.editor} />

                <VStack align="start" gap={1}>
                  <HStack>
                    <Text fontWeight="semibold">{ver.label}</Text>
                    {ver.isCurrent && (
                      <Badge colorScheme="blue" fontSize="xs">
                        Current
                      </Badge>
                    )}
                  </HStack>

                  <HStack gap={2} fontSize="sm" color="gray.500">
                    <Text>{ver.editor}</Text>
                    <Text>•</Text>
                    <Text>{ver.date}</Text>
                    <Text>•</Text>
                    <Text>{ver.size}</Text>
                  </HStack>

                  <Text fontSize="sm" color="gray.600">
                    {ver.note}
                  </Text>
                </VStack>
              </HStack>

              <VStack align="end" gap={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                >
                <Icon as={FiDownload} />
                  Download
                </Button>
                <HStack gap={2}>
                  <Button size="xs" variant="outline">
                    Restore
                  </Button>
                  <Button size="xs" variant="ghost">
                    Compare
                  </Button>
                </HStack>
              </VStack>
            </Flex>
          </Box>
        ))}
      </VStack>
    </VStack>
  );
}
