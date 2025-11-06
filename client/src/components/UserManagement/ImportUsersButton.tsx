"use client"

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react"
import {
  Box,
  Button,
  Dialog,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuDownload, LuFileSpreadsheet, LuUpload } from "react-icons/lu"

import { bulkImportUsers } from "@/lib/auth"
import { toaster } from "@/components/ui/toaster"
import { Tooltip } from "@/components/ui/tooltip"

type ImportUsersButtonProps = {
  onImported: () => Promise<void> | void
  variant?: "icon" | "button"
}

export default function ImportUsersButton({ onImported, variant = "button" }: ImportUsersButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloadingSample, setIsDownloadingSample] = useState(false)

  const resetInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [])

  const resetDialog = useCallback(() => {
    resetInput()
    setSelectedFile(null)
    setIsDragging(false)
  }, [resetInput])

  const buildMessages = useCallback((result: Awaited<ReturnType<typeof bulkImportUsers>>) => {
    const messages: string[] = []

    messages.push(
      result.createdCount === 0
        ? "No new users were created."
        : `${result.createdCount} new ${result.createdCount === 1 ? "user" : "users"} created.`,
    )

    if (result.skippedExisting.length > 0) {
      const rows = result.skippedExisting.map((item) => item.row).slice(0, 5)
      messages.push(
        `${result.skippedExisting.length} duplicate ${
          result.skippedExisting.length === 1 ? "email" : "emails"
        } skipped${rows.length ? ` (rows ${rows.join(", ")}${result.skippedExisting.length > rows.length ? ", …" : ""})` : ""}.`,
      )
    }

    if (result.skippedInvalid.length > 0) {
      const rows = result.skippedInvalid.map((item) => item.row).slice(0, 5)
      messages.push(
        `${result.skippedInvalid.length} invalid ${
          result.skippedInvalid.length === 1 ? "row" : "rows"
        } skipped${rows.length ? ` (rows ${rows.join(", ")}${result.skippedInvalid.length > rows.length ? ", …" : ""})` : ""}.`,
      )
    }

    return messages
  }, [])

  const handleOpenChange = useCallback((details: { open: boolean }) => {
    setOpen(details.open)
    if (!details.open) {
      resetDialog()
    }
  }, [resetDialog])

  const handleFileSelection = (file: File | null) => {
    if (!file) return
    setSelectedFile(file)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    handleFileSelection(file)
    resetInput()
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0] ?? null
    if (file) {
      handleFileSelection(file)
    }
  }

  const handleBrowse = () => {
    if (isUploading) return
    inputRef.current?.click()
  }

  const handleDownloadSample = useCallback(async () => {
    setIsDownloadingSample(true)
    try {
      const response = await fetch("/api/users/sample")
      if (!response.ok) {
        throw new Error("Failed to download sample file.")
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "User_import_sample.xlsx"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Download failed",
        description: error instanceof Error ? error.message : "Unable to save the sample file.",
        closable: true,
      })
    } finally {
      setIsDownloadingSample(false)
    }
  }, [])

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toaster.create({
        type: "error",
        title: "No file selected",
        description: "Choose an Excel file before starting the import.",
        closable: true,
      })
      return
    }

    setIsUploading(true)
    try {
      const result = await bulkImportUsers(selectedFile)
      await onImported()

      const message = buildMessages(result)
      toaster.create({
        type: result.skippedExisting.length || result.skippedInvalid.length ? "info" : "success",
        title: "User import completed",
        description: message.join(" "),
        closable: true,
      })

      setOpen(false)
      resetDialog()
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Import failed",
        description: error instanceof Error ? error.message : "Unable to import users.",
        closable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }, [buildMessages, onImported, resetDialog, selectedFile])

  const trigger =
    variant === "icon" ? (
      <Tooltip content="Import users from Excel">
        <IconButton
          aria-label="Import users"
          size="sm"
          variant="subtle"
          onClick={() => setOpen(true)}
        >
          <LuUpload size={16} />
        </IconButton>
      </Tooltip>
    ) : (
      <Button
        size="sm"
        variant="outline"
        colorPalette="blue"
        onClick={() => setOpen(true)}
        display="inline-flex"
        gap={2}
        alignItems="center"
      >
        <LuUpload size={16} />
        Import Users
      </Button>
    )

  const dropZoneBorder = isDragging ? { base: "blue.400", _dark: "blue.200" } : { base: "gray.300", _dark: "gray.600" }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange} placement="center">
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="lg">
          <Dialog.Header>
            <Dialog.Title>Import users</Dialog.Title>
            <Dialog.CloseTrigger disabled={isUploading} />
          </Dialog.Header>
          <Dialog.Body>
            <Stack gap={5}>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleFileChange}
              />
              <Box
                borderWidth="1px"
                borderStyle="dashed"
                borderColor={dropZoneBorder}
                rounded="lg"
                py={8}
                px={5}
                textAlign="center"
                cursor="pointer"
                bg={isDragging ? { base: "blue.50", _dark: "blue.900" } : "transparent"}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowse}
              >
                <Stack gap={3} align="center">
                  <Box
                    borderRadius="full"
                    bg={isDragging ? { base: "blue.100", _dark: "blue.800" } : { base: "gray.100", _dark: "gray.700" }}
                    p={3}
                  >
                    <LuFileSpreadsheet size={28} />
                  </Box>
                  <Stack gap={1} align="center">
                    <Text fontWeight="semibold">Drag and drop your Excel file</Text>
                    <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                      or click to browse for a .xlsx file using the template headers
                    </Text>
                    {selectedFile && (
                      <Text fontSize="sm" color="blue.500" fontWeight="medium">
                        {selectedFile.name}
                      </Text>
                    )}
                  </Stack>
                  <Button size="sm" variant="subtle" onClick={handleBrowse} disabled={isUploading}>
                    Choose file
                  </Button>
                </Stack>
              </Box>

              <Stack gap={2} fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                <Text fontWeight="semibold">Required columns</Text>
                <Text>username • email • password • role (admin | editor | viewer)</Text>
                <Text>Ensure each row has unique emails. Headings must match exactly.</Text>
              </Stack>

              <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                  Need an example file?
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadSample}
                  loading={isDownloadingSample}
                  display="inline-flex"
                  gap={2}
                  alignItems="center"
                >
                  <LuDownload size={16} />
                  Download sample
                </Button>
              </HStack>
            </Stack>
          </Dialog.Body>
          <Dialog.Footer>
            <HStack justify="flex-end" gap={3}>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button colorPalette="blue" loading={isUploading} onClick={handleImport} disabled={!selectedFile}>
                Start import
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}
