import { defaultSiteMedia } from "./site-media-defaults";
import { useSiteMedia } from "./site-media-context";

function SiteMediaContent({
	mediaKey,
	alt,
	className,
	loading = "lazy",
}: {
	mediaKey: string;
	alt?: string;
	className?: string;
	loading?: "eager" | "lazy";
}) {
	const { media } = useSiteMedia();
	const record = media[mediaKey];
	const fallback = defaultSiteMedia[mediaKey];
	const src = record?.is_customized ? record.url : fallback?.url ?? record?.url ?? "";
	const text = alt ?? record?.alt_text ?? fallback?.alt_text ?? "";
	const commonProps = { className };

	if (record?.media_type === "video" && record.is_customized) {
		return <video {...commonProps} aria-label={text || undefined} src={src} autoPlay muted playsInline loop preload="metadata" />;
	}

	return <img {...commonProps} src={src} alt={text} loading={loading} />;
}

export default SiteMediaContent;
