// components/ImageWithZoom.js
import { useState } from 'react';
import { MediumZoomProvider } from 'react-medium-image-zoom';
import styles from './ImageWithZoom.module.css';

const ImageWithZoom = ({ src, alt }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <MediumZoomProvider>
      <img
        src={src}
        alt={alt}
        onClick={() => setIsZoomed(!isZoomed)}
        className={`${styles.image} ${isZoomed ? styles.zoomed : ''}`}
      />
    </MediumZoomProvider>
  );
};

export default ImageWithZoom;
