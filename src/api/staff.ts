import api from "./axios";

export type StaffListMember = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	role: "Staff";
};

export type StaffMember = StaffListMember & {
	profile_image: string | null;
};

export type StaffInput = {
	first_name: string;
	last_name: string;
	email: string;
	password?: string;
	profile_image?: File | null;
};

function staffFormData(data: StaffInput) {
	const formData = new FormData();
	formData.append("first_name", data.first_name);
	formData.append("last_name", data.last_name);
	formData.append("email", data.email);
	if (data.password) formData.append("password", data.password);
	if (data.profile_image) formData.append("profile_image", data.profile_image);
	return formData;
}

export async function getStaffList() {
	const response = await api.get<{ staff: StaffListMember[] }>("/dashboard/staff");
	return response.data.staff;
}

export async function getStaffMember(id: number) {
	const response = await api.get<{ staff: StaffMember }>(`/dashboard/staff/${id}`);
	return response.data.staff;
}

export async function createStaffMember(data: StaffInput) {
	return api.post("/dashboard/staff", staffFormData(data), {
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export async function updateStaffMember(id: number, data: StaffInput) {
	const formData = staffFormData(data);
	formData.append("_method", "PUT");
	return api.post(`/dashboard/staff/${id}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export async function deleteStaffMember(id: number) {
	return api.delete(`/dashboard/staff/${id}`);
}
