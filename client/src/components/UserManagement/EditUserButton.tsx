"use client"

import { useState, type ChangeEvent } from "react"
import {
  Button,
  Dialog,
  HStack,
  Input,
  Portal,
  Select,
  Stack,
  Text,
  chakra,
  createListCollection,
} from "@chakra-ui/react"

import { type ManagedUser, type UpdateUserInput, updateUser } from "@/lib/auth"
import { toaster } from "@/components/ui/toaster"

type EditUserButtonProps = {
  user: ManagedUser
  onUpdated: (user: ManagedUser) => void
}

const roleCollection = createListCollection({
  items: ["admin", "editor", "viewer"].map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  })),
})
const Label = chakra("label")

export default function EditUserButton({ user, onUpdated }: EditUserButtonProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<UpdateUserInput>(() => ({
    username: user.username,
    email: user.email,
    password: "",
    role: (user.role ?? "viewer") as UpdateUserInput["role"],
  }))

  const handleOpenChange = (details: { open: boolean }) => {
    setOpen(details.open)
    if (details.open) {
      setFormState({
        username: user.username,
        email: user.email,
        password: "",
        role: (user.role ?? "viewer") as UpdateUserInput["role"],
      })
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload: UpdateUserInput = {
        username: formState.username.trim(),
        email: formState.email.trim().toLowerCase(),
        role: formState.role,
      }

      if (formState.password) {
        payload.password = formState.password
      }

      const updated = await updateUser(user.id, payload)
      onUpdated(updated)

      toaster.create({
        type: "success",
        title: "User updated",
        description: `${updated.username} has been updated successfully.`,
        closable: true,
      })

      setOpen(false)
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Failed to update user",
        description: error instanceof Error ? error.message : "Something went wrong.",
        closable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} placement="center">
      <Dialog.Trigger asChild>
        <Button size="xs" variant="outline" colorPalette="blue">
          Edit
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="lg">
          <Dialog.Header>
            <Dialog.Title>Edit User</Dialog.Title>
            <Dialog.CloseTrigger disabled={isSubmitting} />
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={4}>
              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor={`username-${user.id}`}>
                  Username
                </Label>
                <Input
                  id={`username-${user.id}`}
                  name="username"
                  value={formState.username}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </Stack>

              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor={`email-${user.id}`}>
                  Email
                </Label>
                <Input
                  id={`email-${user.id}`}
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </Stack>

              <Stack gap={1}>
                <Select.Root
                  size="sm"
                  width="full"
                  collection={roleCollection}
                  positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 4 }}
                  value={[formState.role]}
                  onValueChange={({ value }) => {
                    const [nextRole] = value
                    if (nextRole) {
                      setFormState((prev) => ({
                        ...prev,
                        role: nextRole as UpdateUserInput["role"],
                      }))
                    }
                  }}
                >
                  <Select.HiddenSelect id={`role-${user.id}`} name="role" />
                  <Select.Label fontWeight="medium">Role</Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Select role" />
                    </Select.Trigger>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner width="30vw" style={{ zIndex: 2000 }}>
                      <Select.Content bg="bg.surface" shadow="md" borderRadius="md">
                        {roleCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Stack>

              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor={`password-${user.id}`}>
                  Password
                </Label>
                <Input
                  id={`password-${user.id}`}
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formState.password ?? ""}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
                <Text mt={1} fontSize="xs" color="gray.500">
                  Password is optional. Leave blank to keep the current password.
                </Text>
              </Stack>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack justify="flex-end" gap={3}>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button colorPalette="blue" loading={isSubmitting} onClick={handleSubmit}>
                Save Changes
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
