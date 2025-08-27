import React from 'react';

export default function GameCover({ image, alt }) {
  const src = image?.super_url || image?.medium_url || image?.small_url || null;
  return (
    <div className="flex-shrink-0 w-full sm:w-48 md:w-56 lg:w-64">
      {src ? (
        <img src={src} alt={alt} className="w-full h-56 sm:h-48 md:h-56 lg:h-80 object-cover rounded" />
      ) : (
        <div className="w-full h-56 sm:h-48 md:h-56 lg:h-64 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm text-gray-500">
          Sem imagem
        </div>
      )}
    </div>
  );
}
