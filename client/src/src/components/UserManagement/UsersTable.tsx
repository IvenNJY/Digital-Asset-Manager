import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Center,
  HStack,
  IconButton,
  Pagination,
  Portal,
  Select,
  Spinner,
  Table,
  Text,
  createListCollection,
} from "@chakra-ui/react"
import { LuChevronLeft, LuChevronRight, LuFilter } from "react-icons/lu"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { fetchUsers, type ManagedUser } from "@/lib/auth"
import DeleteUserButton from "./DeleteUserButton"
import EditUserButton from "./EditUserButton"
import AddUserButton from "./AddUserButton"
import {
  ColumnHeaderWithFilter,
  type ColumnFilterConfig,
} from "./UsersTableColumnFilters"

const includesStringFilter: FilterFn<ManagedUser> = (row, columnId, filterValue) => {
  const search = String(filterValue ?? "").trim().toLowerCase()
  if (!search) return true

  const rawValue = row.getValue(columnId)
  if (rawValue == null) return false

  return String(rawValue).toLowerCase().includes(search)
}

const equalsStringFilter: FilterFn<ManagedUser> = (row, columnId, filterValue) => {
  const search = String(filterValue ?? "").trim().toLowerCase()
  if (!search) return true

  const rawValue = row.getValue(columnId)
  if (rawValue == null) return false

  return String(rawValue).toLowerCase() === search
}

