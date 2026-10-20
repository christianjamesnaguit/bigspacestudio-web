import { defaultSiteMedia } from "./site-media-defaults";
import { useSiteMedia } from "./site-media-context";

function SiteMediaContent({ mediaKey, alt, className }: { mediaKey: string; alt?: string; className?: string }) {
	const { media } = useSiteMedia();
	const record = media[mediaKey];
	const fallback = defaultSiteMedia[mediaKey];
	const src = record?.is_customized ? record.url : fallback?.url ?? record?.url ?? "";
	const text = alt ?? record?.alt_text ?? fallback?.alt_text ?? "";
	const commonProps = { className, "aria-label": text || undefined };

	if (record?.media_type === "video" && record.is_customized) {
		return <video {...commonProps} src={src} autoPlay muted playsInline loop preload="metadata" />;
	}

	return <img {...commonProps} src={src} alt={text} />;
}

export default SiteMediaContent;
