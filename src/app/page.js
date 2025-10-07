'use client'

import Sidebar from '@/components/Sidebar'
import {
  Flex,
  Box,
  Field,
  Input,
  Checkbox,
  Stack,
  Button,
  Heading,
  Text,
  Link,
} from '@chakra-ui/react'
 

export default function SimpleCard() {
  return (<>
          <Sidebar />
    <Flex
      minH={'100vh'}
      w={'full'}
      align={'center'}
      justify={'center'}
      bg={'bg'}
      color={'fg'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} padding={'8'}>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          borderWidth="1px"
          borderColor="border.disabled"
          color="fg.disabled"
          p={8}>
          <Stack spacing={4}>
            <Field.Root>
              <Field.Label htmlFor="email">Email address</Field.Label>
              <Input id="email" type="email" />
            </Field.Root>
            <Field.Root>
              <Field.Label htmlFor="password">Password</Field.Label>
              <Input id="password" type="password" />
            </Field.Root>
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
                gap={4}
              >

                <Link href="#">Forgot password?</Link>
              </Stack>
              <Button>
                Sign in
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>

    </Flex>
    </>
  )
}