import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { z } from "zod"
import GlobalInput from "../global/GlobalInput"

const signUpSchema = z.object({
	firstName: z.string().min(2, "First name is required"),
	lastName: z.string().min(2, "Last name is required"),
	phone: z.string().min(10, "Phone number is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
	terms: z.literal(true, {
		errorMap: () => ({ message: "You must agree to the Terms & Condition" }),
	}),
})

type SignUpForm = z.infer<typeof signUpSchema>

const NewSignUp = () => {
	const navigate = useNavigate()
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<SignUpForm>({
		resolver: zodResolver(signUpSchema),
		mode: "onTouched",
	})

	const onSubmit = async (data: SignUpForm) => {
		try {
			const response = await fetch("/api/auth", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					fullName: `${data.firstName} ${data.lastName}`,
					email: data.email,
					password: data.password,
					confirmPassword: data.password,
					phone: data.phone,
				}),
			})

			const result = await response.json()

			if (!response.ok) {
				throw new Error(result.error || "Failed to sign up")
			}

			// Store the JWT token in localStorage
			localStorage.setItem("token", result.token)

			// Redirect to home page or dashboard
			navigate("/")
		} catch (error) {
			alert(error instanceof Error ? error.message : "An error occurred during sign up")
		}
	}

	return (
		<div className="mx-auto grid min-h-screen max-w-[1440px] items-center justify-center bg-white p-4 font-sans md:grid-cols-3">
			{/* Left Side */}
			<div
				className="hidden h-screen flex-col justify-between rounded-md bg-[#FF8400] bg-center bg-cover bg-no-repeat p-6 md:flex "
				style={{ backgroundImage: "url('/signupbg.png')" }}
			>
				{/* Logo */}
				<div className="mb-4">
					<div className="font-bold text-2xl text-white leading-tight">
						High
						<br />
						Tribe
					</div>
				</div>

				<div className=" flex items-center gap-4 rounded-xl bg-[#0057FF] p-4 shadow-lg">
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
				<h2 className="mb-2 font-bold text-3xl text-[#181818]">Create an account</h2>
				<p className="mb-6 text-[#181818] text-base">
					Already have an account?{" "}
					<a href="/login" className="font-medium text-[#0057FF] hover:underline">
						Log in
					</a>
				</p>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div className="flex gap-4">
						<GlobalInput
							placeholder="First Name"
							{...register("firstName")}
							error={errors.firstName?.message}
							className="flex-1"
						/>
						<GlobalInput
							placeholder="Last Name"
							{...register("lastName")}
							error={errors.lastName?.message}
							className="flex-1"
						/>
					</div>
					<GlobalInput placeholder="Phone Number" {...register("phone")} error={errors.phone?.message} />
					<GlobalInput placeholder="Email Address" type="email" {...register("email")} error={errors.email?.message} />
					<GlobalInput
						placeholder="Password"
						type="password"
						{...register("password")}
						error={errors.password?.message}
					/>
					<div className="mb-2 flex items-center">
						<input type="checkbox" id="terms" {...register("terms")} className="mr-2 h-4 w-4 accent-[#FF8400]" />
						<label htmlFor="terms" className="text-[#181818] text-sm">
							I agree to the{" "}
							<a href="/terms" className="text-[#FF8400] hover:underline">
								Terms & Condition
							</a>
						</label>
					</div>
					{errors.terms && <p className="mb-2 text-red-600 text-sm">{errors.terms.message}</p>}
					<button
						type="submit"
						disabled={isSubmitting}
						className="mb-2 w-full rounded-md bg-[#2767E7] py-3 font-semibold text-base text-white transition-colors duration-200 hover:bg-[#0057FF] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? "Creating Account..." : "Create Account"}
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

export default NewSignUp
