import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { sortHomeMediaRecords, type SiteMediaRecord } from "../../../api/site-media-defaults";

type Collection = "carousel" | "showcase";

type Props = {
	collection: Collection;
	records: SiteMediaRecord[];
	onAdd: (collection: Collection, file: File) => Promise<void>;
	onReplace: (id: number, file: File) => Promise<void>;
	onRemove: (id: number) => Promise<void>;
	onError: (error: unknown) => void;
};

function HomeGalleryEditor({ collection, records, onAdd, onReplace, onRemove, onError }: Props) {
	const [newFile, setNewFile] = useState<File | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const title = collection === "carousel" ? "Carousel" : "Showcase";
	const orderedRecords = sortHomeMediaRecords(records);

	async function handleAdd(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!newFile) return;
		const form = event.currentTarget;
		setIsAdding(true);
		try {
			await onAdd(collection, newFile);
			setNewFile(null);
			form.reset();
		} catch (error) {
			onError(error);
		} finally {
			setIsAdding(false);
		}
	}

	return (
		<section className="home-gallery-editor" aria-labelledby={`home-gallery-${collection}-title`}>
			<div className="home-gallery-heading">
				<div>
					<h3 id={`home-gallery-${collection}-title`}>{title}</h3>
					<p>{collection === "carousel" ? "Slides shown at the top of the homepage." : "Images shown in the homepage showcase strip."}</p>
				</div>
				<span>{records.length} {records.length === 1 ? "image" : "images"}</span>
			</div>
			<form className="home-gallery-add" onSubmit={handleAdd}>
				<label>
					Add an image
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
						onChange={(event: ChangeEvent<HTMLInputElement>) => setNewFile(event.target.files?.[0] ?? null)}
					/>
				</label>
				<button type="submit" disabled={!newFile || isAdding}>{isAdding ? "Adding..." : `Add to ${title}`}</button>
			</form>
			{records.length === 0 ? (
				<p className="home-gallery-empty">No images yet. Add an image to display it on the homepage.</p>
			) : (
				<div className="home-gallery-grid">
					{orderedRecords.map((record) => (
						<HomeGalleryImage
							key={record.id}
							record={record}
							onReplace={onReplace}
							onRemove={onRemove}
							onError={onError}
						/>
					))}
				</div>
			)}
		</section>
	);
}

function HomeGalleryImage({
	record,
	onReplace,
	onRemove,
	onError,
}: {
	record: SiteMediaRecord;
	onReplace: (id: number, file: File) => Promise<void>;
	onRemove: (id: number) => Promise<void>;
	onError: (error: unknown) => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const mediaUrl = record.is_customized ? record.url : record.default_url;

	async function handleReplace(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!file) return;
		const form = event.currentTarget;
		setIsSaving(true);
		try {
			await onReplace(record.id, file);
			setFile(null);
			form.reset();
		} catch (error) {
			onError(error);
		} finally {
			setIsSaving(false);
		}
	}

	async function handleRemove() {
		if (!window.confirm(`Remove "${record.label}" from the homepage?`)) return;
		setIsSaving(true);
		try {
			await onRemove(record.id);
		} catch (error) {
			onError(error);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<article className="home-gallery-card">
			<div className="home-gallery-preview">
				{record.media_type === "video" && record.is_customized
					? <video src={mediaUrl} muted controls playsInline preload="metadata" />
					: <img src={mediaUrl} alt={record.alt_text || record.label} />}
			</div>
			<div className="home-gallery-card-body">
				<strong>{record.label}</strong>
				<form className="home-gallery-image-actions" onSubmit={handleReplace}>
					<label>
						Change image
						<input
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
							onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)}
						/>
					</label>
					<div>
						<button type="submit" disabled={!file || isSaving}>{isSaving ? "Saving..." : "Replace"}</button>
						<button type="button" className="crud-secondary" disabled={isSaving} onClick={handleRemove}>Remove</button>
					</div>
				</form>
			</div>
		</article>
	);
}

export default HomeGalleryEditor;
