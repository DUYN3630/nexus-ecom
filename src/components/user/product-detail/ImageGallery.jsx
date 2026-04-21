import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto no-scrollbar lg:w-20">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`flex-shrink-0 w-20 h-20 rounded-2xl border-2 transition-all overflow-hidden bg-slate-50 ${activeIndex === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
          >
            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
      {/* Main Image */}
      <div className="flex-1 aspect-square bg-slate-50 rounded-[3rem] overflow-hidden relative group">
        <img 
          src={images[activeIndex]} 
          alt="Main product" 
          className="w-full h-full object-contain p-12 transition-transform duration-1000 group-hover:scale-110" 
        />
        <button className="absolute top-6 right-6 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Search size={20} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default ImageGallery;