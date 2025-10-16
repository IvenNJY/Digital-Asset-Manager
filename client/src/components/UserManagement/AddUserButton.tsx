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
  chakra,
  createListCollection,
} from "@chakra-ui/react"

import { type CreateUserInput, type ManagedUser, createUser } from "@/lib/auth"
import { toaster } from "@/components/ui/toaster"

type AddUserButtonProps = {
  onCreated: (user: ManagedUser) => void
}

const Label = chakra("label")

const roleCollection = createListCollection({
  items: ["admin", "editor", "viewer"].map((role) => ({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  })),
})

const initialFormState: CreateUserInput = {
  username: "",
  email: "",
  password: "",
  role: "viewer",
}

export default function AddUserButton({ onCreated }: AddUserButtonProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<CreateUserInput>(initialFormState)

  const handleOpenChange = (details: { open: boolean }) => {
    setOpen(details.open)
    if (!details.open) {
      setFormState(initialFormState)
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload: CreateUserInput = {
        username: formState.username.trim(),
        email: formState.email.trim().toLowerCase(),
        password: formState.password,
        role: formState.role,
      }

      if (!payload.username || !payload.email || !payload.password) {
        toaster.create({
          type: "error",
          title: "Missing information",
          description: "Username, email, and password are required.",
          closable: true,
        })
        setIsSubmitting(false)
        return
      }

      const createdUser = await createUser(payload)
      onCreated(createdUser)

      toaster.create({
        type: "success",
        title: "User created",
        description: `${createdUser.username} has been added.`,
        closable: true,
      })

      setOpen(false)
      setFormState(initialFormState)
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Failed to create user",
        description: error instanceof Error ? error.message : "Something went wrong.",
        closable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} placement="center">
      <Dialog.Trigger asChild>
        <Button size="sm" variant="subtle">
          Add User
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="lg">
          <Dialog.Header>
            <Dialog.Title>Add User</Dialog.Title>
            <Dialog.CloseTrigger disabled={isSubmitting} />
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={4}>
              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor="new-user-username">
                  Username
                </Label>
                <Input
                  id="new-user-username"
                  name="username"
                  value={formState.username}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </Stack>

              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor="new-user-email">
                  Email
                </Label>
                <Input
                  id="new-user-email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  autoComplete="off"
                />
              </Stack>

              <Stack gap={1}>
                <Label fontWeight="medium" htmlFor="new-user-password">
                  Password
                </Label>
                <Input
                  id="new-user-password"
                  name="password"
                  type="password"
                  value={formState.password}
                  onChange={handleInputChange}
                  autoComplete="new-password"
                />
              </Stack>

              <Select.Root
                size="sm"
                width="full"
                collection={roleCollection}
                positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 4 }}
                value={[formState.role]}
                onValueChange={({ value }) => {
                  const [selected] = value
                  if (selected) {
                    setFormState((prev) => ({ ...prev, role: selected as CreateUserInput["role"] }))
                  }
                }}
              >
                <Select.HiddenSelect id="new-user-role" name="role" />
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
                          <Select.ItemText>{item.label}</Select.ItemText>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack justify="flex-end" gap={3}>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button colorPalette="blue" loading={isSubmitting} onClick={handleSubmit}>
                Create User
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
