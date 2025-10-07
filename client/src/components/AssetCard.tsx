import {  Badge, Card, HStack, Image, Text } from "@chakra-ui/react"

export default function AssetCard() {
  return (
    <Card.Root maxW={60} variant={"outline"} overflow="hidden">
      <Image
        src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
        alt="Green double couch with wooden legs"
      />
      <Card.Body gap="2">
        <Card.Title>Living room Sofa</Card.Title>
        <Card.Description>
          This sofa is perfect for modern tropical spaces, baroque inspired
          spaces.
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
