import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Sidebar from "../../../components/dashboard/sidebar";
import { getApiError } from "../../../api/auth";
import { bulkUpdatePortfolioMediaDetails, createHomeGalleryImage, createPortfolioImage, deleteHomeGalleryImage, deletePortfolioMedia, getSiteMediaRecords, setFeaturedPortfolioMedia, uploadSiteMedia } from "../../../api/site-media-admin";
import type { PortfolioMediaDetails } from "../../../api/site-media-admin";
import { useSiteMedia } from "../../../api/site-media-context";
import { portfolioCategories, type SiteMediaRecord } from "../../../api/site-media-defaults";
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
	const [portfolioFiles, setPortfolioFiles] = useState<File[]>([]);
	const [isAddingPortfolioImage, setIsAddingPortfolioImage] = useState(false);
	const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<number[]>([]);
	const [includedPortfolioCategories, setIncludedPortfolioCategories] = useState<string[]>([]);
	const [excludedPortfolioCategories, setExcludedPortfolioCategories] = useState<string[]>([]);
	const [portfolioSearch, setPortfolioSearch] = useState("");
	const [bulkDetails, setBulkDetails] = useState<PortfolioMediaDetails>({ category: null, shoot_type: null, client_name: null });
	const [isBulkSaving, setIsBulkSaving] = useState(false);
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
	const portfolioRecords = useMemo(
		() => currentPage?.id === "portfolio" ? currentPage.records : [],
		[currentPage],
	);
	const filteredPortfolioRecords = useMemo(() => {
		const search = portfolioSearch.trim().toLowerCase();
		return portfolioRecords.filter((record) => {
			const matchesIncludedCategory = includedPortfolioCategories.length === 0
				|| (record.category !== null && includedPortfolioCategories.includes(record.category));
			const matchesExcludedCategory = record.category === null
				|| !excludedPortfolioCategories.includes(record.category);
			const matchesSearch = !search || [
				record.label,
				record.media_key,
				record.category,
				record.shoot_type,
				record.client_name,
			].some((value) => value?.toLowerCase().includes(search));
			return matchesIncludedCategory && matchesExcludedCategory && matchesSearch;
		});
	}, [excludedPortfolioCategories, includedPortfolioCategories, portfolioRecords, portfolioSearch]);
	const allPortfolioSelected = filteredPortfolioRecords.length > 0
		&& filteredPortfolioRecords.every((record) => selectedPortfolioIds.includes(record.id));

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

	async function reloadMedia() {
		const rows = await getSiteMediaRecords();
		setRecords(rows);
		setSelectedPortfolioIds((ids) => ids.filter((id) => rows.some((row) => row.id === id)));
		await refresh();
	}

	function togglePortfolioSelection(id: number) {
		setSelectedPortfolioIds((ids) => ids.includes(id) ? ids.filter((selectedId) => selectedId !== id) : [...ids, id]);
	}

	function toggleAllPortfolioSelection() {
		const filteredIds = filteredPortfolioRecords.map((record) => record.id);
		setSelectedPortfolioIds((ids) => allPortfolioSelected
			? ids.filter((id) => !filteredIds.includes(id))
			: [...new Set([...ids, ...filteredIds])]);
	}

	function addPortfolioCategoryFilter(
		category: string,
		setCategories: (categories: string[]) => void,
		categories: string[],
	) {
		if (!category || categories.includes(category)) return;
		setCategories([...categories, category]);
	}

	function removePortfolioCategoryFilter(
		category: string,
		setCategories: (categories: string[]) => void,
		categories: string[],
	) {
		setCategories(categories.filter((currentCategory) => currentCategory !== category));
	}

	async function saveBulkPortfolioDetails(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (selectedPortfolioIds.length === 0) return;
		setIsBulkSaving(true);
		try {
			await bulkUpdatePortfolioMediaDetails(selectedPortfolioIds, bulkDetails);
			await reloadMedia();
			setBulkDetails({ category: null, shoot_type: null, client_name: null });
			setMessage(`Updated ${selectedPortfolioIds.length} portfolio ${selectedPortfolioIds.length === 1 ? "image" : "images"}.`);
			setError("");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to update selected portfolio images."));
		} finally {
			setIsBulkSaving(false);
		}
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

	async function setFeaturedImage(id: number) {
		await setFeaturedPortfolioMedia(id);
		await reloadMedia();
		setMessage("Featured portfolio image updated.");
		setError("");
	}

	async function addPortfolioImage(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (portfolioFiles.length === 0) return;
		const form = event.currentTarget;
		setIsAddingPortfolioImage(true);
		try {
			for (const file of portfolioFiles) {
				await createPortfolioImage(file);
			}
			await reloadMedia();
			const uploadedCount = portfolioFiles.length;
			setPortfolioFiles([]);
			form.reset();
			setMessage(`Added ${uploadedCount} portfolio ${uploadedCount === 1 ? "image" : "images"}.`);
			setError("");
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to add all selected portfolio images."));
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
									<>
										<section className="portfolio-tool-panel portfolio-upload-panel" aria-labelledby="portfolio-upload-title">
											<div className="portfolio-tool-heading">
												<div>
													<p className="eyebrow">Portfolio library</p>
													<h3 id="portfolio-upload-title">Add photos</h3>
													<p>Upload a new image to the portfolio gallery.</p>
												</div>
											</div>
											<form className="portfolio-gallery-add" onSubmit={addPortfolioImage}>
												<label>
													Choose portfolio images
													<input
														type="file"
														multiple
														accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
														disabled={isAddingPortfolioImage}
														onChange={(event) => setPortfolioFiles(Array.from(event.target.files ?? []))}
													/>
												</label>
												<button type="submit" disabled={portfolioFiles.length === 0 || isAddingPortfolioImage}>
													{isAddingPortfolioImage ? "Adding..." : `Add ${portfolioFiles.length || ""} image${portfolioFiles.length === 1 ? "" : "s"}`}
												</button>
											</form>
										</section>
										<section className="portfolio-tool-panel" aria-labelledby="portfolio-filter-title">
											<div className="portfolio-tool-heading">
												<div>
													<p className="eyebrow">Browse photos</p>
													<h3 id="portfolio-filter-title">Filter photos</h3>
													<p>Use category tags or search details to find photos.</p>
												</div>
												<span>{filteredPortfolioRecords.length} of {portfolioRecords.length} shown</span>
											</div>
											<div className="portfolio-photo-filters" aria-label="Filter portfolio photos">
												<label className="portfolio-search-filter">
													Search photos
													<input
														type="search"
														value={portfolioSearch}
														placeholder="Label, shoot type, client..."
														onChange={(event) => setPortfolioSearch(event.target.value)}
													/>
												</label>
												<div className="portfolio-category-filter">
													<label htmlFor="portfolio-include-category">Include categories</label>
													<select
														id="portfolio-include-category"
														value=""
														onChange={(event) => addPortfolioCategoryFilter(event.target.value, setIncludedPortfolioCategories, includedPortfolioCategories)}
													>
														<option value="">Add category...</option>
														{portfolioCategories.map((category) => <option key={category} value={category}>{category}</option>)}
													</select>
													<div className="portfolio-category-tags" aria-label="Included categories">
														{includedPortfolioCategories.map((category) => (
															<button key={category} type="button" className="portfolio-category-tag include" onClick={() => removePortfolioCategoryFilter(category, setIncludedPortfolioCategories, includedPortfolioCategories)}>
																{category} <span aria-hidden="true">×</span>
															</button>
														))}
													</div>
												</div>
												<div className="portfolio-category-filter">
													<label htmlFor="portfolio-exclude-category">Exclude categories</label>
													<select
														id="portfolio-exclude-category"
														value=""
														onChange={(event) => addPortfolioCategoryFilter(event.target.value, setExcludedPortfolioCategories, excludedPortfolioCategories)}
													>
														<option value="">Add category...</option>
														{portfolioCategories.map((category) => <option key={category} value={category}>{category}</option>)}
													</select>
													<div className="portfolio-category-tags" aria-label="Excluded categories">
														{excludedPortfolioCategories.map((category) => (
															<button key={category} type="button" className="portfolio-category-tag exclude" onClick={() => removePortfolioCategoryFilter(category, setExcludedPortfolioCategories, excludedPortfolioCategories)}>
																{category} <span aria-hidden="true">×</span>
															</button>
														))}
													</div>
												</div>
												<p id="portfolio-category-filter-help">Use the dropdowns to add category tags. Leave Include categories empty to show all categories; excluded categories are always hidden.</p>
											</div>
										</section>
										<section className="portfolio-tool-panel portfolio-bulk-editor" aria-labelledby="portfolio-bulk-title">
											<div className="portfolio-bulk-heading">
												<div>
													<p className="eyebrow">Batch changes</p>
													<h3 id="portfolio-bulk-title">Bulk edit details</h3>
													<p>Select photos below, then apply shared details to all selected images.</p>
												</div>
												<label className="media-selection-control">
													<input type="checkbox" checked={allPortfolioSelected} onChange={toggleAllPortfolioSelection} />
													<span>Select all {filteredPortfolioRecords.length} visible photos</span>
												</label>
											</div>
											<form className="portfolio-bulk-form" onSubmit={saveBulkPortfolioDetails}>
												<label>
													Category
													<select value={bulkDetails.category ?? ""} disabled={isBulkSaving || selectedPortfolioIds.length === 0} onChange={(event) => setBulkDetails({ ...bulkDetails, category: event.target.value || null })}>
														<option value="">Unassigned</option>
														{["Graduation", "Birthday", "Solo Creative", "Duo/Couple (portrait)", "Prenup (portrait)", "K-Profile", "Family", "Corporate", "Barkada"].map((category) => <option key={category} value={category}>{category}</option>)}
													</select>
												</label>
												<label>
													Shoot type
													<input maxLength={120} value={bulkDetails.shoot_type ?? ""} disabled={isBulkSaving || selectedPortfolioIds.length === 0} onChange={(event) => setBulkDetails({ ...bulkDetails, shoot_type: event.target.value || null })} />
												</label>
												<label>
													Client / project name
													<input maxLength={180} value={bulkDetails.client_name ?? ""} disabled={isBulkSaving || selectedPortfolioIds.length === 0} onChange={(event) => setBulkDetails({ ...bulkDetails, client_name: event.target.value || null })} />
												</label>
												<button type="submit" disabled={isBulkSaving || selectedPortfolioIds.length === 0}>{isBulkSaving ? "Applying..." : `Apply to ${selectedPortfolioIds.length || "selected"} photos`}</button>
											</form>
										</section>
										<section className="portfolio-library-panel" aria-labelledby="portfolio-library-title">
											<div className="portfolio-tool-heading">
												<div>
													<p className="eyebrow">Manage images</p>
													<h3 id="portfolio-library-title">Photo library</h3>
													<p>Replace, restore, feature, or delete individual photos.</p>
												</div>
											</div>
											<div className="media-grid">
												{filteredPortfolioRecords.map((record) => (
													<SiteMediaCard
														key={record.id}
														record={record}
														isSelected={selectedPortfolioIds.includes(record.id)}
														onSelect={togglePortfolioSelection}
														onUpload={persistUpload}
														onSetFeatured={setFeaturedImage}
														onDeletePortfolioMedia={removePortfolioImage}
														onError={(requestError) => setError(getApiError(requestError, "Unable to update website media."))}
													/>
												))}
												{filteredPortfolioRecords.length === 0 && (
													<p className="portfolio-filter-empty">No portfolio photos match the current filters.</p>
												)}
											</div>
										</section>
									</>
								)}
								{currentPage.id !== "portfolio" && <div className="media-grid">
									{(currentPage.id === "portfolio"
										? filteredPortfolioRecords
										: currentPage.records.filter((record) => currentPage.id !== "home" || (!record.media_key.startsWith("home.carousel.") && !record.media_key.startsWith("home.showcase.")))
									).map((record) => (
										<SiteMediaCard
											key={record.id}
											record={record}
											isSelected={selectedPortfolioIds.includes(record.id)}
											onSelect={togglePortfolioSelection}
											onUpload={persistUpload}
											onSetFeatured={setFeaturedImage}
											onDeletePortfolioMedia={removePortfolioImage}
											onError={(requestError) => setError(getApiError(requestError, "Unable to update website media."))}
										/>
									))}
								</div>
								}
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
