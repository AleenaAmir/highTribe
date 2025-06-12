import { useTranslation } from "react-i18next"
import { type MetaFunction, useNavigate } from "react-router"
import Home from "~/components/home/Home"
import NavBar from "~/components/home/NavBar"
import { convertDateToUserTz } from "~/utils/dates"
import type { Route } from "./+types/_index"

export const meta: MetaFunction = () => {
	return [{ title: "High Tribe" }, { name: "description", content: "Welcome to High Tribe" }]
}

export const loader = ({ request }: Route.LoaderArgs) => {
	const timezoneDate = convertDateToUserTz(new Date(), request)
	return {
		timezoneDate: timezoneDate.toTimeString(),
	}
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const { timezoneDate: _timezoneDate } = loaderData
	const { t: _t } = useTranslation()
	const _navigate = useNavigate()

	return (
		<div>
			<div className="fixed top-2 left-0 z-50 w-full">
				<NavBar />
			</div>
			<Home />
		</div>
	)
}
