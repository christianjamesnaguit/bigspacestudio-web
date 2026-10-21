import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Sidebar from "../../../components/dashboard/sidebar";
import { getApiError } from "../../../api/auth";
import { createHomeGalleryImage, createPortfolioImage, deleteHomeGalleryImage, deletePortfolioMedia, restoreSiteMedia, getSiteMediaRecords, setFeaturedPortfolioMedia, updatePortfolioMediaDetails, uploadSiteMedia } from "../../../api/site-media-admin";
import { useSiteMedia } from "../../../api/site-media-context";
import type { SiteMediaRecord } from "../../../api/site-media-defaults";
import SiteMediaCard from "./media-card";
import FaqEditor from "./faq-editor";
import HomeGalleryEditor from "./home-gallery-editor";
import "./styles/admin.css";
import "./styles/media.css";

function Media() {
	const [records, setRecords] = useState<SiteMediaRecord[]>([]);
	const [selectedPage, setSelectedPage] = useState("home");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
	const [isAddingPortfolioImage, setIsAddingPortfolioImage] = useState(false);
	const { refresh } = useSiteMedia();

	const pages = useMemo(() => [
		{
			id: "home",
			title: "Homepage",
			description: "Carousel, showcase, quality icons, and about section.",
			records: records.filter((record) => record.media_key.startsWith("home.")),
		},
		{
			id: "portfolio",
			title: "Portfolio",
			description: "Images displayed in the portfolio gallery.",
			records: records.filter((record) => record.media_key.startsWith("portfolio.")),
		},
		{
			id: "faq",
			title: "FAQ",
			description: "Manage FAQ categories, questions, answers, and page image.",
			records: records.filter((record) => record.media_key.startsWith("faq.")),
		},
		{
			id: "contact",
			title: "Contact",
			description: "Contact page background and information icons.",
			records: records.filter((record) => record.media_key.startsWith("contact.")),
		},
		{
			id: "shared",
			title: "Shared site assets",
			description: "Logo, social links, and footer icons used across pages.",
			records: records.filter((record) =>
				record.media_key.startsWith("brand.")
				|| record.media_key.startsWith("social.")
				|| record.media_key.startsWith("footer."),
			),
		},
	], [records]);
	const currentPage = pages.find((page) => page.id === selectedPage) ?? pages[0];

	useEffect(() => {
		let active = true;
		getSiteMediaRecords()
			.then((rows) => { if (active) setRecords(rows); })
			.catch((requestError) => { if (active) setError(getApiError(requestError, "Unable to load website media.")); });
		return () => { active = false; };
	}, []);

	async function persistUpload(id: number, file: File) {
		await uploadSiteMedia(id, file);
		await reloadMedia();
		setMessage("Website media updated.");
		setError("");
	}

	async function restore(id: number) {
		await restoreSiteMedia(id);
		await reloadMedia();
		setMessage("Original media restored.");
		setError("");
	}

	async function reloadMedia() {
		const rows = await getSiteMediaRecords();
		setRecords(rows);
		await refresh();
	}

	async function addHomeImage(collection: "carousel" | "showcase", file: File) {
		await createHomeGalleryImage(collection, file);
		await reloadMedia();
		setMessage("Homepage image added.");
		setError("");
	}

	async function replaceHomeImage(id: number, file: File) {
		await uploadSiteMedia(id, file);
		await reloadMedia();
		setMessage("Homepage image updated.");
		setError("");
	}

	async function persistPortfolioDetails(id: number, details: Pick<SiteMediaRecord, "category" | "shoot_type" | "client_name">) {
		await updatePortfolioMediaDetails(id, details);
		await reloadMedia();
		setMessage("Portfolio details updated.");
		setError("");
	}

	async function setFeaturedImage(id: number) {
		await setFeaturedPortfolioMedia(id);
		await reloadMedia();
		setMessage("Featured portfolio image updated.");
		setError("");
	}

	async function addPortfolioImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!portfolioFile) return;
		const form = event.currentTarget;
		setIsAddingPortfolioImage(true);
		try {
			await createPortfolioImage(portfolioFile);
			await reloadMedia();
			setPortfolioFile(null);
			form.reset();
			setMessage("Portfolio image added.");
			setError("");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to add portfolio image."));
		} finally {
			setIsAddingPortfolioImage(false);
		}
	}

	async function removePortfolioImage(id: number) {
		await deletePortfolioMedia(id);
		await reloadMedia();
		setMessage("Portfolio image deleted.");
		setError("");
	}

	async function removeHomeImage(id: number) {
		await deleteHomeGalleryImage(id);
		await reloadMedia();
		setMessage("Homepage image removed.");
		setError("");
	}

	return (
		<>
			<Sidebar />
			<main className="admin-body">
				<div className="page-heading">
					<div>
						<p className="eyebrow">Website content</p>
						<h1>Website</h1>
						<p className="page-description">Edit page media and FAQ content across the public site.</p>
					</div>
				</div>
				{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
				<p className="media-upload-note">Choose a page to edit its media. Upload JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, or MOV files up to 100 MB.</p>
				{error && records.length === 0 ? null : (
					<div className="media-editor">
						<nav className="media-page-picker" aria-label="Choose a site page to edit">
							{pages.map((page) => (
								<button
									type="button"
									className={`media-page-option${selectedPage === page.id ? " selected" : ""}`}
									key={page.id}
									aria-pressed={selectedPage === page.id}
									onClick={() => setSelectedPage(page.id)}
								>
									<strong>{page.title}</strong>
									<span>{page.records.length} editable {page.records.length === 1 ? "item" : "items"}</span>
								</button>
							))}
						</nav>
						{currentPage && (
							<section className="media-page-workspace" aria-labelledby="media-page-title">
								<div className="media-page-heading">
									<div>
										<p className="eyebrow">Page editor</p>
										<h2 id="media-page-title">{currentPage.title}</h2>
										<p>{currentPage.description}</p>
									</div>
									<span>{currentPage.records.length} {currentPage.records.length === 1 ? "media item" : "media items"}</span>
								</div>
								{currentPage.id === "home" && (
									<>
										<HomeGalleryEditor
											collection="carousel"
											records={currentPage.records.filter((record) => record.media_key.startsWith("home.carousel."))}
											onAdd={addHomeImage}
											onReplace={replaceHomeImage}
											onRemove={removeHomeImage}
											onError={(requestError) => setError(getApiError(requestError, "Unable to update homepage carousel images."))}
										/>
										<HomeGalleryEditor
											collection="showcase"
											records={currentPage.records.filter((record) => record.media_key.startsWith("home.showcase."))}
											onAdd={addHomeImage}
											onReplace={replaceHomeImage}
											onRemove={removeHomeImage}
											onError={(requestError) => setError(getApiError(requestError, "Unable to update homepage showcase images."))}
										/>
									</>
								)}
								{currentPage.id === "portfolio" && (
									<form className="portfolio-gallery-add" onSubmit={addPortfolioImage}>
										<label>
											Add portfolio image
											<input
												type="file"
												accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
												disabled={isAddingPortfolioImage}
												onChange={(event) => setPortfolioFile(event.target.files?.[0] ?? null)}
											/>
										</label>
										<button type="submit" disabled={!portfolioFile || isAddingPortfolioImage}>
											{isAddingPortfolioImage ? "Adding..." : "Add image"}
										</button>
									</form>
								)}
								<div className="media-grid">
									{currentPage.records.filter((record) => currentPage.id !== "home" || (!record.media_key.startsWith("home.carousel.") && !record.media_key.startsWith("home.showcase."))).map((record) => (
										<SiteMediaCard
											key={record.id}
											record={record}
											onUpload={persistUpload}
											onUpdatePortfolioDetails={persistPortfolioDetails}
											onSetFeatured={setFeaturedImage}
											onDeletePortfolioMedia={removePortfolioImage}
											onRestore={restore}
											onError={(requestError) => setError(getApiError(requestError, "Unable to update website media."))}
										/>
									))}
								</div>
								{currentPage.id === "faq" && <FaqEditor />}
							</section>
						)}
					</div>
				)}
			</main>
		</>
	);
}

export default Media;
