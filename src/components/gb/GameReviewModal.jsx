// src/components/GameReviewModal/index.jsx
import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Modal from "../ui/Modal";
import RatingStars from "../ui/RatingStars";
import useGameReview from "../../Hooks/useGameReview";
import ReviewSection from "../games/ReviewSection";
import StatusButtons from "../common/button/StatusButton";
import GameInfo from "../games/GameInfo";

export default function GameReviewModal({ isOpen, onClose, game, onImport, onSavedReview = null, onStatusChange = null }) {
  const contentRef = useRef(null);
  const {
    loading,
    review,
    error,
    editing,
    setEditing,
    draftRating,
    setDraftRating,
    draftText,
    setDraftText,
    draftIsPublic,
    setDraftIsPublic,
    saving,
    importing,
    importError,
    autoSaving,
    autoSaveSuccess,
    status,
    updatingStatusTo,
    gb,
    title,
    date,
    sanitizedHtml,
    platformsStr,
    publishersStr,
    genresStr,
    imageObj,
    displayRating,
    effectiveRating,
    reviewRating,
    handleSaveReview,
    handleStarsChange,
    handleImportClick,
    handleChangeStatus,
  } = useGameReview({ isOpen, game, onImport, onSavedReview, onStatusChange, onClose });

  // scroll to top when opening a new game
  React.useEffect(() => {
    if (isOpen && contentRef.current) contentRef.current.scrollTop = 0;
  }, [game, isOpen]);

  const entry = useMemo(
    () => ({ initial: { opacity: 0, y: 8, scale: 0.996 }, animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 20 } } }),
    []
  );

  return (
    <Modal key={game?.id ?? gb?.guid ?? "game-modal"} isOpen={isOpen} onClose={onClose} size="lg" ariaLabelledBy="game-title">
      <motion.div {...entry} className="p-0">
        <div ref={contentRef} className="p-4 sm:p-6 md:p-8 max-h-[80vh] overflow-auto pr-3" style={{ WebkitOverflowScrolling: "touch" }}>
          {!game ? (
            <div className="p-4 sm:p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                <div className="w-full h-44 sm:h-52 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <h2 id="game-title" className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {title}
                </h2>
                <button onClick={onClose} aria-label="Fechar" className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              <StatusButtons status={status} onChange={handleChangeStatus} updatingStatusTo={updatingStatusTo} />

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 items-start">
                <div className="flex-shrink-0">
                  <GameInfo
                    title={title}
                    date={date}
                    sanitizedHtml={sanitizedHtml}
                    imageObj={imageObj}
                    platformsStr={platformsStr}
                    publishersStr={publishersStr}
                    genresStr={genresStr}
                    displayRating={displayRating}
                    gb={gb}
                    review={review}
                  />

                  <div className="mt-3 flex gap-2 items-center flex-wrap">
                    <RatingStars value={effectiveRating ?? 0} onChange={handleStarsChange} readOnly={false} max={10} size={18} showTooltip />
                    <div className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                      {autoSaving ? <span className="text-xs text-gray-500">Salvando...</span> : autoSaveSuccess ? <span className="text-xs text-green-500">Salvo</span> : null}
                    </div>
                  </div>
                  <ReviewSection
                    loading={loading}
                    error={error}
                    review={review}
                    editing={editing}
                    setEditing={setEditing}
                    draftText={draftText}
                    setDraftText={setDraftText}
                    saving={saving}
                    handleSaveReview={handleSaveReview}
                    draftRating={draftRating}
                    setDraftRating={setDraftRating}
                  />
                </div>


              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Modal>
  );
}
