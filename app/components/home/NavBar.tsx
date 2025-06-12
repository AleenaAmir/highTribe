import { NavLink } from "react-router"

const NavBar = () => {
	return (
		<div className="my-2 flex w-full items-center justify-between px-3 md:px-6 lg:px-10">
			<div className="flex flex-col items-start">
				<span className="font-bold text-2xl text-white leading-none drop-shadow-md sm:text-3xl">High</span>
				<span className="font-bold text-2xl text-white leading-none drop-shadow-md sm:text-3xl">Tribe</span>
			</div>
			<div className="flex items-center gap-3">
				<NavLink to="/login" className="text-[14px] text-white hover:text-[#FF8400] md:text-[20px]">
					Login
				</NavLink>
				<NavLink
					to="/signup"
					className="rounded-md bg-[#FF8400] px-4 py-2 text-[14px] text-white transition-all duration-300 hover:bg-[#FF8400]/80 md:text-[20px]"
				>
					Sign Up
				</NavLink>
			</div>
		</div>
	)
}

export default NavBar
