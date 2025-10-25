import { Badge, Card, HStack, Image, VStack } from "@chakra-ui/react"

type AssetCardProps = {
  view?: "grid" | "list"
  url: string
  name: string
  description: string
  asset_type: string
  uploaded_by?: string
  uploaded_at?: string
}

export default function AssetCard({ view = "grid", url, name, description, asset_type, uploaded_by, uploaded_at }: AssetCardProps) {
  if (view === "list") {
    return (
      <Card.Root
        w="full"
        h="full"
        variant="outline"
        overflow="hidden"
        display="flex"
        flexDirection={{ base: "column", md: "row" }}
      >
        <Image
          src={url}
          alt={name}
          objectFit="cover"
          w={{ base: "100%", md: "240px" }}
          maxH="200px"
          flexShrink={0}
        />
        <Card.Body gap="2" flex="1">
          <Card.Title>{name}</Card.Title>
          <Card.Description>
            {description}
          </Card.Description>
        </Card.Body>
        <Card.Footer gap="2">
          <VStack justify="space-between" w="full">
            <Badge size="md">Company Asset</Badge>
          </VStack>
        </Card.Footer>
      </Card.Root>
    )
  } else {
    // Grid view
    return (
      <Card.Root
        w="full"
        h="full"
        variant="outline"
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        <Image
          src={url}
          alt={name}
          objectFit="cover"
          w="full"
          h="200px"
          flexShrink={0}
        />
        <Card.Body gap="2" flex="1" justifyContent="space-between">
          <Card.Title>{name}</Card.Title>
          <Card.Description>
            {description}
          </Card.Description>
        </Card.Body>
        <Card.Footer gap="2">
          <HStack justify="space-between" w="full">
            <Badge size="md">Company Asset</Badge>
          </HStack>
        </Card.Footer>
      </Card.Root>
    )
  }
}
