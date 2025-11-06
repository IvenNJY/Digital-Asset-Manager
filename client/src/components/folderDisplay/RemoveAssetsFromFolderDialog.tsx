"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Checkbox, CheckboxGroup, Dialog, HStack, Icon, Input, Portal, Spinner, Stack, Text } from "@chakra-ui/react";
import { FiCheck } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";

interface Props {
  folderId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRemoved?: () => void;
}

type ApiAsset = {
  asset_id: number;
  name: string;
  asset_type: string;
  folders?: Array<{ folder: number; folder_name?: string }>;
};

export default function RemoveAssetsFromFolderDialog({ folderId, open, onOpenChange, onRemoved }: Props) {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const BackendRoute = "http://localhost:8000";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!open) return;
      try {
        setLoading(true);
        const res = await fetch(`${BackendRoute}/api/assets/list`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load assets");
        const json = await res.json();
        if (!mounted) return;
        const list: ApiAsset[] = json.assets ?? [];
        setAssets(list);
      } catch (e) {
        console.error(e);
        toaster.create({ title: "Failed to load assets", type: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets
      .filter((a) => a.folders?.some((f) => f.folder === folderId))
      .filter((a) => (q ? `${a.name} ${a.asset_type}`.toLowerCase().includes(q) : true));
  }, [assets, folderId, search]);

  const submit = async () => {
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          fetch(`${BackendRoute}/api/assets/folders/unassign/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ asset_id: Number(id), folder_id: folderId }),
          }).then((res) => {
            if (!res.ok) return res.json().then((e) => Promise.reject(new Error(e.detail || "Unassign failed")));
          })
        )
      );
      toaster.create({ title: "Assets removed from folder", type: "success" });
      onOpenChange(false);
      setSelected(new Set());
      onRemoved?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      toaster.create({ title: "Failed to remove assets", description: msg, type: "error" });
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => {
        if (!e.open) setSelected(new Set());
        onOpenChange(e.open);
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Remove assets from folder</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              {loading ? (
                <Spinner />
              ) : (
                <>
                  <Input placeholder="Search assets" value={search} onChange={(e) => setSearch(e.target.value)} mb={3} />
                  {candidates.length === 0 ? (
                    <Text fontSize="sm">No assets to remove.</Text>
                  ) : (
                    <CheckboxGroup name="assets" value={[...selected]} onValueChange={(value) => setSelected(new Set(value))}>
                      <Stack maxH="50vh" overflowY="auto" gap={2}>
                        {candidates.map((a) => {
                          const id = String(a.asset_id);
                          return (
                            <Checkbox.Root
                              key={id}
                              value={id}
                              display="flex"
                              alignItems="center"
                              gap={2}
                              cursor="pointer"
                              w="full"
                              colorPalette="gray"
                            >
                              <Checkbox.HiddenInput />
                              <Checkbox.Control borderWidth="1px" borderColor={{ base: "gray.300", _dark: "gray.600" }} rounded="sm" boxSize="18px">
                                <Checkbox.Indicator>
                                  <Icon as={FiCheck} boxSize={3.5} />
                                </Checkbox.Indicator>
                              </Checkbox.Control>
                              <HStack justify="space-between" w="full">
                                <Checkbox.Label>{a.name}</Checkbox.Label>
                                <Text fontSize="xs" opacity={0.7}>
                                  {a.asset_type}
                                </Text>
                              </HStack>
                            </Checkbox.Root>
                          );
                        })}
                      </Stack>
                    </CheckboxGroup>
                  )}
                </>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button onClick={submit} disabled={selected.size === 0} colorPalette="red">
                Remove
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
