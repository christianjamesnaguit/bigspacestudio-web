import api from "./axios";
import { prepareCsrf } from "./auth";

export type PublicPackage = {
	package_id: number;
	package_name: string;
	description: string;
	price: string;
	duration_minutes: number;
	inclusions: string;
	pricing_type: "fixed" | "hourly";
};

export type AvailableSchedule = {
	schedule_id: number;
	schedule_date: string;
	start_time: string;
	end_time: string;
};

export type PublicBookingOptions = {
	packages: PublicPackage[];
	schedules: AvailableSchedule[];
};

export async function getPublicBookingOptions() {
	const [packagesResponse, availabilityResponse] = await Promise.all([
		api.get<{ packages: PublicPackage[] }>("/booking/packages"),
		api.get<{ schedules: AvailableSchedule[] }>("/booking/availability"),
	]);

	return {
		packages: packagesResponse.data.packages,
		schedules: availabilityResponse.data.schedules,
	};
}

export async function submitPublicBooking(data: {
	first_name: string;
	last_name: string;
	email: string;
	package_id: number;
	schedule_id: number;
	requests: string;
}) {
	await prepareCsrf();
	const response = await api.post<{
		message: string;
		booking: { booking_id: number; booking_status: "pending" };
	}>("/booking", data);
	return response.data;
}
