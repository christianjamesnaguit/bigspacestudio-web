import { createContext, useContext } from "react";
import type { SiteMediaRecord } from "./site-media-defaults";

export type SiteMediaContextValue = {
	media: Record<string, SiteMediaRecord>;
	isLoaded: boolean;
	refresh: () => Promise<void>;
};

export const SiteMediaContext = createContext<SiteMediaContextValue>({
	media: {},
	isLoaded: false,
	refresh: async () => {},
});

export function useSiteMedia() {
	return useContext(SiteMediaContext);
}
