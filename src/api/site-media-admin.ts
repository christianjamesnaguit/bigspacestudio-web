import api from "./axios";
import type { SiteMediaRecord } from "./site-media-defaults";

export async function getSiteMediaRecords() {
	const response = await api.get<{ media: SiteMediaRecord[] }>("/site-media");
	return response.data.media;
}

export async function uploadSiteMedia(id: number, file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return api.post(`/dashboard/media/${id}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export async function createHomeGalleryImage(collection: "carousel" | "showcase", file: File) {
	const formData = new FormData();
	formData.append("file", file);
	return api.post(`/dashboard/media/home/${collection}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	});
}

export async function deleteHomeGalleryImage(id: number) {
	return api.delete(`/dashboard/media/home/${id}`);
}

export async function restoreSiteMedia(id: number) {
	return api.delete(`/dashboard/media/${id}`);
}