function UsersTable() {
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 })
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      setLoading(true)
      const data = await fetchUsers()
      if (!isMounted) return
      setUsers(data)
      setLoading(false)
    }

    loadUsers().catch((error) => {
      console.error("Failed to load users", error)
      if (!isMounted) return
      setUsers([])
      setLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [columnFilters, users.length])

  const handleUserUpdated = useCallback((updatedUser: ManagedUser) => {
    setUsers((prev) => prev.map((existing) => (existing.id === updatedUser.id ? updatedUser : existing)))
  }, [])

  const handleUserDeleted = useCallback((userId: number) => {
    setUsers((prev) => prev.filter((existing) => existing.id !== userId))
  }, [])

  const handleUserCreated = useCallback((createdUser: ManagedUser) => {
    setUsers((prev) => [createdUser, ...prev])
  }, [])

  const roleOptions = useMemo<ColumnFilterConfig["options"]>(
    () => [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
    [],
  )

  const filterConfigs = useMemo<Record<string, ColumnFilterConfig>>(
    () => ({
      id: { id: "id", label: "ID", type: "text", placeholder: "Filter by ID" },
      username: { id: "username", label: "Username", type: "text", placeholder: "Filter username" },
      email: { id: "email", label: "Email", type: "text", placeholder: "Filter email" },
      role: { id: "role", label: "Role", type: "select", placeholder: "All roles", options: roleOptions },
    }),
    [roleOptions],
  )

  const activeFilterCount = useMemo(
    () =>
      columnFilters.reduce((total, { value }) => {
        if (value == null || value === "") {
          return total
        }
        return total + 1
      }, 0),
    [columnFilters],
  )

  const hasActiveFilters = activeFilterCount > 0

  const handleToggleFilters = useCallback(() => {
    setFiltersExpanded((prev) => !prev)
  }, [])

  const columns = useMemo<ColumnDef<ManagedUser>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <ColumnHeaderWithFilter
            column={column}
            config={filterConfigs.id}
            isOpen={filtersExpanded}
          />
        ),
        filterFn: includesStringFilter,
      },
      {
        accessorKey: "username",
        header: ({ column }) => (
          <ColumnHeaderWithFilter
            column={column}
            config={filterConfigs.username}
            isOpen={filtersExpanded}
          />
        ),
        filterFn: includesStringFilter,
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <ColumnHeaderWithFilter
            column={column}
            config={filterConfigs.email}
            isOpen={filtersExpanded}
          />
        ),
        filterFn: includesStringFilter,
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <ColumnHeaderWithFilter
            column={column}
            config={filterConfigs.role}
            isOpen={filtersExpanded}
          />
        ),
        filterFn: equalsStringFilter,
        cell: (info) => info.getValue<string>() || "Viewer",
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <HStack gap={3}>
            <EditUserButton user={row.original} onUpdated={handleUserUpdated} />
            <DeleteUserButton user={row.original} onDeleted={handleUserDeleted} />
          </HStack>
        ),
      },
    ],
    [filterConfigs, filtersExpanded, handleUserDeleted, handleUserUpdated]
  )

  const table = useReactTable({
    data: users,
    columns,
    state: { columnFilters, pagination },
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const totalFiltered = table.getFilteredRowModel().rows.length
  const pageCount = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1
  const pageSize = table.getState().pagination.pageSize
  const pageSizeOptions = useMemo(
    () =>
      createListCollection({
        items: [5, 10, 20, 50].map((value) => ({
          label: `${value} / page`,
          value: String(value),
        })),
      }),
    []
  )
  const safePage = Math.min(currentPage, Math.max(pageCount, 1))
  const firstRowIndex = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1
  const lastRowIndex = totalFiltered === 0 ? 0 : Math.min(firstRowIndex + pageSize - 1, totalFiltered)

  return (
    <Box
      borderWidth="1px"
      borderColor={{ base: "gray.200", _dark: "gray.700" }}
      rounded="lg"
      bg={{ base: "white", _dark: "gray.900" }}
    >
      <Box rounded="md" px={5} py={4} borderBottomWidth="1px" borderColor={{ base: "gray.200", _dark: "gray.700" }}>
        <HStack justify="space-between" align={{ base: "stretch", md: "center" }} flexWrap="wrap" gap={3} mt={2}>
          <Text fontWeight="semibold">All Users</Text>
          <HStack gap={3} align="center">
            <AddUserButton onCreated={handleUserCreated} />
            <IconButton
              aria-label="Toggle filters"
              size="sm"
              variant={filtersExpanded || hasActiveFilters ? "solid" : "outline"}
              colorPalette={hasActiveFilters ? "blue" : "gray"}
              onClick={handleToggleFilters}
              aria-pressed={filtersExpanded}
            >
              <LuFilter size={16} />
            </IconButton>
            {hasActiveFilters && (
              <Text fontSize="xs" color="blue.500">
                {activeFilterCount} active
              </Text>
            )}
          </HStack>
        </HStack>
      </Box>
      {loading ? (
        <Center py={8}>
          <Spinner size="md" />
        </Center>
      ) : (
        <Box px={5} py={4} overflowX="auto">
          {users.length === 0 ? (
            <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
              No users found.
            </Text>
          ) : (
            <Table.Root size="md" interactive>
              <Table.Caption pt={2}>
                {totalFiltered} {totalFiltered === 1 ? "user" : "users"} total
              </Table.Caption>
              <Table.Header>
                {table.getHeaderGroups().map((headerGroup) => (
                  <Table.Row key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <Table.ColumnHeader key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </Table.ColumnHeader>
                    ))}
                  </Table.Row>
                ))}
              </Table.Header>
              <Table.Body>
                {table.getRowModel().rows.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={table.getAllLeafColumns().length}>
                      <Center py={4}>
                        <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                          No matching users.
                        </Text>
                      </Center>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <Table.Row key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <Table.Cell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell ?? ((info) => info.getValue()), cell.getContext())}
                        </Table.Cell>
                      ))}
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          )}

          {users.length > 0 && totalFiltered > 0 && (
            <Pagination.Root
              count={totalFiltered}
              page={safePage}
              pageSize={pageSize}
              siblingCount={1}
              onPageChange={({ page }) => {
                table.setPageIndex(page - 1)
              }}
              onPageSizeChange={({ pageSize: nextSize }) => {
                setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: nextSize }))
              }}
            >
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={3} mt={4}>
                <Text fontSize="sm" color={{ base: "gray.600", _dark: "gray.300" }}>
                  Showing {firstRowIndex} - {lastRowIndex} of {totalFiltered}
                </Text>
                <HStack gap={3} align="center">
                  <HStack gap={1}>
                    <Pagination.PrevTrigger aria-label="Previous page">
                      <LuChevronLeft />
                    </Pagination.PrevTrigger>
                    <Pagination.Items
                      render={(page) => (
                        <Pagination.Item key={page.value} value={page.value} type="page" asChild>
                          <Button
                            size="sm"
                            variant={page.value === safePage ? "subtle" : "ghost"}
                            colorPalette="gray"
                            minW="8"
                          >
                            {page.value}
                          </Button>
                        </Pagination.Item>
                      )}
                    />
                    <Pagination.NextTrigger aria-label="Next page">
                      <LuChevronRight />
                    </Pagination.NextTrigger>
                  </HStack>
                  <Select.Root
                    size="xs"
                    collection={pageSizeOptions}
                    value={[String(pageSize)]}
                    onValueChange={({ value }) => {
                      const [selected] = value
                      const nextSize = Number(selected)
                      setPagination((prev) => ({ ...prev, pageIndex: 0, pageSize: nextSize }))
                    }}
                  >
                    <Select.HiddenSelect aria-label="Users per page" />
                    <Select.Control minW="20vw">
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {pageSizeOptions.items.map((item) => (
                            <Select.Item key={item.value} item={item}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  
                </HStack>
              </HStack>
            </Pagination.Root>
          )}
        </Box>
      )}
    </Box>
  )
}

export default UsersTable
