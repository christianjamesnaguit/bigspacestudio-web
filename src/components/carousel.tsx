import { useState } from 'react'
import './styles.css'

const images = [
  '/images/photo1.jpg',
  '/images/photo2.jpg',
  '/images/photo3.jpg',
]

function Carousel() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [isAnimating, setIsAnimating] = useState(false)

  const nextImage = () => {
    if (isAnimating) return

    setDirection('next')
    setIsAnimating(true)

    setTimeout(() => {
      setCurrent((current + 1) % images.length)
      setIsAnimating(false)
    }, 400)
  }

  const previousImage = () => {
    if (isAnimating) return

    setDirection('prev')
    setIsAnimating(true)

    setTimeout(() => {
      setCurrent((current - 1 + images.length) % images.length)
      setIsAnimating(false)
    }, 400)
  }

  const nextIndex = (current + 1) % images.length
  const previousIndex = (current - 1 + images.length) % images.length

  return (
        <div className="carousel">

        <span className="carousel-arrow previous" onClick={previousImage}>
            ‹
        </span>

        <div className="carousel-content">

            <div className="carousel-window">
            <img
                src={images[current]}
                className={`carousel-image current ${isAnimating ? direction : ''}`}
                alt=""
            />

            {isAnimating && (
                <img
                src={images[direction === 'next' ? nextIndex : previousIndex]}
                className={`carousel-image incoming ${direction}`}
                alt=""
                />
            )}
            </div>

            <div className="carousel-dots">
            {images.map((_, index) => (
                <span
                key={index}
                className={`carousel-dot ${index === current ? 'active' : ''}`}
                onClick={() => {
                    if (!isAnimating && index !== current) {
                    setDirection(index > current ? 'next' : 'prev')
                    setIsAnimating(true)

                    setTimeout(() => {
                        setCurrent(index)
                        setIsAnimating(false)
                    }, 400)
                    }
                }}
                />
            ))}
            </div>

        </div>

        <span className="carousel-arrow next" onClick={nextImage}>
            ›
        </span>

        </div>
  )
}

export default Carousel