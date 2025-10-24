"use client"

import {
	Button,
	Card,
	Checkbox,
	Heading,
	Input,
	Stack,
	Text,
	chakra,

} from "@chakra-ui/react"
import { PasswordInput } from "./password-input"
import { useId, useMemo, useState, type FormEvent } from "react"

export type LoginFormValues = {
	email: string
	password: string
	rememberMe: boolean
}

export interface LoginFormProps {
	/**
	 * Prefill any of the login fields.
	 */
	defaultValues?: Partial<LoginFormValues>
	/**
	 * Controls the loading state of the submit button.
	 */
	loading?: boolean
	/**
	 * Message shown when authentication fails.
	 */
	errorMessage?: string | null
	/**
	 * Message shown when authentication succeeds.
	 */
	successMessage?: string | null
	/**
	 * Callback invoked after submit with the latest field values.
	 */
	onSubmit?: (values: LoginFormValues) => void | Promise<void>
	/**
	 * Optional heading text displayed at the top of the card.
	 */
	title?: string
	/**
	 * Optional helper text shown under the heading.
	 */
	subtitle?: string
}

const Label = chakra("label")

export function LoginForm({
	defaultValues,
	loading = false,
	errorMessage,
	successMessage,
	onSubmit,
	title = "Welcome back",
	subtitle = "Sign in to access your dashboard.",
}: LoginFormProps) {
	const emailId = useId()
	const passwordId = useId()

	const [email, setEmail] = useState(() => defaultValues?.email ?? "")
	const [password, setPassword] = useState(() => defaultValues?.password ?? "")
	const [rememberMe, setRememberMe] = useState(
		() => defaultValues?.rememberMe ?? false,
	)

	const submitDisabled = useMemo(
		() => loading || email.trim().length === 0 || password.trim().length === 0,
		[loading, password, email],
	)

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		if (!onSubmit) return

		await onSubmit({
			email: email.trim(),
			password,
			rememberMe,
		})
	}

	return (
		<Card.Root
			shadow="lg"
			borderRadius="2xl"
			padding="8"
			width="md"
			maxW="md"
			background="white"
			borderWidth="1px"
			bg={{ base: 'white', _dark: 'gray.800' }}
		>
			<Stack gap="6">
				<Stack gap="1">
					<Heading size="lg">{title}</Heading>
					{subtitle ? (
						<Text fontSize="sm">
							{subtitle}
						</Text>
					) : null}
				</Stack>

				{errorMessage ? (
					<Text
						role="alert"
						color="red.500"
						fontWeight="medium"
						background="red.50"
						borderRadius="lg"
						borderWidth="1px"
						borderColor="red.200"
						padding="3"
					>
						{errorMessage}
					</Text>
				) : null}

				{!errorMessage && successMessage ? (
					<Text
						role="status"
						color="green.600"
						fontWeight="medium"
						background="green.50"
						borderRadius="lg"
						borderWidth="1px"
						borderColor="green.200"
						padding="3"
					>
						{successMessage}
					</Text>
				) : null}

				<chakra.form onSubmit={handleSubmit}>
					<Stack gap="5">
						<Stack gap="2">
							<Label htmlFor={emailId} fontWeight="medium">
								Email
							</Label>
							<Input
								id={emailId}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder="you@example.com"
								autoComplete="email"
								variant="outline"
								borderColor={{ base: "gray.200", _dark: "whiteAlpha.400" }}
								required
							/>
						</Stack>

						<Stack gap="2">
							<Label htmlFor={passwordId} fontWeight="medium">
								Password
							</Label>
							<PasswordInput
								id={passwordId}
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="••••••••"
								autoComplete="current-password"
								variant="outline"
								borderColor={{ base: "gray.200", _dark: "whiteAlpha.400" }}
								required
							/>
						</Stack>

						<Checkbox.Root
							checked={rememberMe}
							onCheckedChange={(details) => setRememberMe(details.checked === true)}
							display="flex"
							alignItems="center"
							gap="2"
						>
							<Checkbox.Control />
							<Checkbox.Label fontSize="sm">Remember me</Checkbox.Label>
						</Checkbox.Root>

						<Button
							type="submit"
							loading={loading}
							disabled={submitDisabled}
							colorPalette="blue"
						>
							Sign in
						</Button>
					</Stack>
				</chakra.form>
			</Stack>
		</Card.Root>
	)
}

export default LoginForm
