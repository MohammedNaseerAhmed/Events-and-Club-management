import React from 'react';

const FeaturedEventPoster = ({ title, image, date, venue }) => {
  return (
    <div className="relative rounded-lg overflow-hidden shadow-lg group cursor-pointer max-w-md mx-auto">
      <img
        src={image || '/placeholder.png'}
        alt={title}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-2xl font-bold mb-1">{title}</h3>
        <p>{date ? new Date(date).toLocaleDateString() : 'Date TBA'}</p>
        <p>{venue || 'Venue TBA'}</p>
      </div>
    </div>
  );
};

export default FeaturedEventPoster;
