import LoginView from "@/components/auth/LoginView"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { getCurrentUser } from "@/lib/server-auth"
import { Flex, Heading, Stack, Text } from "@chakra-ui/react"
import { redirect } from "next/navigation"

export default async function Page() {
  const currentUser = await getCurrentUser()

  if (currentUser) {
    redirect("/dashboard")
  }

  return (
    <Flex
      minH="100vh"
      w="full"
      align="center"
      justify="center"
      px={{ base: 4, md: 6 }}
      py={{ base: 12, md: 16 }}
      gap={6}
    >
      <ThemeToggle />
      <Stack gap={6} align="center">
        <Stack gap={2} textAlign="center">
          <Heading size="lg">Digital Asset Manager</Heading>
          <Text color="gray.500">Sign in to access the dashboard.</Text>
        </Stack>
        <LoginView />
      </Stack>
    </Flex>
  )
}
