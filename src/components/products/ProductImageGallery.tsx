
import React, { useState } from "react";

// Accepts images as a string array, main image required, optional thumbnails
interface ProductImageGalleryProps {
  images: string[];
  alt?: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  alt = "Product image",
}) => {
  const [selected, setSelected] = useState<number>(0);
  const [lightbox, setLightbox] = useState<boolean>(false);

  if (!images?.length) return null;

  return (
    <div>
      {/* Main Image */}
      <div
        className="aspect-square rounded-lg overflow-hidden bg-muted border relative cursor-pointer group hover-scale"
        onClick={() => setLightbox(true)}
        tabIndex={0}
        aria-label="Zoom product image"
      >
        <img
          src={images[selected]}
          alt={alt}
          className="w-full h-full object-contain duration-150"
        />
        <span className="absolute bottom-2 right-2 bg-white/80 text-xs rounded px-2 py-0.5 shadow font-poppins group-hover:scale-110">Zoom</span>
      </div>
      {/* Thumbnails */}
      <div className="flex gap-2 mt-2">
        {images.map((img, idx) => (
          <button
            key={idx}
            className={`h-14 w-14 rounded border focus:outline-none p-1 ${selected === idx ? "border-primary ring-2 ring-primary/40" : "hover:border-muted-foreground"}`}
            onClick={() => setSelected(idx)}
            aria-label={`View product image ${idx + 1}`}
            type="button"
          >
            <img
              src={img}
              alt={`${alt} ${idx + 1}`}
              className="object-contain h-full w-full rounded"
            />
          </button>
        ))}
      </div>
      {/* Lightbox Overlay */}
      {lightbox && (
        <div
          className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
          tabIndex={0}
        >
          <img
            src={images[selected]}
            alt={alt}
            className="max-h-[80vh] max-w-[90vw] rounded shadow-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;

