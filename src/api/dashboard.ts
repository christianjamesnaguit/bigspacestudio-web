import api from "./axios";
import type { AuthUser } from "./auth";

export type DashboardPreferences = {
    default_booking_duration: number;
    default_booking_status: "pending" | "confirmed";
    auto_confirm_requests: boolean;
    notify_new_bookings: boolean;
    notify_booking_reminders: boolean;
    notify_weekly_summary: boolean;
};

export type DashboardSettings = {
    user: AuthUser;
    preferences: DashboardPreferences;
};

export async function getDashboardSettings() {
    const response = await api.get<DashboardSettings>("/dashboard/settings");
    return response.data;
}

export async function updateDashboardSettings(data: {
    first_name: string;
    last_name: string;
    email: string;
    preferences: DashboardPreferences;
}) {
    const response = await api.put<DashboardSettings & { message: string }>("/dashboard/settings", data);
    return response.data;
}

export type DashboardCustomer = {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
};

export type DashboardPackage = {
    package_id: number;
    package_name: string;
    price: string;
    description?: string;
    duration_minutes?: number;
    inclusions?: string;
    pricing_type: "fixed" | "hourly";
};

export type CustomerRecord = DashboardCustomer & {
    bookings_count: number;
    bookings_sum_total_price: string | null;
};

export type DashboardSchedule = {
    schedule_id: number;
    schedule_date: string;
    start_time: string;
    end_time: string;
    status: "available" | "booked" | "blocked";
    bookings?: DashboardBooking[];
};

export type DashboardBooking = {
    booking_id: number;
    requests: string;
    decision_reason: string | null;
    total_price: string;
    booking_status: "pending" | "approved" | "confirmed" | "denied" | "cancelled";
    booked_at: string;
    customer: DashboardCustomer;
    package: DashboardPackage;
    schedule: DashboardSchedule;
};

export type DashboardStats = {
    upcoming_bookings: number;
    active_customers: number;
    studio_hours: number;
};

export async function getDashboardOverview() {
    const response = await api.get<{ stats: DashboardStats; bookings: DashboardBooking[] }>("/dashboard/overview");
    return response.data;
}

export async function getDashboardBookings() {
    const response = await api.get<{ bookings: DashboardBooking[] }>("/dashboard/bookings");
    return response.data.bookings;
}

export async function getDashboardSchedules() {
    const response = await api.get<{ schedules: DashboardSchedule[] }>("/dashboard/schedules");
    return response.data.schedules;
}

export async function getDashboardBlockedDates() {
    const response = await api.get<{ blocked_dates: string[] }>("/dashboard/schedules/blocked-dates");
    return response.data.blocked_dates;
}

export async function blockDashboardScheduleDate(schedule_date: string) {
    return api.post("/dashboard/schedules/block-date", { schedule_date });
}

export async function unblockDashboardScheduleDate(schedule_date: string) {
    return api.post("/dashboard/schedules/unblock-date", { schedule_date });
}

export async function getDashboardCustomers() {
    const response = await api.get<{ customers: CustomerRecord[] }>("/dashboard/customers");
    return response.data.customers;
}

export async function getDashboardPackages() {
    const response = await api.get<{ packages: DashboardPackage[] }>("/dashboard/packages");
    return response.data.packages;
}

export async function createDashboardCustomer(data: { first_name: string; last_name: string; email: string; password: string }) {
    return api.post("/dashboard/customers", data);
}

export async function updateDashboardCustomer(id: number, data: { first_name: string; last_name: string; email: string; password?: string }) {
    return api.put(`/dashboard/customers/${id}`, data);
}

export async function deleteDashboardCustomer(id: number) {
    return api.delete(`/dashboard/customers/${id}`);
}

export type BookingInput = {
    customer_id: number;
    package_id: number;
    schedule_id: number;
    requests: string;
    booking_status: DashboardBooking["booking_status"];
};

export type BookingDetailsInput = Pick<BookingInput, "package_id" | "schedule_id">;

export async function createDashboardBooking(data: BookingInput) {
    return api.post("/dashboard/bookings", data);
}

export async function updateDashboardBooking(id: number, data: BookingDetailsInput) {
    return api.put(`/dashboard/bookings/${id}`, data);
}

export async function decideDashboardBooking(
    id: number,
    decision: "approve" | "deny" | "confirm" | "cancel",
    reason: string,
) {
    return api.post(`/dashboard/bookings/${id}/decision`, { decision, reason });
}

export async function deleteDashboardBooking(id: number) {
    return api.delete(`/dashboard/bookings/${id}`);
}

export type ScheduleInput = {
    schedule_date: string;
    start_time: string;
    end_time: string;
    status: "available" | "blocked";
};

export async function createDashboardSchedule(data: ScheduleInput) {
    return api.post("/dashboard/schedules", data);
}

export async function updateDashboardSchedule(id: number, data: ScheduleInput) {
    return api.put(`/dashboard/schedules/${id}`, data);
}

export async function deleteDashboardSchedule(id: number) {
    return api.delete(`/dashboard/schedules/${id}`);
}
