"use client";

import React, { useEffect, useState } from "react";
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
  SimpleGrid,
  VStack,
  Tabs,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { FiUploadCloud, FiPlus, FiX } from "react-icons/fi";
import { toaster } from "../ui/toaster";

interface FolderOption {
  folder_id: number;
  name: string;
}

interface FolderResponse {
  id?: number;
  folder_id?: number;
  name: string;
}

interface MetadataItem {
  key: string;
  value: string;
  data_type: string;
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

export default function AssetUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [assetType, setAssetType] = useState("other");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState<string>(""); // "new" | folder_id | ""
  const [folderIds, setFolderIds] = useState<string[]>([]);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<MetadataItem[]>([]);

  // Fetch folders (and refetch after upload)
  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/assets/folders/", { credentials: "include" });
      if (!res.ok) return;
      const data: { folders?: FolderResponse[] } = await res.json();
      const items = data.folders ?? [];

      setFolders(
        items.map((f) => ({
          folder_id: f.folder_id ?? f.id ?? 0,
          name: f.name,
        }))
      );
    } catch (err) {
      console.error("Failed to load folders", err);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Handle upload
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!file) {
      toaster.create({ title: "Please select a file", type: "info", closable: true });
      return;
    }

    if (folderId === "new" && !newFolderName.trim()) {
      toaster.create({ title: "Please enter a new folder name", type: "info", closable: true });
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", name || file.name);
      form.append("asset_type", assetType);
      form.append("upload_file", file);
      if (description) form.append("description", description);
      if (tagsText) form.append("tags", tagsText);
      if (metadata.length > 0) form.append("metadata", JSON.stringify(metadata));

      // Folder logic
      if (folderIds.length) {
        folderIds.forEach(id => form.append("folder_ids[]", id));
      }
      if (folderId === "new" && newFolderName.trim()) {
        form.append("new_folder_name", newFolderName.trim());
      }
      // else: --ROOT-- → saved to "media" on backend

      const res = await fetch("/api/assets/upload/", {
        method: "POST",
        body: form,
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

      toaster.create({ title: "Upload successful", type: "success", closable: true });

      // Refetch folders + reset form
      await fetchFolders();
      setFile(null);
      setName("");
      setDescription("");
      setTagsText("");
      setFolderId("");
      setNewFolderName("");
      setMetadata([]);
      setFolderIds([]);
      setFolderId("");
    } catch (err) {
      console.error("Upload error", err);
      toaster.create({ title: "Upload failed", type: "error", closable: true });
    } finally {
      setLoading(false);
    }
  };

  // Metadata handlers
  const handleAddMetadata = () => {
    setMetadata((prev) => [...prev, { key: "", value: "", data_type: "string" }]);
  };

  const handleDeleteMetadata = (index: number) => {
    setMetadata((prev) => prev.filter((_, i) => i !== index));

  };
  // Folder options
  const folderOptions = createListCollection({
    items: [
      { label: "--ROOT--", value: "" },
      ...folders.map(f => ({ label: f.name, value: String(f.folder_id) })),
      { label: "Create New Folder...", value: "new" },
    ],
  });

  return (
    <Box
      maxW="full"
      mx="auto"
      mt={8}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      bg={{ base: "white", _dark: "gray.900" }}
      boxShadow="md"
    >
      <Tabs.Root defaultValue="upload">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="upload">Upload Preview</Tabs.Trigger>
          <Tabs.Trigger value="metadata">Custom Metadata</Tabs.Trigger>
        </Tabs.List>

        {/* --- Upload Preview Tab --- */}
        <Tabs.Content value="upload">
          <form onSubmit={handleSubmit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} alignItems="start" w="full">
              {/* LEFT: File + Name */}
              <Box>
                <VStack gap={3}>
                  {/* Upload Field */}
                  <Field.Root>
                    <Field.Label>Upload File</Field.Label>
                    <FileUpload.Root
                      maxFiles={1}
                      onFileChange={(details) => setFile(details.acceptedFiles?.[0] ?? null)}
                      accept={[".glb", ".gltf", "image/*", "video/*", "application/pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx"]}
                    >
                      <FileUpload.HiddenInput />
                      <FileUpload.Dropzone
                        borderStyle="dashed"
                        borderWidth="2px"
                        borderColor="gray.300"
                        borderRadius="md"
                        w="full"
                        h="100%"
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
                            Supported: .glb, .gltf, images, videos, PDFs
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

                  {/* Name */}
                  <Field.Root>
                    <Field.Label>Asset Name</Field.Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional asset name"
                    />
                    <Field.HelperText>Defaults to file name if left blank</Field.HelperText>
                  </Field.Root>
                </VStack>
              </Box>

              {/* RIGHT: Type, Folder, Tags, Description */}
              <Box>
                <VStack gap={3} align="stretch">
                  {/* Asset Type - FULLY RESTORED */}
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
                    <Field.Label>Folder</Field.Label>
                    <Select.Root
                      collection={folderOptions}
                      value={folderIds}                     // <-- array
                      multiple                              // <-- NEW
                      onValueChange={(e) => {
                        const vals = e.value ?? [];
                        if (vals.includes("new")) {
                          setFolderId("new");
                          // keep any already-selected real folders
                          setFolderIds(vals.filter(v => v !== "new" && v !== ""));
                        } else {
                          setFolderId("");
                          setFolderIds(vals.filter(v => v !== ""));
                        }
                      }}
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="--ROOT--" />
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

                  {/* New Folder Input */}
                  {folderId === "new" && (
                    <Field.Root mt={2}>
                      <Field.Label>New Folder Name</Field.Label>
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter new folder name"
                      />
                    </Field.Root>
                  )}

                  {/* Tags */}
                  <Field.Root>
                    <Field.Label>Tags</Field.Label>
                    <Input
                      value={tagsText}
                      onChange={(e) => setTagsText(e.target.value)}
                      placeholder="e.g. 3D, Aircraft"
                    />
                    <Field.HelperText>Separate multiple tags with commas</Field.HelperText>
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
                </VStack>
              </Box>
            </SimpleGrid>
          </form>
        </Tabs.Content>

        {/* --- Custom Metadata Tab --- */}
        <Tabs.Content value="metadata">
          <VStack align="start" gap={3} w="full">
            <HStack justify="space-between" w="full" mb={2}>
              <Text fontWeight="semibold">Metadata</Text>
              <Button size="sm" onClick={handleAddMetadata} colorScheme="green">
                <FiPlus /> Add
              </Button>
            </HStack>

            <VStack w="full" gap={3}>
              {metadata.map((item, index) => (
                <HStack key={index} w="full" justify="space-between" align="center">
                  <HStack w="full">
                    <Input
                      placeholder="Key"
                      value={item.key}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        setMetadata((prev) =>
                          prev.map((meta, i) =>
                            i === index ? { ...meta, key: newKey } : meta
                          )
                        );
                      }}
                    />

                    <select
                      value={item.data_type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setMetadata((prev) =>
                          prev.map((meta, i) =>
                            i === index ? { ...meta, data_type: newType, value: "" } : meta
                          )
                        );
                      }}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                      }}
                    >
                      <option value="string">String</option>
                      <option value="integer">Integer</option>
                      <option value="float">Float</option>
                      <option value="boolean">Boolean</option>
                      <option value="date">Date</option>
                    </select>

                    {item.data_type === "boolean" ? (
                      <select
                        value={item.value}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setMetadata((prev) =>
                            prev.map((meta, i) =>
                              i === index ? { ...meta, value: newVal } : meta
                            )
                          );
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      >
                        <option value="">Select</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : item.data_type === "integer" || item.data_type === "float" ? (
                      <Input
                        type="number"
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (item.data_type === "integer" && val !== "" && !/^-?\d+$/.test(val))
                            return;
                          setMetadata((prev) =>
                            prev.map((meta, i) =>
                              i === index ? { ...meta, value: val } : meta
                            )
                          );
                        }}
                      />
                    ) : item.data_type === "date" ? (
                      <Input
                        type="date"
                        value={item.value}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setMetadata((prev) =>
                            prev.map((meta, i) =>
                              i === index ? { ...meta, value: newVal } : meta
                            )
                          );
                        }}
                      />
                    ) : (
                      <Input
                        placeholder="Value"
                        value={item.value}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          setMetadata((prev) =>
                            prev.map((meta, i) =>
                              i === index ? { ...meta, value: newVal } : meta
                            )
                          );
                        }}
                      />
                    )}
                  </HStack>

                  <IconButton
                    aria-label="Delete metadata"
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => handleDeleteMetadata(index)}
                  >
                    <FiX />
                  </IconButton>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </Tabs.Content>
      </Tabs.Root>

      {/* Upload Button */}
      <Box textAlign="center" mt={8}>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          disabled={loading}
          size="lg"
        >
          {loading ? (
            <>
              <Spinner size="sm" mr={2} /> Uploading...
            </>
          ) : (
            "Upload Asset"
          )}
        </Button>
      </Box>
    </Box>
  );
}