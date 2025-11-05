"use client";

import {
  VStack,
  HStack,
  Button,
  Box,
  Text,
  Table,
  Input,
  IconButton
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import { toaster } from "@/components/ui/toaster";
import { useAuthUser } from "@/components/auth/PrivateRoute";

type MetadataItem = {
  key: string;
  value: string;
  data_type: string;
};

type AssetMetadataProps = {
  assetId: number;           // REQUIRED
  initialMetadata?: MetadataItem[];
};

export default function AssetMetadata({ assetId, initialMetadata = [] }: AssetMetadataProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<MetadataItem[]>(initialMetadata);
  const [originalMetadata, setOriginalMetadata] = useState<MetadataItem[]>(initialMetadata);
  const [isLoading, setIsLoading] = useState(false);
  const authUser = useAuthUser();
  const canEditMetadata = useMemo(() => {
    const role = authUser?.role?.toLowerCase() ?? null;
    return role === "admin" || role === "editor";
  }, [authUser?.role]);

  const initialSnapshot = useRef<string | null>(null);

  useEffect(() => {
    const snapshot = JSON.stringify(initialMetadata);
    if (initialSnapshot.current === snapshot) {
      return;
    }
    initialSnapshot.current = snapshot;
    setEditedAsset(initialMetadata);
    setOriginalMetadata(initialMetadata);
  }, [assetId, initialMetadata]);

  // Fetch metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/assets/${assetId}/metadata/`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          const serverMetadata: MetadataItem[] = data.metadata || [];
          setEditedAsset(serverMetadata);
          setOriginalMetadata(serverMetadata);
        }
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    fetchMetadata();
  }, [assetId]);

  useEffect(() => {
    if (!canEditMetadata && isEditing) {
      setIsEditing(false);
    }
  }, [canEditMetadata, isEditing]);

  // --- Delete ---
  const handleDelete = (index: number) => {
    setEditedAsset((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Add ---
  const handleAdd = () => {
    setEditedAsset((prev) => [
      ...prev,
      { key: "", value: "", data_type: "string" },
    ]);
  };

  // --- Save to Django ---
  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/assets/${assetId}/metadata/`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: editedAsset }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Save failed");
      }

      setIsEditing(false);
      const snapshot = editedAsset.map((item) => ({ ...item }));
      setOriginalMetadata(snapshot);
      setEditedAsset(snapshot);
      toaster.success({
        title: "Metadata saved",
        description: "Your changes are live",
        action: { label: "Refresh", onClick: () => window.location.reload() },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toaster.error({
        title: "Save failed",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack align="start" w="full" gap={4} minH="300px" maxH="90vh" overflowY="auto">
      <HStack justify="space-between" w="full" mb={2}>
        <Text fontWeight="semibold">Metadata</Text>
        {canEditMetadata && (
          !isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <HStack>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleSave}
              >
                {isLoading ? "Saving…" : "Save"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (isLoading) return;
                  setEditedAsset(originalMetadata);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </HStack>
          )
  )}
      </HStack>

      {/* VIEW MODE */}
      {!isEditing || !canEditMetadata ? (
        editedAsset.length === 0 ? (
          <Box py={2} w="full">
            <Text fontSize="sm" color="gray.500">
              No metadata available yet.
            </Text>
          </Box>
        ) : (
          <Table.Root variant="line" size="sm" w="full">
            <Table.Body>
              {editedAsset.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell fontWeight="semibold" w="30%">
                    {item.key}
                  </Table.Cell>
                  <Table.Cell>{item.value}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )
      ) : (
        /* EDIT MODE */
        <VStack w="full" gap={3}>
          {editedAsset.map((item, index) => (
            <HStack key={index} w="full" justify="space-between" align="center">
              <HStack w="full" gap={2}>
                <Input
                  placeholder="Key"
                  value={item.key}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    setEditedAsset((prev) =>
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
                    setEditedAsset((prev) =>
                      prev.map((meta, i) =>
                        i === index ? { ...meta, data_type: newType, value: "" } : meta
                      )
                    );
                  }}
                  style={{
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    minWidth: "100px",
                  }}
                >
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="float">Float</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>

                {/* Dynamic Value Input */}
                {item.data_type === "boolean" ? (
                  <select
                    value={item.value}
                    onChange={(e) => {
                      setEditedAsset((prev) =>
                        prev.map((meta, i) =>
                          i === index ? { ...meta, value: e.target.value } : meta
                        )
                      );
                    }}
                    style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="">Select</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : item.data_type === "date" ? (
                  <Input
                    type="date"
                    value={item.value}
                    onChange={(e) => {
                      setEditedAsset((prev) =>
                        prev.map((meta, i) =>
                          i === index ? { ...meta, value: e.target.value } : meta
                        )
                      );
                    }}
                  />
                ) : (
                  <Input
                    type={item.data_type === "integer" || item.data_type === "float" ? "number" : "text"}
                    step={item.data_type === "float" ? "any" : undefined}
                    placeholder="Value"
                    value={item.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (item.data_type === "integer" && val && !/^-?\d+$/.test(val)) return;
                      setEditedAsset((prev) =>
                        prev.map((meta, i) =>
                          i === index ? { ...meta, value: val } : meta
                        )
                      );
                    }}
                  />
                )}
              </HStack>

              <IconButton
                aria-label="Delete"
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(index)}
              >
                <FiX />
              </IconButton>
            </HStack>
          ))}

          <Button colorScheme="green" size="sm" alignSelf="flex-start" onClick={handleAdd}>
            <FiPlus />
          </Button>
        </VStack>
      )}
    </VStack>
  );
}