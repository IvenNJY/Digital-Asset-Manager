"use client";

import PrivateRoute from "@/components/auth/PrivateRoute";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import FolderLoader from "@/components/folderDisplay/FolderLoader";
import { Box, Button, Dialog, HStack, Input, Portal, Select, Text, createListCollection, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster";

export default function FoldersPage() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentItems, setParentItems] = useState<Array<{ label: string; value: string }>>([]);
    const [parentId, setParentId] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
    const BackendRoute = "http://localhost:8000";   

  const createFolder = async () => {
    try {
      const res = await fetch(`${BackendRoute}/api/assets/folders/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, parent_folder_id: parentId ? Number(parentId) : undefined }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Create failed");
      }
      toaster.create({ title: "Folder created", type: "success" });
      setOpen(false);
      setName("");
      setDescription("");
      setParentId(null);
      setReloadKey((k) => k + 1);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toaster.create({ title: "Create failed", description: msg, type: "error" });
    }
  };

  // Load parent folder options when dialog opens
  const loadParents = async () => {
    try {
      const res = await fetch(`${BackendRoute}/api/assets/folders/`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load folders");
      const json = await res.json();
      const items = (json.folders ?? []).map((f: { folder_id: number; name: string; parent_folder: number | null }) => ({ label: f.name, value: String(f.folder_id) }));
      setParentItems(items);
      // default select root media if present
      const media = (json.folders ?? []).find((f: { folder_id: number; name: string; parent_folder: number | null }) => f.parent_folder === null && String(f.name).toLowerCase() === "media");
      if (media) setParentId(String(media.folder_id));
      else if (items.length > 0) setParentId(items[0].value);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PrivateRoute roles={["admin", "editor","viewer"]}>
      {(user) => (
        <Sidebar user={user}>
          <Box>
            <Header title="Folders" description="Manage folders and see how many assets each contains." />

            {user.role === "admin" || user.role === "editor" && (
              <HStack mb={3}>
                <Button onClick={() => { loadParents(); setOpen(true); }}>New Folder</Button>
              </HStack>
            )}
            <FolderLoader key={reloadKey} />

            <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement="center">
              <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                  <Dialog.Content>
                    <Dialog.Header>
                      <Dialog.Title>Create folder</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                      <Input mb={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" />
                      <Textarea mb={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
                      <Text mb={1} fontSize="sm">Parent folder</Text>
                      <Select.Root
                        size="sm"
                        collection={createListCollection({ items: parentItems })}
                        value={parentId ? [parentId] : []}
                        onValueChange={({ value }) => {
                          const [v] = value
                          setParentId(v ?? null)
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
                        <Button variant="outline">Cancel</Button>
                      </Dialog.ActionTrigger>
                      <Button onClick={createFolder} disabled={!name.trim()}>
                        Create
                      </Button>
                    </Dialog.Footer>
                  </Dialog.Content>
                </Dialog.Positioner>
              </Portal>
            </Dialog.Root>
          </Box>
        </Sidebar>
      )}
    </PrivateRoute>
  );
}
