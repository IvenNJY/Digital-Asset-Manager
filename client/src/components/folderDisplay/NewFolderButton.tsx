"use client";

import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import {
  Button,
  Dialog,
  Input,
  Portal,
  Select,
  Text,
  Textarea,
  createListCollection,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

type ParentOption = {
  label: string;
  value: string;
};

type NewFolderButtonProps = {
  backendRoute: string;
};

export default function NewFolderButton({ backendRoute }: NewFolderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentItems, setParentItems] = useState<ParentOption[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setParentId(null);
  }, []);

  const loadParents = useCallback(async () => {
    try {
      const response = await fetch(`${backendRoute}/api/assets/folders/`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to load folders");
      const json = await response.json();
      const items: ParentOption[] = (json.folders ?? []).map(
        (folder: { folder_id: number; name: string }) => ({ label: folder.name, value: String(folder.folder_id) })
      );
      setParentItems(items);

      const mediaFolder = (json.folders ?? []).find(
        (folder: { folder_id: number; name: string; parent_folder: number | null }) =>
          folder.parent_folder === null && String(folder.name).toLowerCase() === "media"
      );

      if (mediaFolder) {
        setParentId(String(mediaFolder.folder_id));
      } else if (items.length > 0) {
        setParentId(items[0].value);
      } else {
        setParentId(null);
      }
    } catch (error) {
      console.error(error);
    }
  }, [backendRoute]);

  const handleOpen = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      void loadParents();
    },
    [loadParents]
  );

  const handleCreate = useCallback(async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${backendRoute}/api/assets/folders/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          description,
          parent_folder_id: parentId ? Number(parentId) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Create failed");
      }

      toaster.create({ title: "Folder created", type: "success" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("folder-created"));
      }
      resetForm();
      setOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toaster.create({ title: "Create failed", description: message, type: "error" });
    } finally {
      setSubmitting(false);
    }
  }, [backendRoute, description, name, parentId, resetForm]);

  const handleOpenChange = useCallback(
    (details: { open: boolean }) => {
      setOpen(details.open);
      if (!details.open) {
        resetForm();
        setParentItems([]);
      }
    },
    [resetForm]
  );

  return (
    <>
      <Button type="button" onClick={handleOpen}>New Folder</Button>

      <Dialog.Root open={open} onOpenChange={handleOpenChange} placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Create folder</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Input
                  mb={3}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Folder name"
                />
                <Textarea
                  mb={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Description (optional)"
                />
                <Text mb={1} fontSize="sm">
                  Parent folder
                </Text>
                <Select.Root
                  size="sm"
                  collection={createListCollection({ items: parentItems })}
                  value={parentId ? [parentId] : []}
                  onValueChange={({ value }) => {
                    const [selected] = value;
                    setParentId(selected ?? null);
                  }}
                >
                  <Select.HiddenSelect aria-label="Parent folder" />
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText placeholder="Choose a parent" />
                    </Select.Trigger>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content zIndex={100000}>
                        {parentItems.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button onClick={handleCreate} disabled={!name.trim() || submitting}>
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
