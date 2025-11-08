"use client"

import { Button, Dialog, Portal, HStack} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Failed to log out", error)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        loading={loading}
        w="full"
        colorPalette="red"
      >
        Sign out
      </Button>

      <Dialog.Root open={open} placement={"center"} onOpenChange={({ open }) => setOpen(open)}>
        <Portal>
          <Dialog.Positioner zIndex={"popover"}>
            <Dialog.Backdrop />
            <Dialog.Content maxW="sm">
              <Dialog.Header>Confirm logout</Dialog.Header>
              <Dialog.Body>
                You are about to sign out. Any unsaved changes may be lost. Do you want to continue?
              </Dialog.Body>
              <Dialog.Footer>
                <HStack gap={3} justify="flex-end">
                  <Dialog.CloseTrigger asChild>
                    <Button variant="subtle" disabled={loading}>Cancel</Button>
                  </Dialog.CloseTrigger>
                  <Button colorPalette="red" onClick={handleLogout} loading={loading}>
                    Sign out
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
