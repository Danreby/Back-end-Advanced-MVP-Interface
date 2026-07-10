import React from "react";
import GameCover from "../gb/GameCover";

function TagList({ items, color = "gray" }) {
  if (!items || items.length === 0) return <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>;

  const colors = {
    gray:   "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700",
    teal:   "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-700",
  };

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {items.map((name) => (
        <span
          key={name}
          className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${colors[color] || colors.gray}`}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

function MetaRow({ label, children }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide font-semibold text-gray-400 dark:text-gray-500">
        {label}
      </span>
      {children}
    </div>
  );
}

export default function GameInfo({ title, date, sanitizedHtml, imageObj, platformsStr, publishersStr, genresStr, displayRating, gb, review }) {
  const platforms = gb?.platforms?.map(p => p.name) || (platformsStr && platformsStr !== "—" ? platformsStr.split(", ") : []);
  const genres    = gb?.genres?.map(g => g.name)    || (genresStr    && genresStr    !== "—" ? genresStr.split(", ")    : []);
  const publishers = gb?.publishers?.map(p => p.name) || (publishersStr && publishersStr !== "—" ? publishersStr.split(", ") : []);

  const ratingValue = review?.rating != null
    ? Math.round(Number(review.rating))
    : displayRating != null
    ? Math.round(Number(displayRating))
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-5 items-start mt-2">
      {/* Capa + nota */}
      <div className="flex-shrink-0 flex flex-col items-center gap-3">
        <GameCover image={imageObj} alt={title} />

        {ratingValue !== null && ratingValue > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 w-full justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.785.57-1.84-.197-1.54-1.118l1.286-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.05 2.927z" />
            </svg>
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {ratingValue}/10
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {review?.rating != null ? "sua nota" : "RAWG"}
            </span>
          </div>
        )}
      </div>

      {/* Metadados */}
      <div className="flex-1 min-w-0 w-full space-y-3">
        {/* Data de lançamento */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{date || "Data não disponível"}</span>
        </div>

        {/* Descrição */}
        {sanitizedHtml ? (
          <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-200 break-words line-clamp-5 md:line-clamp-8">
            {sanitizedHtml}
          </div>
        ) : (
          <p className="text-sm italic text-gray-400 dark:text-gray-500">Sem descrição disponível.</p>
        )}

        <div className="border-t border-gray-100 dark:border-gray-700 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Plataformas */}
          {platforms.length > 0 && (
            <MetaRow label="Plataformas">
              <TagList items={platforms.slice(0, 6)} color="gray" />
            </MetaRow>
          )}

          {/* Gêneros */}
          {genres.length > 0 && (
            <MetaRow label="Gêneros">
              <TagList items={genres} color="indigo" />
            </MetaRow>
          )}

          {/* Publishers */}
          {publishers.length > 0 && (
            <MetaRow label="Publicadora">
              <TagList items={publishers} color="teal" />
            </MetaRow>
          )}
        </div>
      </div>
    </div>
  );
}
