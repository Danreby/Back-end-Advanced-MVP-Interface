// src/components/GameReviewModal/ReviewSection.jsx
import React from "react";

export default function ReviewSection({
  loading,
  error,
  review,
  editing,
  setEditing,
  draftText,
  setDraftText,
  saving,
  handleSaveReview,
  draftRating,
  setDraftRating,
}) {
  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium dark:text-white">Sua review</div>
        <div className="text-xs text-gray-500">
          {loading ? "Carregando..." : review ? `Última: ${review.updated_at ? new Date(review.updated_at).toLocaleString() : review.created_at ? new Date(review.created_at).toLocaleString() : ""}` : "Nenhuma review"}
        </div>
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="text-sm text-gray-500">Buscando sua review...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : review && !editing ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-700 dark:text-gray-200">{review.review_text ?? review.text ?? review.body ?? <em>Sem texto</em>}</div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-500">Nota: <strong>{review.rating ?? "—"}</strong></div>
              <button
                onClick={() => {
                  setEditing(true);
                  setDraftRating(Math.round(Number(review.rating || 0)));
                  setDraftText(review.text || review.review_text || review.body || "");
                }}
                className="text-xs px-2 py-1 border rounded dark:text-white"
              >
                Editar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea rows={4} maxLength={255} value={draftText} onChange={(e) => setDraftText(e.target.value)} className="w-full p-2 dark:text-white dark:bg-transparent border rounded text-sm" placeholder="Escreva sua review..." />
            {error && <div className="text-sm text-red-500">{error}</div>}
            <div className="flex items-center gap-3">
              <div className="ml-auto flex gap-2">
                <button onClick={() => setEditing(false)} disabled={saving} className="text-xs px-2 py-1 border rounded dark:text-white">Cancelar</button>
                <button onClick={handleSaveReview} disabled={saving} className="text-xs px-3 py-1 bg-indigo-600 text-white rounded">{saving ? "Salvando..." : review ? "Salvar" : "Criar"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
