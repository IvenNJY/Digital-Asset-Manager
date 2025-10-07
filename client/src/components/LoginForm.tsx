"use client"

import { 
  Box, 
  Button, 
  Card, 
  Field, 
  Flex, 
  Heading, 
  Input, 
  Stack, 
  Text,
  VStack,
  HStack,
  Icon,
  Link
} from "@chakra-ui/react"
import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"
import { FiShield, FiUsers, FiTrendingUp } from "react-icons/fi"
import ThemeToggle from "./ThemeToggle"

interface FormValues {
  username: string
  password: string
}

export default function LoginHero() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const onSubmit = handleSubmit((data) => console.log(data))

  return (
    <Box minH="100vh" bg={{ base: 'gray.50', _dark: 'gray.900' }}>
      <Box zIndex={10} position="absolute" top={4} left={4}>
                  <ThemeToggle  />
      </Box>
      {/* Background Pattern */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.1}
        bgImage="radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)"
      />
      
      <Flex minH="100vh" align="center" justify="center" p={8} position="relative">
        {/* Removed hero content for corporate focus */}

        {/* Login Form - Centered */}
        <Card.Root
          maxW="md"
          w="full"
          variant="elevated"
          bg={{ base: 'white', _dark: 'gray.800' }}
          shadow="2xl"
          borderRadius="2xl"
        >
          <Card.Body p={8}>

            <VStack gap={6} align="stretch">
              <VStack gap={2} textAlign="center">
                <Heading size="lg" color={{ base: 'gray.800', _dark: 'white' }}>
                  Sign In
                </Heading>
                <Text color={{ base: 'gray.600', _dark: 'gray.400' }}>
                  Enter your credentials to access your account
                </Text>
              </VStack>

              <form onSubmit={onSubmit}>
                <Stack gap={5}>
                  <Field.Root invalid={!!errors.username}>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium"
                      color={{ base: 'gray.700', _dark: 'gray.300' }}
                    >
                      Username
                    </Field.Label>
                    <Input 
                      {...register("username", { required: "Username is required" })}
                      size="lg"
                      borderRadius="lg"
                      bg={{ base: 'gray.50', _dark: 'gray.700' }}
                      borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
                      _hover={{
                        borderColor: { base: 'gray.300', _dark: 'gray.500' }
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3182CE'
                      }}
                    />
                    <Field.ErrorText color="red.500" fontSize="sm">
                      {errors.username?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Field.Root invalid={!!errors.password}>
                    <Field.Label 
                      fontSize="sm" 
                      fontWeight="medium"
                      color={{ base: 'gray.700', _dark: 'gray.300' }}
                    >
                      Password
                    </Field.Label>
                    <PasswordInput 
                      {...register("password", { required: "Password is required" })}
                      size="lg"
                      borderRadius="lg"
                      bg={{ base: 'gray.50', _dark: 'gray.700' }}
                      borderColor={{ base: 'gray.200', _dark: 'gray.600' }}
                      _hover={{
                        borderColor: { base: 'gray.300', _dark: 'gray.500' }
                      }}
                      _focus={{
                        borderColor: 'blue.500',
                        boxShadow: '0 0 0 1px #3182CE'
                      }}
                    />
                    <Field.ErrorText color="red.500" fontSize="sm">
                      {errors.password?.message}
                    </Field.ErrorText>
                  </Field.Root>

                  <Button 
                    type="submit" 
                    size="lg"
                    w="full"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    _hover={{
                      transform: 'translateY(-1px)',
                      shadow: 'lg'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    transition="all 0.2s"
                    borderRadius="lg"
                    fontWeight="semibold"
                  >
                    Sign In
                  </Button>
                </Stack>
              </form>

              {/* <VStack gap={4} pt={2}>
                <Link 
                  href="#" 
                  fontSize="sm" 
                  color="blue.500"
                  _hover={{ textDecoration: 'none', color: 'blue.600' }}
                >
                  Forgot your password?
                </Link> */}
                
                
              
            </VStack>
          </Card.Body>
        </Card.Root>
      </Flex>
    </Box>
  )
}
