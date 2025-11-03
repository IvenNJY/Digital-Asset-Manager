"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Image,
  HStack,
  Button,
  Flex,
  Box,
  Spinner,
  Center,
  Text,
  Dialog,
  Portal,
  CloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { FiDownload, FiTrash } from 'react-icons/fi';
import SwitchView from './SwitchView';
import VersionHistory from './VersionHistory';
import AssetPreview from './AssetPreview';
import AssetMetadata from './AssetMetadata';
import { Version } from './type';
import { toaster } from '@/components/ui/toaster';
import { useAuthUser } from '@/components/auth/PrivateRoute';
import { AssetGLBViewer } from './AssetGLBViewer';
import { FaFile } from "react-icons/fa";

type Asset = {
  id: number;
  name: string;
  description?: string;
  type?: string;
  asset_type?: string;
  url: string;
  file_path?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  size_bytes?: number;
  metadata: Array<{
    key: string;
    value: string;
    data_type: string;
  }>;
  tags: string[];
  versions?: Array<{
    id: number;
    version_number: number;
    uploaded_by: string;
    uploaded_at: string;
    changes_note: string;
    file_path: string;
    size_bytes?: number;
    snapshot: {
      asset: {
        name: string;
        description?: string;
        asset_type: string;
      };
      metadata: Array<{ key: string; value: string; data_type: string }>;
      tags: string[];
    };
  }>;
};

type Action = 'preview' | 'metadata' | 'versions';

interface Props {
  asset: Asset;
  onPreview: (src: string) => void;
}

