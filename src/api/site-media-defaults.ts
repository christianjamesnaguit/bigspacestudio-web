import beautyIcon from "../assets/beauty.png";
import comfortIcon from "../assets/comfort.png";
import facebookIcon from "../assets/facebook.png";
import buildingIcon from "../assets/icons/building.svg";
import emailIcon from "../assets/icons/email.svg";
import hoursIcon from "../assets/icons/hourglass.svg";
import phoneIcon from "../assets/icons/phone.svg";
import instagramIcon from "../assets/instagram.png";
import logoImage from "../assets/logo.jpg";
import messengerIcon from "../assets/messenger.png";
import premiumIcon from "../assets/premium.png";
import professionalIcon from "../assets/professional.png";
import tiktokIcon from "../assets/tiktok.png";

export type SiteMediaRecord = {
	id: number;
	media_key: string;
	label: string;
	url: string;
	default_url: string;
	alt_text: string;
	media_type: "image" | "video";
	is_customized: boolean;
};

export const defaultSiteMedia: Record<string, { url: string; alt_text: string }> = {
	"home.carousel.1": { url: "/images/photo1.jpg", alt_text: "Studio portfolio image 1" },
	"home.carousel.2": { url: "/images/photo2.jpg", alt_text: "Studio portfolio image 2" },
	"home.carousel.3": { url: "/images/photo3.jpg", alt_text: "Studio portfolio image 3" },
	"home.showcase.1": { url: "/images/eg1.jpg", alt_text: "" },
	"home.showcase.2": { url: "/images/eg2.jpg", alt_text: "" },
	"home.showcase.3": { url: "/images/eg3.jpg", alt_text: "" },
	"home.showcase.4": { url: "/images/eg4.jpg", alt_text: "" },
	"home.showcase.5": { url: "/images/eg5.jpg", alt_text: "" },
	"home.showcase.6": { url: "/images/eg6.jpg", alt_text: "" },
	"home.quality.premium": { url: premiumIcon, alt_text: "Premium quality" },
	"home.quality.professional": { url: professionalIcon, alt_text: "Professional experience" },
	"home.quality.comfort": { url: comfortIcon, alt_text: "Comfortable studio" },
	"home.quality.beauty": { url: beautyIcon, alt_text: "Beautiful results" },
	"home.about": { url: "/images/what.jpg", alt_text: "About Us" },
	"home.milestones": { url: "/images/who.jpg", alt_text: "Big Space Studio milestones" },
	"portfolio.1": { url: "/images/eg1.jpg", alt_text: "Portfolio photography" },
	"portfolio.2": { url: "/images/eg2.jpg", alt_text: "Portfolio photography" },
	"portfolio.3": { url: "/images/eg3.jpg", alt_text: "Portfolio photography" },
	"portfolio.4": { url: "/images/eg4.jpg", alt_text: "Portfolio photography" },
	"portfolio.5": { url: "/images/eg5.jpg", alt_text: "Portfolio photography" },
	"portfolio.6": { url: "/images/eg6.jpg", alt_text: "Portfolio photography" },
	"faq.image": { url: "/images/photo3.jpg", alt_text: "Big Space Studio" },
	"contact.background": { url: "/images/where.jpg", alt_text: "" },
	"brand.logo": { url: logoImage, alt_text: "Big Space Studio" },
	"social.facebook": { url: facebookIcon, alt_text: "Facebook" },
	"social.messenger": { url: messengerIcon, alt_text: "Messenger" },
	"social.instagram": { url: instagramIcon, alt_text: "Instagram" },
	"social.tiktok": { url: tiktokIcon, alt_text: "TikTok" },
	"contact.icon.building": { url: buildingIcon, alt_text: "Building" },
	"contact.icon.hours": { url: hoursIcon, alt_text: "Clock" },
	"footer.icon.phone": { url: phoneIcon, alt_text: "" },
	"footer.icon.email": { url: emailIcon, alt_text: "" },
};

export function getHomeMediaKeys(media: Record<string, SiteMediaRecord>, collection: "carousel" | "showcase") {
	return Object.keys(media)
		.filter((key) => key.startsWith(`home.${collection}.`))
		.sort((left, right) => homeMediaIndex(left) - homeMediaIndex(right));
}

export function sortHomeMediaRecords(records: SiteMediaRecord[]) {
	return [...records].sort((left, right) => homeMediaIndex(left.media_key) - homeMediaIndex(right.media_key));
}

function homeMediaIndex(mediaKey: string) {
	return Number(mediaKey.slice(mediaKey.lastIndexOf(".") + 1));
}
