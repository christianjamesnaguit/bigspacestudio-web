import './styles.css'

const images = [
  '/images/eg1.jpg',
  '/images/eg2.jpg',
  '/images/eg3.jpg',
  '/images/eg4.jpg',
  '/images/eg5.jpg',
  '/images/eg6.jpg',
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