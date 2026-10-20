import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "./axios";
import { SiteMediaContext } from "./site-media-context";
import type { SiteMediaRecord } from "./site-media-defaults";

export function SiteMediaProvider({ children }: { children: ReactNode }) {
	const [media, setMedia] = useState<Record<string, SiteMediaRecord>>({});
	const [isLoaded, setIsLoaded] = useState(false);

	async function refresh() {
		const response = await api.get<{ media: SiteMediaRecord[] }>("/site-media");
		setMedia(Object.fromEntries(response.data.media.map((asset) => [asset.media_key, asset])));
		setIsLoaded(true);
	}

	useEffect(() => {
		let isActive = true;
		api.get<{ media: SiteMediaRecord[] }>("/site-media")
			.then((response) => {
				if (isActive) {
					setMedia(Object.fromEntries(response.data.media.map((asset) => [asset.media_key, asset])));
					setIsLoaded(true);
				}
			})
			.catch((error: unknown) => {
				console.error("Unable to load site media; using bundled defaults.", error);
			});

		return () => { isActive = false; };
	}, []);

	return <SiteMediaContext.Provider value={{ media, isLoaded, refresh }}>{children}</SiteMediaContext.Provider>;
}
