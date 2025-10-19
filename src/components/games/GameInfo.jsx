import React from "react";
import GameCover from "../gb/GameCover";

export default function GameInfo({ title, date, sanitizedHtml, imageObj, platformsStr, publishersStr, genresStr, displayRating, gb, review }) {
  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
      <div className="flex-shrink-0">
        <GameCover image={imageObj} alt={title} />
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
            {review && typeof review?.rating !== "undefined" ? (
              <span>· Sua nota: <strong>{Math.round(Number(review.rating || 0))}</strong></span>
            ) : gb && typeof gb?.rating !== "undefined" ? (
              <span>· GB: <strong>{Math.round(Number(gb.rating))}</strong></span>
            ) : null}
          </div>
          {review && typeof review.reviews_count !== "undefined" && <div className="text-xs text-gray-500 ml-2">· {review.reviews_count} reviews</div>}
          {!review && typeof gb?.reviews_count !== "undefined" && <div className="text-xs text-gray-500 ml-2">· {gb.reviews_count} reviews</div>}
        </div>
      </div>

      <div className="min-w-0 w-full">
        <div className="text-sm text-gray-500 dark:text-gray-400">Data de Lançamento: {date}</div>

        <div className="mt-3 text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words truncate">
          {sanitizedHtml ? <div className="line-clamp-6 md:line-clamp-8" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} /> : <p className="italic text-gray-500">Sem descrição disponível.</p>}
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 truncate">
          <strong className="font-medium">Plataformas:</strong> <span className="ml-1">{platformsStr}</span>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Publisher</div>
            <div className="truncate max-w-[28rem]">{publishersStr}</div>
          </div>
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Gênero</div>
            <div className="truncate max-w-[28rem]">{genresStr}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
