import './styles.css'
import SiteMediaContent from "../api/site-media-content";
import { defaultSiteMedia, getHomeMediaKeys } from "../api/site-media-defaults";
import { useSiteMedia } from "../api/site-media-context";

const defaultImages = Object.keys(defaultSiteMedia)
  .filter((key) => key.startsWith("home.showcase."));

function Showcase() {
  const { media, isLoaded } = useSiteMedia();
  const images = isLoaded ? getHomeMediaKeys(media, "showcase") : defaultImages;
  if (images.length === 0) return null;

  const loopImages = [...images, ...images]

  return (
    <div className="showcase">
      <div className="showcase-track">
        {loopImages.map((mediaKey, index) => (
          <SiteMediaContent
            key={`${mediaKey}-${index}`}
            mediaKey={mediaKey}
            className="showcase-image"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  )
}

export default Showcase