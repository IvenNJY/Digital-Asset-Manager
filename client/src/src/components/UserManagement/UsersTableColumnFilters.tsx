import {
	Box,
	HStack,
	Input,
	Stack,
	Text,
	chakra,
} from "@chakra-ui/react"
import type { Column } from "@tanstack/react-table"

import type { ManagedUser } from "@/lib/auth"

const NativeSelect = chakra("select")

export type ColumnFilterOption = {
	label: string
	value: string
}

export type ColumnFilterConfig = {
	id: string
	label: string
	type: "text" | "select"
	placeholder?: string
	options?: ColumnFilterOption[]
}

interface ColumnHeaderWithFilterProps {
	column: Column<ManagedUser, unknown>
	config?: ColumnFilterConfig
	isOpen: boolean
}

export function ColumnHeaderWithFilter({ column, config, isOpen }: ColumnHeaderWithFilterProps) {
	if (!config) {
		return (
			<Text fontWeight="medium" fontSize="sm">
				{column.columnDef.header as string}
			</Text>
		)
	}

	const currentValue = (column.getFilterValue() as string | undefined) ?? ""
	const isFiltered = column.getIsFiltered()


	const renderControl = () => {
		if (config.type === "text") {
			return (
				<Input
					size="xs"
                    w="full"
					value={currentValue}
					placeholder={config.placeholder}
					onChange={(event) => {
						const value = event.target.value
						column.setFilterValue(value.trim() === "" ? undefined : value)
					}}
				/>
			)
		}

		if (config.type === "select") {
			return (
				<NativeSelect
					value={currentValue}
					onChange={(event) => {
						const value = event.target.value
						column.setFilterValue(value === "" ? undefined : value)
					}}
					aria-label={`${config.label} filter`}
					fontSize="sm"
					paddingBlock="2"
					paddingInline="3"
					borderWidth="1px"
					borderRadius="md"
					borderColor="gray.200"
					_dark={{ borderColor: "gray.700" }}
                    bg={{ base: 'white', _dark: 'gray.900' }}
				>
					<option value="">All</option>
					{config.options?.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</NativeSelect>
			)
		}

		return null
	}

	return (
		<Stack gap={2} align="stretch">
			<HStack justify="space-between" align="center">
				<Text fontWeight="semibold" fontSize="sm" color={isFiltered ? "blue.500" : undefined}>
					{config.label}
				</Text>
			</HStack>
			{isOpen ? <Box pt={1}>{renderControl()}</Box> : null}
		</Stack>
	)
}