export default function AssetMenu({ asset }: Props) {
  const { url, name, file_path } = asset;
  const [active, setActive] = useState<Action>('preview');
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const muted = { base: 'gray.600', _dark: 'gray.400' };
  const authUser = useAuthUser();
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const { onClose } = useDisclosure();
  const isGLB = url?.toLowerCase().endsWith('.glb') || url?.toLowerCase().endsWith('.gltf');
  const canManageAssets = useMemo(() => {
    const role = authUser?.role?.toLowerCase() ?? null;
    return role === 'admin' || role === 'editor';
  }, [authUser?.role]);

  // Fetch versions
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoadingVersions(true);
        const res = await fetch(`http://localhost:8000/api/assets/${asset.id}/versions/`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setVersions(data.versions || []);
        }
      } catch (err) {
        console.error('Error fetching versions:', err);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    if (active === 'versions') {
      fetchVersions();
    }
  }, [asset.id, active]);

  // DOWNLOAD CURRENT ASSET
  const handleDownload = async () => {
    if (!file_path) {
      toaster.create({ title: "No file to download", type: "error" });
      return;
    }
    const fileName = file_path.split("/").pop() || name;
    const fileUrl = `http://localhost:8000/media/${file_path}`;
    try {
      toaster.create({ title: "Downloading…", type: "info" });
      const response = await fetch(fileUrl, { credentials: "include" });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toaster.create({ title: "Download complete", type: "success" });
    } catch (err) {
      toaster.create({ title: "Download failed", description: "Please try again.", type: "error" });
    }
  };

  // DELETE ASSET
  const handleDelete = async () => {
    try {
      toaster.create({ title: "Deleting asset…", type: "info" });
      const res = await fetch(`http://localhost:8000/api/assets/${asset.id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");
      toaster.create({
        type: "success",
        title: "Deleted Completed",
        description: "Please refresh to see the changes.",
        action: { label: "Refresh", onClick: () => window.location.reload() },
      });
      onClose?.();
    } catch (err) {
      toaster.create({ title: "Delete failed", description: "Please try again.", type: "error" });
    }
  };

  return (
    <Card.Root
      w="full"
      maxW="1100px"
      mx={0}
      h="auto"
      variant="outline"
      overflow="hidden"
      display="flex"
      alignItems="stretch"
      flexDirection={{ base: 'column', md: 'row' }}
    >

    <Box
      onClick={() => setPreviewSrc(url)} // or use onPreview(url)
      overflow="hidden"
      cursor="pointer"
      borderRadius="md"
      bg="gray.100"
      display="flex"
      alignItems="center"
      justifyContent="center"
      w="30%"
      minW={{ base: '100%', md: '280px' }}
      gap={4}
      minH="300px"
      maxH="90vh"
      overflowY="auto"
    >
      {/* Determine file type */}
      {url.toLowerCase().endsWith(".glb") ? (
        <Box textAlign="center">
          {previewSrc ? (
            <AssetGLBViewer key={previewSrc} src={previewSrc} width="300px" height="400px" />
          ) : (
            <Text color="gray.500" py={6}>Click to preview 3D model</Text>
          )}
        </Box>
      ) : [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"]
          .some(ext => url.toLowerCase().endsWith(ext)) ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          w="100%"
          h="100%"
          cursor="pointer"
          onClick={() => window.open(url, "_blank")} // open PDF in new tab
        >
          <FaFile size={48} color="#E53E3E" />
          <Text mt={2} color="gray.500" fontSize="sm">
            Click to view/download
          </Text>
        </Box>
      ) : url.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
        <video
          src={url}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      ) : (
        <Image
          src={url}
          alt={name}
          objectFit="cover"
          w={{ base: "100%", md: "280px" }}
          h="100%"
          alignSelf="stretch"
        />
      )}
    </Box>

      <Portal>
        {previewSrc && (
          <Box
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.85)"
            zIndex={5000} // make sure it's above popover
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={(e) => {
              e.stopPropagation()  // <- prevent popover from closing
              setPreviewSrc(null)
            }}
          >
            <Box
              onClick={(e) => e.stopPropagation()} // stop clicks inside
              borderRadius="md"
              overflow="hidden"
              position="relative"
            >
              {previewSrc.toLowerCase().endsWith(".glb") ? (
                <AssetGLBViewer src={previewSrc} width="600px" height="600px" />
              ) : [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt"]
                  .some(ext => url.toLowerCase().endsWith(ext)) ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  w="100%"
                  h="100%"
                  cursor="pointer"
                  bg={{ base: "gray.100", _dark: "gray.800" }}
                  p={12}
                >
                  <Text mt={2} color="gray.500" fontSize="sm">The preview of the file is opened on another page or been downloaded.</Text>
                </Box>
              ):  previewSrc.match(/\.(mp4|mov|webm|avi|mkv)$/i) ? (
                <video
                  src={previewSrc}
                  controls
                  autoPlay
                  style={{
                    maxHeight: "90vh",
                    maxWidth: "90vw",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <Image
                  src={previewSrc}
                  maxH="90vh"
                  borderRadius="md"
                  objectFit="contain"
                />
              )}
              <Button
                position="absolute"
                top="4"
                right="4"
                onClick={(e) => {
                  e.stopPropagation(); // prevent close on button click
                  setPreviewSrc(null);
                }}
              >
                Close
              </Button>
            </Box>
          </Box>
        )}
      </Portal>

      {/* Remaining Card.Body and controls unchanged */}
      <Card.Body gap="2" flex="1" px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
        <Flex w="full" align="center" justify="space-between" gap={3}>
          <HStack gap={3} align="center">
            <Box>
              <Card.Title>{name}</Card.Title>
              <Box color={muted} fontSize="sm">Company Asset</Box>
            </Box>
          </HStack>
          <HStack gap={2} align="center">
            <Box w="full" bg={{ base: "gray.300", _dark: "gray.800" }} p={1} borderRadius="full">
              <SwitchView active={active} versionsCount={versions.length} onChange={setActive} />
            </Box>
            <HStack gap={2}>
              <Button size="sm" color={{ base: "black", _dark: "white" }} bg={{ base: 'whiteAlpha.200', _dark: 'whiteAlpha.400' }} borderColor={{ base: 'blackAlpha.500', _dark: 'whiteAlpha.600' }} _hover={{ bg: { base: 'gray.200', _dark: 'gray.500' } }} onClick={handleDownload}><FiDownload /></Button>
              {canManageAssets && (
                <Dialog.Root role="alertdialog">
                  <Dialog.Trigger asChild>
                    <Button size="sm" color={{ base: "black", _dark: "white" }} bg="red.600" borderColor={{ base: 'blackAlpha.500', _dark: 'redAlpha.900' }} _hover={{ bg: { base: 'red.500', _dark: 'red.500' } }}>
                      <FiTrash />
                    </Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner zIndex="popover">
                      <Dialog.Content>
                        <Dialog.Header>
                          <Dialog.Title>Delete Asset?</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                          <p>This action <strong>cannot be undone</strong>. This will permanently delete <strong>{name}</strong> and all its versions.</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                          <Dialog.ActionTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </Dialog.ActionTrigger>
                          <Dialog.ActionTrigger asChild>
                            <Button colorPalette="red" onClick={handleDelete}>Delete</Button>
                          </Dialog.ActionTrigger>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                          <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              )}
            </HStack>
          </HStack>
        </Flex>

        <Box mt={4} w="full">
          {active === 'preview' && <AssetPreview asset={asset} />}
          {active === 'metadata' && <AssetMetadata assetId={asset.id} />}
          {active === 'versions' && (
            <>
              {isLoadingVersions ? (
                <Center p={8}><Spinner size="lg" /></Center>
              ) : versions.length === 0 ? (
                <Center p={8}><Text color="gray.500">No version history yet.</Text></Center>
              ) : (
                <VersionHistory versions={versions} />
              )}
            </>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
