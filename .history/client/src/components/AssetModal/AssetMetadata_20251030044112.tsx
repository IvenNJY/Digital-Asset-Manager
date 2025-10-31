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
import { useEffect, useState } from "react";
import { FiX, FiPlus } from "react-icons/fi"; 

type MetadataItem = {
  key: string;
  value: string;
  data_type: string;
};

type AssetMetadataProps = {
  metadata: MetadataItem[];
};


export default function AssetMetadata({ metadata }: AssetMetadataProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<MetadataItem[]>(metadata);

  useEffect(() => {
    setEditedAsset(metadata);
  }, [metadata]);


  // --- Delete function ---
  const handleDelete = (index: number) => {
    setEditedAsset((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setEditedAsset((prev) => [
      ...prev,
      { key: "", value: "", data_type: "string" },
    ]);
  };


  const handleSave = () => {
    console.log("Saved:", editedAsset);
    setIsEditing(false);
  };

  return (
    <VStack align="start" gap={3} w="full">
      <HStack justify="space-between" w="full" mb={2}>
        <Text fontWeight="semibold">Metadata</Text>
        {!isEditing ? (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
        ) : (
          <HStack>
            <Button size="sm" colorScheme="blue" onClick={handleSave}>
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </HStack>
        )}
      </HStack>

      {!isEditing ? (
        // --- View Mode ---
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
        // --- Edit Mode ---
        <VStack w="full" gap={3}>
          {editedAsset.map((item, index) => (
            <HStack key={index} w="full" justify="space-between" align="center">
              <HStack w="full">
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
                  }}
                >
                  <option value="string">String</option>
                  <option value="integer">Integer</option>
                  <option value="float">Float</option>
                  <option value="boolean">Boolean</option>
                  <option value="date">Date</option>
                </select>

                {/* --- Value Input Field (changes type dynamically) --- */}
                {item.data_type === "boolean" ? (
                  <select
                    value={item.value}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditedAsset((prev) =>
                        prev.map((meta, i) =>
                          i === index ? { ...meta, value: newValue } : meta
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
                      // optional: restrict float vs integer more strictly
                      if (
                        item.data_type === "integer" &&
                        val !== "" &&
                        !/^-?\d+$/.test(val)
                      )
                        return; // block invalid integers
                      setEditedAsset((prev) =>
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
                      setEditedAsset((prev) =>
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
                      setEditedAsset((prev) =>
                        prev.map((meta, i) =>
                          i === index ? { ...meta, value: newVal } : meta
                        )
                      );
                    }}
                  />
                )}
              </HStack>

              {/* Delete Button */}
              <IconButton
                aria-label="Delete metadata"
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => handleDelete(index)}               
              >
                <FiX />
              </IconButton>
            </HStack>
          ))}

          {/* Add New Metadata Button */}
          <Button
            colorScheme="green"
            size="sm"
            alignSelf="flex-start"
            onClick={handleAdd}
          >
            <FiPlus />
          </Button>
        </VStack>
      )}
    </VStack>
  );
}
