import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { getApiError } from "../../../api/auth";
import { createFaq, deleteFaq, getFaqs, updateFaq } from "../../../api/faqs";
import type { FaqInput, FaqItem } from "../../../api/faqs";

type FaqForm = {
	category: string;
	newCategory: string;
	summary: string;
	detail: string;
	sortOrder: string;
};

const blankForm: FaqForm = {
	category: "",
	newCategory: "",
	summary: "",
	detail: "",
	sortOrder: "0",
};

function FaqEditor() {
	const [faqs, setFaqs] = useState<FaqItem[]>([]);
	const [form, setForm] = useState<FaqForm>(blankForm);
	const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isAddingCategory, setIsAddingCategory] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const categories = useMemo(() => [...new Set(faqs.map((faq) => faq.category))].sort(), [faqs]);
	const groupedFaqs = useMemo(() => categories.map((category) => ({
		category,
		items: faqs
			.filter((faq) => faq.category === category)
			.sort((first, second) => first.sort_order - second.sort_order || first.id - second.id),
	})), [categories, faqs]);

	async function loadFaqs() {
		setFaqs(await getFaqs());
	}

	useEffect(() => {
		let active = true;
		getFaqs()
			.then((items) => { if (active) setFaqs(items); })
			.catch((requestError) => {
				if (active) setError(getApiError(requestError, "Unable to load FAQs."));
			})
			.finally(() => { if (active) setIsLoading(false); });
		return () => { active = false; };
	}, []);

	function startCreate() {
		setIsFormOpen(true);
		setEditingFaqId(null);
		setForm({ ...blankForm, category: categories[0] ?? "" });
		setIsAddingCategory(false);
		setError("");
		setMessage("");
	}

	function startEdit(faq: FaqItem) {
		setIsFormOpen(true);
		setEditingFaqId(faq.id);
		setForm({
			category: faq.category,
			newCategory: "",
			summary: faq.summary,
			detail: faq.detail,
			sortOrder: String(faq.sort_order),
		});
		setIsAddingCategory(false);
		setError("");
		setMessage("");
	}

	function cancelEdit() {
		setIsFormOpen(false);
		setEditingFaqId(null);
		setForm(blankForm);
		setIsAddingCategory(false);
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const category = (isAddingCategory ? form.newCategory : form.category).trim().toUpperCase();
		const sortOrder = Number(form.sortOrder);
		if (!category || !form.summary.trim() || !form.detail.trim() || !Number.isInteger(sortOrder) || sortOrder < 0) {
			setError("Enter a category, question, answer, and a valid order.");
			return;
		}

		const payload: FaqInput = {
			category,
			summary: form.summary.trim(),
			detail: form.detail.trim(),
			sort_order: sortOrder,
		};
		setIsSaving(true);
		setError("");
		setMessage("");
		try {
			if (editingFaqId === null) {
				await createFaq(payload);
				setMessage("FAQ added.");
			} else {
				await updateFaq(editingFaqId, payload);
				setMessage("FAQ updated.");
			}
			cancelEdit();
			await loadFaqs();
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to save FAQ."));
		} finally {
			setIsSaving(false);
		}
	}

	async function handleDelete(faq: FaqItem) {
		if (!window.confirm(`Delete the question "${faq.summary}"?`)) return;
		setError("");
		setMessage("");
		try {
			await deleteFaq(faq.id);
			setMessage("FAQ deleted.");
			if (editingFaqId === faq.id) cancelEdit();
			await loadFaqs();
		} catch (requestError) {
			setError(getApiError(requestError, "Unable to delete FAQ."));
		}
	}

	return (
		<section className="faq-editor" aria-labelledby="faq-editor-title">
			<div className="faq-editor-heading">
				<div>
					<p className="eyebrow">FAQ content</p>
					<h3 id="faq-editor-title">Questions and answers</h3>
					<p>Manage the category dropdown, question summaries, and answer details shown on the public FAQ page.</p>
				</div>
				<button type="button" onClick={startCreate}>Add FAQ</button>
			</div>
			{(error || message) && <p className={error ? "crud-error" : "crud-success"} role={error ? "alert" : "status"}>{error || message}</p>}
			{isFormOpen && (
				<form className="faq-editor-form" onSubmit={handleSubmit}>
					<h4>{editingFaqId === null ? "Add FAQ" : "Edit FAQ"}</h4>
					<div className="faq-editor-fields">
						<div className="faq-editor-category-field">
							<label htmlFor="faq-editor-category">Category</label>
							{isAddingCategory ? (
								<div className="faq-new-category">
									<input
										autoFocus
										required
										maxLength={80}
										value={form.newCategory}
										onChange={(event) => setForm({ ...form, newCategory: event.target.value })}
										placeholder="Enter category name"
									/>
									<button type="button" className="crud-secondary" onClick={() => setIsAddingCategory(false)}>Choose existing</button>
								</div>
							) : (
								<div className="faq-category-control">
									<select
										id="faq-editor-category"
										required
										value={form.category}
										onChange={(event) => {
											if (event.target.value === "__new__") {
												setIsAddingCategory(true);
												setForm({ ...form, newCategory: "" });
											} else {
												setForm({ ...form, category: event.target.value });
											}
										}}
									>
										<option value="" disabled>Select category</option>
										{categories.map((category) => <option value={category} key={category}>{category}</option>)}
										<option value="__new__">+ Add category</option>
									</select>
								</div>
							)}
						</div>
						<label>
							Display order
							<input type="number" min="0" max="10000" required value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
						</label>
						<label className="faq-editor-wide">
							Summary / question
							<input required maxLength={255} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} />
						</label>
						<label className="faq-editor-wide">
							Detail / answer
							<textarea required maxLength={10000} rows={4} value={form.detail} onChange={(event) => setForm({ ...form, detail: event.target.value })} />
						</label>
					</div>
					<div className="faq-editor-actions">
						<button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingFaqId === null ? "Add FAQ" : "Save changes"}</button>
						<button type="button" className="crud-secondary" disabled={isSaving} onClick={cancelEdit}>Cancel</button>
					</div>
				</form>
			)}
			{isLoading ? <p role="status">Loading FAQs...</p> : groupedFaqs.length === 0 ? (
				<p className="faq-editor-empty">No FAQs have been added yet.</p>
			) : (
				<div className="faq-admin-groups">
					{groupedFaqs.map(({ category, items }) => (
						<section className="faq-admin-group" key={category}>
							<div className="faq-admin-group-heading"><h4>{category}</h4><span>{items.length} {items.length === 1 ? "question" : "questions"}</span></div>
							{items.map((faq) => (
								<article className="faq-admin-item" key={faq.id}>
									<div className="faq-admin-copy">
										<strong>{faq.summary}</strong>
										<p>{faq.detail}</p>
									</div>
									<div className="faq-admin-actions">
										<button type="button" className="crud-secondary" onClick={() => startEdit(faq)}>Edit</button>
										<button type="button" className="crud-danger" onClick={() => handleDelete(faq)}>Delete</button>
									</div>
								</article>
							))}
						</section>
					))}
				</div>
			)}
		</section>
	);
}

export default FaqEditor;
