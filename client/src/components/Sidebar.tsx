"use client";

import ThemeToggle from './ThemeToggle';
import {
  Avatar,
  Box,
  Flex,
  Icon,
  Text,
  Stack,
  Button,
  BoxProps,
  Drawer,
  IconButton,
  Portal,
  useDisclosure,
  Progress,
  Heading,
  HStack,
} from '@chakra-ui/react';

// Here we have used react-icons package for the icons
import { FaBell } from 'react-icons/fa';
import { BsFolder2 } from 'react-icons/bs';
import { FiUpload, FiImage, FiVideo, FiFileText, FiStar, FiClock, FiArchive, FiTrash2 } from 'react-icons/fi';
import { FiMenu } from 'react-icons/fi';
import AssetCard from './AssetCard';

export default function Sidebar() {
  const { open, onOpen, setOpen } = useDisclosure();

  return (
    <Box as="section" minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.800' }}>
      <SidebarContent display={{ base: 'none', md: 'unset' }} />
      <Drawer.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="start">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <SidebarContent w="full" borderRight="none" />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <Box ml={{ base: 0, md: 72 }} transition=".3s ease" >
        <Flex
          as="header"
          align="center"
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
          w="full"
          px="4"
          borderBottomWidth="1px"
          borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
          bg={{ base: 'white', _dark: 'gray.900' }}
          boxShadow="sm"
          h="14"
        >
          <IconButton
            aria-label="Menu"
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onOpen}
            size="md"
          >
            <FiMenu />
          </IconButton>

          <Flex align="center">
            <ThemeToggle />
            <Box ml="4" cursor="pointer">
              <Avatar.Root size="sm">
                <Avatar.Fallback name="Ahmad" />
                <Avatar.Image src="https://avatars2.githubusercontent.com/u/37842853?v=4" />
              </Avatar.Root>
            </Box>
          </Flex>
        </Flex>

        <Box as="main" p={6} minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.800' }}>
          <Heading>Welcome to the Dashboard</Heading>
          <HStack  mt={6} wrap="wrap" gap={4} >
            <AssetCard />
            <AssetCard />
            <AssetCard />
            <AssetCard />
            <AssetCard />
          </HStack>

        </Box>
      </Box>
    </Box>
  );
}

const SidebarContent = ({ ...props }: BoxProps) => (
  <Box
    as="nav"
    pos="fixed"
    top="0"
    left="0"
    zIndex="sticky"
    h="full"
    pb="4"
    overflowX="hidden"
    overflowY="auto"
    borderRightWidth="1px"
    borderColor={{ base: 'gray.200', _dark: 'gray.700' }}
    bg={{ base: 'white', _dark: 'gray.900' }}
    w="72"
    {...props}
  >
    <Flex direction="column" h="full" px="4" py="5" gap="4">
      {/* Upload button */}
      <Button w="full" justifyContent="center" variant="outline" gap="2">
        <FiUpload />
        Upload Assets
      </Button>

      {/* Highlighted All Assets tile */}
      <Flex
        align="center"
        gap="3"
        px="4"
        py="3"
        rounded="xl"
        cursor="pointer"
        _hover={{ bg: { base: 'gray.800', _dark: 'gray.600' } }}
        bg={{ base: 'black', _dark: 'gray.800' }}
        color={{ base: 'white', _dark: 'gray.100' }}

        // align="center"
        // gap="3"
        // px="4"
        // py="3"
        // cursor="pointer"
        // w="full"
        // bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        // color="white"
        // _hover={{
        //   transform: 'translateY(-1px)',
        //   shadow: 'lg'
        // }}
        // _active={{
        //   transform: 'translateY(0)'
        // }}
        // transition="all 0.2s"
        // borderRadius="lg"
        // fontWeight="semibold"
      >
        <Icon as={BsFolder2} />
        <Text fontWeight="semibold">All Assets</Text>
      </Flex>

      {/* Folders section */}
      <Box pt="2">
        <Text
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="widest"
          mb="2"
          opacity={0.7}
        >
          FOLDERS
        </Text>
        <Stack gap="1">
          <SidebarItem icon={BsFolder2} label="All Assets" count={42} />
          <SidebarItem icon={FiImage} label="Images" count={28} />
          <SidebarItem icon={FiVideo} label="Videos" count={8} />
          <SidebarItem icon={FiFileText} label="Documents" count={6} />
        </Stack>
      </Box>

      {/* Collections section */}
      <Box pt="4">
        <Text
          fontSize="xs"
          fontWeight="bold"
          letterSpacing="widest"
          mb="2"
          opacity={0.7}
        >
          COLLECTIONS
        </Text>
        <Stack gap="1">
          <SidebarItem icon={FiStar} label="Starred" count={12} />
          <SidebarItem icon={FiClock} label="Recent" count={15} />
          <SidebarItem icon={FiArchive} label="Archive" count={3} />
          <SidebarItem icon={FiTrash2} label="Trash" count={2} />
        </Stack>
      </Box>

      <Box mt="auto">
        <Text fontSize="xs" mb="2" opacity={0.8}>
          Storage Used: 2.4 GB / 10 GB
        </Text>
        <Progress.Root value={24} size="sm" colorPalette="blue" rounded="full">
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      </Box>
    </Flex>
  </Box>
);

type SidebarItemProps = {
  icon: React.ElementType; 
  label: string;
  count?: number;
};

const SidebarItem = ({ icon, label, count }: SidebarItemProps) => {
  return (
    <Flex
      align="center"
      justify="space-between"
      px="3"
      py="2"
      rounded="md"
      cursor="pointer"
      transition=".15s ease"
      _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
    >
      <Flex align="center" gap="3">
        <Icon as={icon} boxSize="4" opacity={0.7} />
        <Text>{label}</Text>
      </Flex>
      {typeof count === 'number' && (
        <Box 
          px="2.5" 
          py="0.5" 
          rounded="full" 
          bg={{ base: 'gray.100', _dark: 'gray.700' }}
          fontSize="xs" 
          opacity={0.9}
        >
          {count}
        </Box>
      )}
    </Flex>
  );
};
