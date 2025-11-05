"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PrivateRoute from "@/components/auth/PrivateRoute";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import SearchBar from "@/components/AssetFiltering/SearchBar";
import ViewType from "@/components/AssetFiltering/ViewType";
import AssetLoader from "@/components/ui/AssetLoader";
import { Box, HStack, Portal, Select, Text, VStack, createListCollection, IconButton } from "@chakra-ui/react";
import { FiPlus, FiMinus } from "react-icons/fi";
import AddAssetsToFolderDialog from "@/components/folderDisplay/AddAssetsToFolderDialog";
import RemoveAssetsFromFolderDialog from "@/components/folderDisplay/RemoveAssetsFromFolderDialog";

type Folder = {
  folder_id: number;
  name: string;
  parent_folder?: number | null;
};

export default function FolderPage() {
    const [view, setView] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchInput, setSearchInput] = useState("");

    const [folders, setFolders] = useState<Folder[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const searchParams = useSearchParams();
    const [addOpen, setAddOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const BackendRoute = "http://localhost:8000";

    useEffect(() => {
    let mounted = true;
    const loadFolders = async () => {
        try {
        setLoadingFolders(true);
    const res = await fetch(`${BackendRoute}/api/assets/folders/`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load folders");
        const data = await res.json();
        if (!mounted) return;
        const list: Folder[] = data.folders ?? [];
        setFolders(list);
        // default selection: from ?id= param if valid, else first folder
        if (list.length > 0) {
            const idParam = searchParams?.get("id");
            const parsed = idParam ? Number(idParam) : NaN;
            if (idParam && !Number.isNaN(parsed) && list.some((f) => f.folder_id === parsed)) {
            setSelectedFolderId(parsed);
            } else {
            setSelectedFolderId(list[0].folder_id);
            }
        }
        } catch (err) {
        console.error("Folder load failed:", err);
        if (mounted) setFolders([]);
        } finally {
        if (mounted) setLoadingFolders(false);
        }
    };
    loadFolders();
    return () => {
        mounted = false;
    };
    }, [searchParams]);

    const folderOptions = useMemo(
    () =>
        createListCollection({
        items: folders.map((f) => ({ label: f.name, value: String(f.folder_id) })),
        }),
    [folders]
    );

    return (
    <PrivateRoute>
        {(user) => (
        <Sidebar user={user}>
            <Box>
            <Header title="Folder" description="Browse and manage assets by folder." />

            <HStack gap={3} align="center" mb={3} flexWrap="wrap">
                <Box minW={{ base: "100%", md: "280px" }} >
                    <VStack align="start" gap={2}>
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }} mb={1}>
                    Select folder
                </Text>
                                <HStack w="100%" align="center" gap={2}>
                                    <Box flex="1">
                                        <Select.Root
                                                size="md"
                                                collection={folderOptions}
                                                value={selectedFolderId != null ? [String(selectedFolderId)] : []}
                                                disabled={loadingFolders || folders.length === 0}
                                                variant="subtle"
                                                onValueChange={({ value }) => {
                                                    const [v] = value;
                                                    setSelectedFolderId(v ? Number(v) : null);
                                                }}
                                        >
                                                <Select.HiddenSelect aria-label="Folder" />
                                                <Select.Control>
                                                    <Select.Trigger>
                                                        <Select.ValueText placeholder={loadingFolders ? "Loading folders…" : "No folders"} />
                                                    </Select.Trigger>
                                                </Select.Control>
                                                <Portal>
                                                    <Select.Positioner>
                                                        <Select.Content>
                                                            {folderOptions.items.map((item) => (
                                                                <Select.Item key={item.value} item={item}>
                                                                    {item.label}
                                                                    <Select.ItemIndicator />
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Portal>
                                        </Select.Root>
                                    </Box>
                                    {selectedFolderId != null && ["admin","editor"].includes((user.role ?? "").toLowerCase()) && (
                                        <>
                                            <IconButton
                                                aria-label="Add assets to folder"
                                                variant="subtle"
                                                onClick={() => setAddOpen(true)}
                                                colorPalette="gray"
                                                title="Add assets"
                                            >
                                                <FiPlus />
                                            </IconButton>
                                            <IconButton
                                                aria-label="Remove assets from folder"
                                                variant="subtle"
                                                colorPalette="red"
                                                onClick={() => setRemoveOpen(true)}
                                                title="Remove assets"
                                            >
                                                <FiMinus />
                                            </IconButton>
                                        </>
                                    )}
                                </HStack>
                </VStack>
                </Box>

                <Box flex="1" minW={{ base: "100%", md: "300px" }}>
                <SearchBar value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchQuery(searchInput)} />
                </Box>

                <ViewType onChange={setView} />

            </HStack>

            <AssetLoader
                key={reloadKey}
                view={view}
                searchQuery={searchQuery}
                selectedCategory={"all"}
                folderId={selectedFolderId ?? undefined}
            />

            {selectedFolderId != null && ["admin","editor"].includes((user.role ?? "").toLowerCase()) && (
                <AddAssetsToFolderDialog
                folderId={selectedFolderId}
                open={addOpen}
                onOpenChange={setAddOpen}
                onAssigned={() => setReloadKey((k) => k + 1)}
                />
            )}
                        {selectedFolderId != null && ["admin","editor"].includes((user.role ?? "").toLowerCase()) && (
                                <RemoveAssetsFromFolderDialog
                                    folderId={selectedFolderId}
                                    open={removeOpen}
                                    onOpenChange={setRemoveOpen}
                                    onRemoved={() => setReloadKey((k) => k + 1)}
                                />
                        )}
            </Box>
        </Sidebar>
        )}
    </PrivateRoute>
    );
}
