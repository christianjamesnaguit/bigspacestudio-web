import './styles.css'

const images = [
  '/images/photo1.jpg',
  '/images/photo2.jpg',
  '/images/photo3.jpg',
]

function Showcase() {
  const loopImages = [...images, ...images]

  return (
    <div className="showcase">
      <div className="showcase-track">
        {loopImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt=""
            className="showcase-image"
          />
        ))}
      </div>
    </div>
  )
}

export default Showcase