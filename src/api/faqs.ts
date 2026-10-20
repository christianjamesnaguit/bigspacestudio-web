import api from "./axios";

export type FaqItem = {
	id: number;
	category: string;
	summary: string;
	detail: string;
	sort_order: number;
};

export type FaqInput = Pick<FaqItem, "category" | "summary" | "detail" | "sort_order">;

export async function getFaqs() {
	const response = await api.get<{ faqs: FaqItem[] }>("/faqs");
	return response.data.faqs;
}

export async function createFaq(data: FaqInput) {
	return api.post("/dashboard/faqs", data);
}

export async function updateFaq(id: number, data: FaqInput) {
	return api.put(`/dashboard/faqs/${id}`, data);
}

export async function deleteFaq(id: number) {
	return api.delete(`/dashboard/faqs/${id}`);
}
