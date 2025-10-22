"use client";

import React, { useEffect, useState } from "react";
import type { CurrentUser } from "@/lib/auth";
import {
  Box,
  Stack,
  Input,
  Textarea,
  Button,
  Spinner,
  Field,
  FileUpload,
  Text,
  Icon,
  Portal,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { FiUploadCloud } from "react-icons/fi";
import { toaster } from "../ui/toaster";

// ✅ Define interfaces
interface FolderOption {
  folder_id: number;
  name: string;
}

interface FolderResponse {
  id?: number;
  folder_id?: number;
  name: string;
}

const assetTypeOptions = createListCollection({
  items: [
    { label: "Image", value: "image" },
    { label: "Video", value: "video" },
    { label: "Document", value: "document" },
    { label: "GLB (3D Model)", value: "glb" },
    { label: "Other", value: "other" },
  ],
});

interface AssetUploadProps {
  user: CurrentUser;
}

export default function AssetUpload({ user }: AssetUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("other");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState<number | "">("");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/assets/folders", { credentials: "include" });
        if (!res.ok) return;

        const data: FolderResponse[] | { results?: FolderResponse[] } = await res.json();
        const items = Array.isArray(data) ? data : data.results ?? [];

        setFolders(
          items.map((f) => ({
            folder_id: f.folder_id ?? f.id ?? 0,
            name: f.name,
          }))
        );
      } catch (err) {
        console.error("Failed to load folders", err);
      }
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toaster.create({
        title: "Please select a file",
        type: "info",
        closable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name || file.name);
      form.append("asset_type", assetType);
      form.append("upload_file", file);
      if (description) form.append("description", description);
      if (folderId) form.append("folder", String(folderId));
      if (tagsText) form.append("tags", tagsText);

      // POST via Next.js proxy so cookies/session are forwarded automatically
      const res = await fetch("/api/assets/", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const data: Record<string, unknown> = await res.json().catch(() => ({}));
      if (!res.ok) {
        toaster.create({
          title: "Upload failed",
          description: (data as { detail?: string }).detail ?? "Server error",
          type: "error",
          closable: true,
        });
        return;
      }

      toaster.create({
        title: "Upload successful",
        type: "success",
        closable: true,
      });

      setFile(null);
      setName("");
      setDescription("");
      setTagsText("");
      setFolderId("");
    } catch (err) {
      console.error("Upload error", err);
      toaster.create({
        title: "Upload failed",
        type: "error",
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare folder options dynamically
  const folderOptions = createListCollection({
    items: [
      { label: "— Root —", value: "" },
      ...folders.map((f) => ({
        label: f.name,
        value: String(f.folder_id),
      })),
    ],
  });

  return (
    <Box
      maxW="lg"
      mx="auto"
      mt={8}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg={{ base: "white", _dark: "gray.900" }}
      boxShadow="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap={5}>
          {/* File Upload */}
          <Field.Root>
            <Field.Label>Upload File</Field.Label>
            <FileUpload.Root
              maxW="xl"
              alignItems="stretch"
              maxFiles={1}
              onFileChange={(details) => setFile(details.acceptedFiles?.[0] ?? null)}
              accept={[".glb", ".gltf", "image/*", "video/*", "application/pdf"]}
            >
              <FileUpload.HiddenInput />
              <FileUpload.Dropzone
                borderStyle="dashed"
                borderWidth="2px"
                borderColor="gray.300"
                borderRadius="md"
                p={8}
                _hover={{ borderColor: "blue.400", bg: "blue.50" }}
              >
                <Icon boxSize={8} color="fg.muted">
                  <FiUploadCloud />
                </Icon>
                <FileUpload.DropzoneContent>
                  <Box fontWeight="medium">
                    {file ? file.name : "Drag & drop or click to upload"}
                  </Box>
                  <Box fontSize="sm" color="fg.muted">
                    Supported: .glb, .gltf, images, videos, documents
                  </Box>
                </FileUpload.DropzoneContent>
              </FileUpload.Dropzone>
              <FileUpload.List />
            </FileUpload.Root>
            {file && (
              <Text fontSize="sm" color="green.500" mt={2}>
                Selected file: {file.name}
              </Text>
            )}
          </Field.Root>

          {/* Asset Name */}
          <Field.Root>
            <Field.Label>Asset Name</Field.Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional asset name"
            />
            <Field.HelperText>Defaults to file name if left blank</Field.HelperText>
          </Field.Root>

          {/* Asset Type */}
          <Field.Root>
            <Field.Label>Asset Type</Field.Label>
            <Select.Root
              collection={assetTypeOptions}
              value={[assetType]}
              onValueChange={({ value }) =>
                setAssetType((value?.[0] as string) ?? "other")
              }
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select asset type" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {assetTypeOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>

          {/* Folder */}
          <Field.Root>
            <Field.Label>Folder (optional)</Field.Label>
            <Select.Root
              collection={folderOptions}
              value={[folderId ? String(folderId) : ""]}
              onValueChange={({ value }) =>
                setFolderId(value?.[0] ? Number(value[0]) : "")
              }
            >
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="— Root —" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {folderOptions.items.map((item) => (
                      <Select.Item item={item} key={item.value}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Field.Root>

          {/* Tags */}
          <Field.Root>
            <Field.Label>Tags</Field.Label>
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g. 3D, Aircraft"
            />
            <Field.HelperText>
              Separate multiple tags with commas
            </Field.HelperText>
          </Field.Root>

          {/* Description */}
          <Field.Root>
            <Field.Label>Description</Field.Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this asset"
            />
          </Field.Root>

          {/* Submit */}
          <Button type="submit" colorScheme="blue" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="sm" mr={2} /> Uploading...
              </>
            ) : (
              "Upload Asset"
            )}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
