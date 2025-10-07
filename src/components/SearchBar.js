import React from 'react'
import { Field, Input } from '@chakra-ui/react'

function SearchBar() {
  return (
    <Field.Root>
      <Field.Label  htmlFor="search">Search</Field.Label>
      <Input id="search" type="search" placeholder="Search..." />
    </Field.Root>
  )
}

export default SearchBar

