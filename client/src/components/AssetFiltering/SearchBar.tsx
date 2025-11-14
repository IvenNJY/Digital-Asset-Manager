"use client";

import { Input, InputGroup, Box, Button, HStack } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import React from "react";
import FilterMenu, { FilterMenuProps } from "./FilterMenu";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  filterProps?: FilterMenuProps;
};

function SearchBar({ value, onChange, onSubmit, filterProps }: SearchBarProps) {
  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <Box
      p={3}
      my={2}
      borderWidth="1px"
      borderRadius="md"
      bg={{ base: "white", _dark: "blackAlpha.700" }}
      shadow="sm"
    >
      <HStack>
        <InputGroup flex="1" startElement={<LuSearch />}>
          <Input
            placeholder="Search assets"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
            }}
          />
        </InputGroup>

        {filterProps && <FilterMenu {...filterProps} />}

        <Button variant="subtle" onClick={handleSubmit}>
          Search
        </Button>
      </HStack>
    </Box>
  );
}

export default SearchBar;
