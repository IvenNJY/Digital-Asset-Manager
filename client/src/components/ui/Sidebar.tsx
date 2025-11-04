"use client";

import type { ElementType, ReactNode } from 'react';

import {
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
} from '@chakra-ui/react';

import type { CurrentUser } from '@/lib/auth';
import { BsFolder2 } from 'react-icons/bs';
import {
  FiUpload,
  FiImage,
  FiVideo,
  FiFileText,
  FiMenu,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi';
import LogoutButton from '../auth/LogoutButton';
import Link from 'next/link';
import { useEffect, useState } from "react";

type SidebarProps = {
  user: CurrentUser;
  children?: ReactNode;
};

export default function Sidebar({ user, children }: SidebarProps) {
  const { open, onOpen, setOpen } = useDisclosure();
  const userRole = user.role?.toLowerCase() ?? null;
 // const username = user.username || 'User';
  const content = children ?? (
    <Stack gap={3} color={{ base: 'gray.600', _dark: 'gray.300' }}>
      <Text>Select an option from the sidebar to get started.</Text>
    </Stack>
  );

  return (
    <Box as="section" minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.800' }}>
      <SidebarContent display={{ base: 'none', md: 'unset' }} userRole={userRole} />
      <Drawer.Root open={open} onOpenChange={(event) => setOpen(event.open)} placement="start">
        <Portal>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <SidebarContent w="full" borderRight="none" userRole={userRole} />
            </Drawer.Content>
          </Drawer.Positioner>
        </Portal>
      </Drawer.Root>
      <Box ml={{ base: 0, md: 72 }} transition=".3s ease">
        <Box as="main" p={6} minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.800' }}>
          <Flex align="center" justify="space-between" mb={{ base: 0, md: 6 }}>
            <IconButton
              aria-label="Open navigation"
              display={{ base: 'inline-flex', md: 'none' }}
              bg="transparent"
              onClick={onOpen}
            >
              <FiMenu />
            </IconButton>

          </Flex>

          {content}
        </Box>
      </Box>
    </Box>
  );
}

type SidebarContentProps = BoxProps & {
  userRole: string | null;
};

const SidebarContent = ({ userRole, ...props }: SidebarContentProps) => {
  const canManageUsers = userRole === 'admin';
  const canViewInsights = userRole === 'admin' || userRole === 'editor';
  const showAdminSection = canManageUsers || canViewInsights;
  const canUpload = userRole === "admin" || userRole === "editor";

  const [assetCounts, setAssetCounts] = useState({
    all: 0,
    images: 0,
    videos: 0,
    documents: 0,
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("http://localhost:8000/api/assets/summary/");
        if (!res.ok) throw new Error("Failed to load summary");
        const data = await res.json();
        setAssetCounts(data);
      } catch (err) {
        console.error("Error fetching asset summary:", err);
      }
    }

    fetchCounts();
  }, []);

  return (
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
      w={{ base: "72", md: "72" }}
      {...props}
    >
      <Flex direction="column" h="full" px="4" py="5" gap="4">
        {/* Upload button */}
        {canUpload && (
          <Link href="/asset-upload">
            <Button w="full" justifyContent="center" variant="outline" gap="2">
              <FiUpload />
              Upload Assets
            </Button>
          </Link>
        )}

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
            <SidebarItem icon={BsFolder2} label="All Assets" link='/dashboard' count={assetCounts.all} />
            <SidebarItem icon={FiImage} label="Images" count={assetCounts.images} />
            <SidebarItem icon={FiVideo} label="Videos" count={assetCounts.videos} />
            <SidebarItem icon={FiFileText} label="Documents" count={assetCounts.documents} />
          </Stack>
        </Box>


        {showAdminSection && (
          <Box pt="4">
            <Text
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
              mb="2"
              opacity={0.7}
            >
              ADMIN TOOLS
            </Text>
            <Stack gap="1">
              {canManageUsers && <SidebarItem icon={FiUsers} label="User Management" link='./user_management' />}
              {canViewInsights && <SidebarItem icon={FiBarChart2} label="Insights" link='./insights' />}
            </Stack>
          </Box>
        )}

        <LogoutButton />

        <Box mt="auto">
          <Text fontSize="sm" mb="2" opacity={0.8}>
            Storage Used: 2.4 GB / 10 GB
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

type SidebarItemProps = {
  icon: ElementType;
  label: string;
  count?: number;
  link?: string;
};

const SidebarItem = ({ icon, label, count, link }: SidebarItemProps) => {
  const itemContent = (
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

  return link ? <Link href={link}>{itemContent}</Link> : itemContent;
  // To allow link to encapsulate the entire item for better clickability
};

