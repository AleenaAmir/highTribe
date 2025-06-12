import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { z } from "zod"
import GlobalInput from "../global/GlobalInput"

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	savePassword: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginScreen = () => {
	const navigate = useNavigate()
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginForm>({
		resolver: zodResolver(loginSchema),
		mode: "onTouched",
	})

	const onSubmit = async (data: LoginForm) => {
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: data.email,
					password: data.password,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || "Failed to log in")
			}

			// Store the JWT token in localStorage
			localStorage.setItem("token", result.token)

			// Redirect to home page or dashboard
			navigate("/")
		} catch (error) {
			alert(error instanceof Error ? error.message : "An error occurred during login")
		}
	}

	return (
		<div className="mx-auto grid min-h-screen max-w-[1440px] items-center justify-center bg-white p-4 font-sans md:grid-cols-3">
			{/* Left Side */}
			<div
				className="hidden h-screen flex-col justify-between rounded-md bg-center bg-cover bg-no-repeat p-6 md:flex"
				style={{ backgroundImage: "url('/loginbg.png')" }}
			>
				{/* Logo */}
				<div className="mb-4">
					<div className="font-bold text-2xl text-white leading-tight">
						High
						<br />
						Tribe
					</div>
				</div>
				{/* Testimonial Card */}
				<div className="flex items-center gap-4 rounded-xl bg-[#0057FF] p-4 shadow-lg">
					<div className="flex-1">
						<p className="mb-2 text-sm text-white">
							Lorem ipsum dolor sit amet consectetur. Dolor nisl ac orci enim tellus mattis suspendisse. Pharetra
						</p>
						<div className="mt-2 flex gap-4">
							<img
								src="https://randomuser.me/api/portraits/men/32.jpg"
								alt="User"
								className="h-16 w-16 rounded-md border-2 border-white object-contain"
							/>
							<div>
								<div className="font-semibold text-sm text-white leading-tight">Timson K</div>
								<div className="text-white/80 text-xs">User</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			{/* Right Side (Form) */}
			<div className="col-span-2 p-6">
				<h2 className="mb-2 font-bold text-3xl text-[#181818]">Sign in</h2>
				<p className="mb-6 text-[#181818] text-base">
					Don't have an account?{" "}
					<a href="/signup" className="font-medium text-[#FF8400] hover:underline">
						Create Now
					</a>
				</p>
				<form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
					<GlobalInput placeholder="Email Address" type="email" {...register("email")} error={errors.email?.message} />
					<div className="relative">
						<GlobalInput
							placeholder="Password"
							type={"password"}
							{...register("password")}
							error={errors.password?.message}
						/>
					</div>
					<div className="mb-2 flex items-center justify-between">
						<div className="flex items-center">
							<input
								type="checkbox"
								id="savePassword"
								{...register("savePassword")}
								className="mr-2 h-4 w-4 accent-[#FF8400]"
							/>
							<label htmlFor="savePassword" className="text-[#181818] text-sm">
								Save Password
							</label>
						</div>
						<a href="/forgot-password" className="font-medium text-[#FF8400] text-sm hover:underline">
							Forgot Password?
						</a>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="mb-2 w-full rounded-md bg-[#2767E7] py-3 font-semibold text-base text-white transition-colors duration-200 hover:bg-[#0057FF] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? "Signing In..." : "Sign In"}
					</button>
					<div className="my-4 flex items-center">
						<div className="h-px flex-1 bg-gray-200" />
						<span className="mx-2 text-gray-400 text-sm">Or register with</span>
						<div className="h-px flex-1 bg-gray-200" />
					</div>
					<div className="flex gap-4">
						<button
							type="button"
							className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 font-medium text-gray-700 hover:bg-gray-50"
						>
							<img src="/googlesvg.svg" alt="Google" className="h-5 w-5" /> Google
						</button>
						<button
							type="button"
							className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 font-medium text-gray-700 hover:bg-gray-50"
						>
							<img src="/facebooksvg.svg" alt="Facebook" className="h-5 w-5" /> Facebook
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default LoginScreen
