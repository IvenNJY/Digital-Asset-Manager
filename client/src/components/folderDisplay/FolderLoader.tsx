"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  HStack,
  IconButton,
  Input,
  Portal,
  Spinner,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { FiEdit2, FiTrash } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/components/auth/PrivateRoute";

type Folder = {
  folder_id: number;
  name: string;
  parent_folder?: number | null;
  description?: string | null;
};

type ApiAsset = {
  asset_id: number;
  folders?: Array<{ folder: number; folder_name?: string }>;
};

export default function FolderLoader() {
    const authUser = useAuthUser();
    const canManage = useMemo(() => {
      const role = (authUser?.role ?? "").toLowerCase();
      return role === "admin" || role === "editor";
    }, [authUser]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [counts, setCounts] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [renamingId, setRenamingId] = useState<number | null>(null);
    const [newName, setNewName] = useState("");
    const router = useRouter();
    const BackendRoute = "http://localhost:8000";
  

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [foldersRes, assetsRes] = await Promise.all([
          fetch(`${BackendRoute}/api/assets/folders/`, { credentials: "include" }),
          fetch(`${BackendRoute}/api/assets/list`, { credentials: "include" }),
        ]);
        if (!foldersRes.ok) throw new Error("Failed to load folders");
        if (!assetsRes.ok) throw new Error("Failed to load assets");
        const foldersJson = await foldersRes.json();
        const assetsJson = await assetsRes.json();
        if (!mounted) return;
        const list: Folder[] = foldersJson.folders ?? [];
        const assets: ApiAsset[] = assetsJson.assets ?? [];

        // Build counts per folder id
        const map: Record<number, number> = {};
        for (const f of list) map[f.folder_id] = 0;
        for (const a of assets) {
          for (const m of a.folders ?? []) {
            if (map[m.folder] == null) map[m.folder] = 0;
            map[m.folder] += 1;
          }
        }
        setFolders(list);
        setCounts(map);
      } catch (err) {
        console.error(err);
        toaster.create({ title: "Failed to load folders", type: "error" });
        if (mounted) {
          setFolders([]);
          setCounts({});
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const startRename = (folder: Folder) => {
    setRenamingId(folder.folder_id);
    setNewName(folder.name);
  };

  const submitRename = async () => {
    if (renamingId == null) return;
    const targetId = renamingId;
    try {
      const res = await fetch(`${BackendRoute}/api/assets/folders/rename/${targetId}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Rename failed");
      }
      const updated = await res.json();
      setFolders((prev) => prev.map((f) => (f.folder_id === targetId ? { ...f, name: updated.name } : f)));
      toaster.create({ title: "Folder renamed", type: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toaster.create({ title: "Rename failed", description: msg, type: "error" });
    } finally {
      setRenamingId(null);
      setNewName("");
    }
  };

  const deleteFolder = async (folder: Folder) => {
    try {
      const res = await fetch(`${BackendRoute}/api/assets/folders/delete/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ folder_id: folder.folder_id }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Delete failed");
      }
      setFolders((prev) => prev.filter((f) => f.folder_id !== folder.folder_id));
      setCounts((prev) => {
        const next = { ...prev };
        delete next[folder.folder_id];
        return next;
      });
      toaster.create({ title: "Folder deleted", type: "success" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toaster.create({ title: "Delete failed", description: msg, type: "error" });
    }
  };

  if (loading) {
    return (
      <Box py={6} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  if (folders.length === 0) {
    return <Text fontSize="sm">No folders found.</Text>;
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
        {folders.map((folder) => {
          const total = counts[folder.folder_id] ?? 0;
          return (
            <Card.Root
              key={folder.folder_id}
              role="group"
              cursor="pointer"
              onClick={() => router.push(`/folder?id=${folder.folder_id}`)}
              transition={"0.3s all ease-in-out"}
              _hover={{ shadow: "md" }}
            >
              <Card.Body p={4} position="relative">
                <HStack justify="space-between" align="start" mb={2}>
                  <Box>
                    <Card.Title as={"div"} fontWeight="semibold">
                      {folder.name}
                    </Card.Title>
                    {folder.description ? (
                      <Text fontSize="xs" color={{ base: "gray.600", _dark: "gray.400" }} lineClamp={2}>
                        {folder.description}
                      </Text>
                    ) : null}
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                      {total} {total === 1 ? "asset" : "assets"}
                    </Text>
                  </Box>
                  {canManage && (
                    <HStack gap={1} onClick={(e) => e.stopPropagation()}>
                      <IconButton aria-label="Rename" size="xs" variant="ghost" onClick={() => startRename(folder)}>
                        <FiEdit2 />
                      </IconButton>
                      <Dialog.Root role="alertdialog" placement="center">
                        <Dialog.Trigger asChild>
                          <IconButton aria-label="Delete" size="xs" variant="ghost" colorPalette="red">
                            <FiTrash />
                          </IconButton>
                        </Dialog.Trigger>
                        <Portal>
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content onClick={(e) => e.stopPropagation()}>
                              <Dialog.Header>
                                <Dialog.Title>Delete folder?</Dialog.Title>
                              </Dialog.Header>
                              <Dialog.Body>
                                <Text>
                                  This will permanently delete <strong>{folder.name}</strong> and its subfolders. Asset
                                  links to this folder will be removed.
                                </Text>
                              </Dialog.Body>
                              <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                  <Button variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                  <Button colorPalette="red" onClick={() => deleteFolder(folder)}>
                                    Delete
                                  </Button>
                                </Dialog.ActionTrigger>
                              </Dialog.Footer>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>
                    </HStack>
                  )}
                </HStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>

      {/* Rename dialog */}
      {canManage && (
      <Dialog.Root open={renamingId != null} onOpenChange={(e) => !e.open && setRenamingId(null)} placement="center">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Rename folder</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New folder name" />
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button onClick={submitRename} disabled={!newName.trim()}>
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      )}
    </Box>
  );
}
