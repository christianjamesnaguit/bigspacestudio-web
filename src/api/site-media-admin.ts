import api from "./axios";
import type { SiteMediaRecord } from "./site-media-defaults";

export type PortfolioMediaDetails = Pick<SiteMediaRecord, "category" | "shoot_type" | "client_name">;

export async function getSiteMediaRecords() {
	const response = await api.get<{ media: SiteMediaRecord[] }>("/site-media");
	return response.data.media;
}

export async function uploadSiteMedia(id: number, file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return api.post(`/dashboard/media/${id}`, formData);
}

export async function createHomeGalleryImage(collection: "carousel" | "showcase", file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return api.post(`/dashboard/media/home/${collection}`, formData);
}

export async function createPortfolioImage(file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return api.post("/dashboard/media/portfolio", formData);
}

export async function deleteHomeGalleryImage(id: number) {
	return api.delete(`/dashboard/media/home/${id}`);
}

export async function restoreSiteMedia(id: number) {
	return api.delete(`/dashboard/media/${id}`);
}

export async function updatePortfolioMediaDetails(id: number, details: PortfolioMediaDetails) {
	return api.patch(`/dashboard/media/${id}/portfolio-details`, details);
}

export async function bulkUpdatePortfolioMediaDetails(media_ids: number[], details: PortfolioMediaDetails) {
	return api.patch("/dashboard/media/portfolio-details/bulk", { media_ids, ...details });
}

export async function setFeaturedPortfolioMedia(id: number) {
	return api.patch(`/dashboard/media/${id}/portfolio-featured`);
}

export async function deletePortfolioMedia(id: number) {
	return api.delete(`/dashboard/media/portfolio/${id}`);
}
