import api from "./axios";

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
    total_price: string;
    booking_status: "pending" | "confirmed" | "cancelled";
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

export async function getDashboardCustomers() {
    const response = await api.get<{ customers: (DashboardCustomer & {
        bookings_count: number;
        bookings_sum_total_price: string | null;
    })[] }>("/dashboard/customers");
    return response.data.customers;
}
