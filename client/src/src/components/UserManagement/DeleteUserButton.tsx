"use client"

import { useState } from "react"
import { Button, Dialog, HStack, Stack, Text } from "@chakra-ui/react"

import { toaster } from "@/components/ui/toaster"
import { type ManagedUser, deleteUser } from "@/lib/auth"

type DeleteUserButtonProps = {
  user: ManagedUser
  onDeleted: (userId: number) => void
}

export default function DeleteUserButton({ user, onDeleted }: DeleteUserButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteUser(user.id)
      onDeleted(user.id)

      toaster.create({
        type: "success",
        title: "User deleted",
        description: `${user.username} has been removed.`,
        closable: true,
      })

      setOpen(false)
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "Something went wrong.",
        closable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}  placement="center">
      <Dialog.Trigger asChild>
        <Button size="xs" variant="outline" colorPalette="red">
          Delete
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="sm">
          <Dialog.Header>
            <Dialog.Title>Delete user</Dialog.Title>
            <Dialog.CloseTrigger disabled={isDeleting} />
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={2}>
              <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                This action cannot be undone. Are you sure you want to remove
                <Text as="span" fontWeight="semibold" ml={1}>
                  {user.username}
                </Text>
                ?
              </Text>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack justify="flex-end" gap={3}>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button colorPalette="red" loading={isDeleting} onClick={handleDelete}>
                Delete
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
