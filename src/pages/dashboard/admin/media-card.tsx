import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { defaultSiteMedia, type SiteMediaRecord } from "../../../api/site-media-defaults";

type Props = {
	record: SiteMediaRecord;
	isSelected: boolean;
	onSelect: (id: number) => void;
	onUpload: (id: number, file: File) => Promise<void>;
	onSetFeatured: (id: number) => Promise<void>;
	onDeletePortfolioMedia: (id: number) => Promise<void>;
	onError: (error: unknown) => void;
};

function SiteMediaCard({ record, isSelected, onSelect, onUpload, onSetFeatured, onDeletePortfolioMedia, onError }: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const isVideoPreview = file?.type.startsWith("video/") ?? false;
	const isPortfolioImage = record.media_key.startsWith("portfolio.");

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		const selectedFile = event.target.files?.[0] ?? null;
		setFile(selectedFile);
		setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!file) return;
		const form = event.currentTarget;
		setIsSaving(true);
		try {
			await onUpload(record.id, file);
			setFile(null);
			setPreviewUrl("");
			form.reset();
		} catch (error) {
			onError(error);
		} finally {
			setIsSaving(false);
		}
	}

	async function handlePortfolioDelete() {
		if (!window.confirm(`Permanently delete "${record.label}" from the portfolio? This cannot be undone.`)) return;

		setIsSaving(true);
		try {
			await onDeletePortfolioMedia(record.id);
		} catch (error) {
			onError(error);
		} finally {
			setIsSaving(false);
		}
	}

	async function handleSetFeatured() {
		setIsSaving(true);
		try {
			await onSetFeatured(record.id);
		} catch (error) {
			onError(error);
		} finally {
			setIsSaving(false);
		}
	}

	const fallback = defaultSiteMedia[record.media_key];
	const mediaUrl = previewUrl || (record.is_customized ? record.url : fallback?.url ?? record.url);
	const previewIsVideo = previewUrl ? isVideoPreview : record.is_customized && record.media_type === "video";

	return (
		<article className={`dashboard-panel media-card${isSelected ? " is-selected" : ""}`}>
			{isPortfolioImage && (
				<label className="media-selection-control">
					<input type="checkbox" checked={isSelected} onChange={() => onSelect(record.id)} />
					<span>Select for bulk edit</span>
				</label>
			)}
			<div className="media-preview">
				{previewIsVideo
					? <video src={mediaUrl} muted playsInline controls preload="metadata" />
					: <img src={mediaUrl} alt={record.alt_text || record.label} />}
			</div>
			<div className="media-card-copy">
				<h2>{record.label}</h2>
				<p>{record.media_key}</p>
				<span className={record.is_customized ? "media-state customized" : "media-state"}>
					{record.is_customized ? `Custom ${record.media_type}` : "Original"}
				</span>
			</div>
			{isPortfolioImage && (
				<div className="portfolio-metadata-actions">
					<button type="button" className="crud-secondary" disabled={isSaving || record.is_featured} onClick={handleSetFeatured}>
						{record.is_featured ? "Featured image" : "Set as featured"}
					</button>
					<button type="button" className="crud-danger" disabled={isSaving} onClick={handlePortfolioDelete}>
						Delete image
					</button>
				</div>
			)}
			<form className="media-card-actions" onSubmit={handleSubmit}>
				<label className="media-file-label">
					Choose image or video
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
						onChange={handleFileChange}
					/>
				</label>
				<div className="media-card-buttons">
					<button type="submit" disabled={!file || isSaving}>{isSaving ? "Saving..." : "Upload"}</button>
				</div>
			</form>
		</article>
	);
}

export default SiteMediaCard;
