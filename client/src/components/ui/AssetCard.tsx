import React from "react"
import { Badge, Card, HStack, VStack, Image as ChakraImage, Box, Text } from "@chakra-ui/react"
import { AssetGLBViewer } from "../AssetModal/AssetGLBViewer"
import { FaFile } from "react-icons/fa";

type AssetCardProps = {
  view?: "grid" | "list"
  url: string
  name: string
  description: string
  asset_type: string
  uploaded_by?: string
  uploaded_at?: string
  tags?: string[]
}


export default function AssetCard({
  view = "grid",
  url,
  name,
  description,
  asset_type,
  uploaded_by,
  uploaded_at,
  tags = []
}: AssetCardProps) {
  const badgeLabels = tags.length ? tags : [asset_type || "Company Asset"]
  const uploadedAtLabel = uploaded_at
    ? uploaded_at.replace("T", " ").replace("Z", " UTC")
    : ""

  const lowerUrl = url.toLowerCase()
  const isGLB = lowerUrl.endsWith(".glb") || lowerUrl.endsWith(".gltf")
  const isVideo = /\.(mp4|mov|webm|avi|mkv)$/i.test(lowerUrl)
  const isDocument = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|appl)$/i.test(url.toLowerCase());

  function truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      // Truncate the string and append an ellipsis
      return text.substring(0, maxLength) + '...';
    }
    // Return the original string if it's within the limit
    return text;
  }

  // Shared media preview component
  const Media = () => {
    if (isGLB) {
      return (
        <Box position="relative" width="100%" height="200px" pointerEvents="none">
          <AssetGLBViewer src={url} width="100%" height="200px" />
        </Box>
      );
    }



    if (isVideo) {
      return (
        <Box position="relative" w="full" h="200px" overflow="hidden">
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
          <Box
            position="absolute"
            top="0"
            left="0"
            w="full"
            h="full"
            bg="rgba(0,0,0,0.3)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          />  
        </Box>
      )
    }

      if (isDocument) {
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="200px"
            bg={{ base: "gray.100", _dark: "gray.900" }}
            position="relative"
            cursor="pointer"
          >
            {/* PDF Icon in the middle */}
            <FaFile size={48} color="#E53E3E" />
          </Box>
        );
      }

    return (
      <Box position="relative" w="full" h="200px" flexShrink={0}>
        <ChakraImage
          src={url}
          alt={name}
          objectFit="cover"
          w="full"
          h="full"
        />
      </Box>
    )
  }
  
  // List view
  if (view === "list") {
    return (
      <Card.Root
        w="full"
        h="full"
        variant="outline"
        overflow="hidden"
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
        transition={"0.3s all ease-in-out"}
        _hover={{ shadow: "md" }}
      >
        <Box w={{ base: "100%", md: "240px" }} maxH="180px" flexShrink={0}>
          <Media />
        </Box>

        <Card.Body gap="2" flex="1">
          <Card.Title>{name}</Card.Title>
          <Card.Description>{description}</Card.Description>
          {(uploaded_by || uploaded_at) && (
            <Card.Description fontSize="sm" color="gray.500">
              {uploaded_by && `Uploaded by ${uploaded_by}`}
              {uploaded_by && uploaded_at && " • "}
              {uploadedAtLabel && `On ${uploadedAtLabel}`}
            </Card.Description>
          )}
        </Card.Body>

        <Card.Footer gap="2">
          <VStack justify="space-between" w="full" align="end">
            {badgeLabels.slice(0, 3).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
          {badgeLabels.length > 3 && (
            <Badge size="sm" colorScheme="gray">
              +{badgeLabels.length - 3} 
            </Badge>
          )}
          </VStack>
        </Card.Footer>
      </Card.Root>
    )
  }

  // Grid view
  return (
    <Card.Root
      w="full"
      h="full"
      variant="outline"
      overflow="hidden"
      display="flex"
      flexDirection="column"
      transition={"0.3s all ease-in-out"}
      _hover={{ shadow: "md" }}
    >
      <Media />

      <Card.Body gap="2" flex="1" justifyContent="space-between">
        <Card.Title>{truncateText(name, 15)}</Card.Title>
            <Card.Description>{truncateText(description, 20)}</Card.Description>
      </Card.Body>

      <Card.Footer gap="2">
        <HStack justify="flex-start" w="full" flexWrap="wrap" gap="1">
          {badgeLabels.slice(0, 2).map((tag) => (
            <Badge key={tag} size="sm">
              {tag}
            </Badge>
          ))}
          {badgeLabels.length > 2 && (
            <Badge size="sm" colorScheme="gray">
              +{badgeLabels.length - 2} 
            </Badge>
          )}
        </HStack>
      </Card.Footer>
    </Card.Root>
  )
}
