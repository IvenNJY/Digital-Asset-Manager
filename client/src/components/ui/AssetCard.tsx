"use client";

import React from "react";
import { Box, Text, HStack, VStack, Tag } from "@chakra-ui/react";

type AssetCardProps = {
  view: "grid" | "list";
  url?: string | null;
  name?: string;
  description?: string;
  asset_type?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  tags?: string[];
};

export default function AssetCard({
  view,
  url,
  name,
  description,
  asset_type,
  uploaded_by,
  uploaded_at,
  tags = [],
}: AssetCardProps) {
  const isList = view === "list";

  return (
    <Box
      role="button"
      aria-label={name ?? "asset"}
      borderRadius="md"
      overflow="hidden"
      bg="white"
      _dark={{ bg: "gray.800" }}
      boxShadow="sm"
      transition="transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease"
      _hover={{
        transform: "translateY(-6px) scale(1.01)",
        boxShadow: "lg",
      }}
      cursor="pointer"
      display="flex"
      flexDirection={isList ? "row" : "column"}
      alignItems={isList ? "center" : "stretch"}
      gap={3}
      p={isList ? 3 : 0}
    >
      <Box
        flexShrink={0}
        w={isList ? "160px" : "100%"}
        h={isList ? "96px" : "140px"}
        position="relative"
        bg="gray.50"
        _dark={{ bg: "gray.700" }}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* image with graceful fallback and lazy loading */}
        <img
          src={url ?? "/placeholder.png"}
          alt={name ?? "asset"}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            const el = e.currentTarget as HTMLImageElement;
            el.onerror = null;
            el.src = "/placeholder.png";
          }}
        />

        {/* subtle overlay on hover */}
        <Box
          position="absolute"
          inset={0}
          bg="linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.35) 100%)"
          opacity={0}
          _hover={{ opacity: 1 }}
          transition="opacity 220ms ease"
        />
      </Box>

      <VStack align="start" spacing={1} px={isList ? 2 : 3} py={isList ? 0 : 3}>
        <Text fontSize="sm" fontWeight="semibold" isTruncated maxW="100%">
          {name ?? "Untitled asset"}
        </Text>

        {description ? (
          <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.300" }} noOfLines={2}>
            {description}
          </Text>
        ) : (
          <Text fontSize="xs" color="gray.500" _dark={{ color: "gray.400" }}>
            No description
          </Text>
        )}

        {/* Tag chips */}
        <HStack spacing={2} pt={1} wrap="wrap">
          {(tags || []).slice(0, 3).map((t) => (
            <Tag.Root key={t} size="sm" colorPalette="green">
              <Tag.Label>{t}</Tag.Label>
            </Tag.Root>
          ))}
          {tags && tags.length > 3 ? (
            <Tag.Root size="sm">
              <Tag.Label>+{tags.length - 3}</Tag.Label>
            </Tag.Root>
          ) : null}
        </HStack>

        <HStack spacing={3} pt={1}>
          <Text fontSize="xx-small" color="gray.500">
            {asset_type ?? "—"}
          </Text>
          <Text fontSize="xx-small" color="gray.400">
            {uploaded_by ? `by ${uploaded_by}` : ""}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}
