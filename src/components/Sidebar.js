import { Button, VStack, Box , Text} from "@chakra-ui/react"
import { HiOutlineHome, HiOutlinePhotograph, HiOutlineCloudUpload, HiOutlineSearch, HiOutlineTag, HiOutlineUsers } from "react-icons/hi"
import ThemeToggle from "./ThemeToggle"

export default function Sidebar() {
  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      height="100vh"
      width="15rem"
      bg="gray.100"
      _dark={{ bg: "gray.800" }}
      p={4}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={8}>MyApp</Text>
      <VStack align="start" spacing={4}>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlineHome /> Dashboard
        </Button>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlinePhotograph /> Assets
        </Button>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlineCloudUpload /> Upload
        </Button>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlineSearch /> Search
        </Button>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlineTag /> Metadata
        </Button>
        <Button variant="ghost" w="full" justifyContent="start">
          <HiOutlineUsers /> Users
        </Button>
      </VStack>
      <ThemeToggle />
    </Box>
  )
}
