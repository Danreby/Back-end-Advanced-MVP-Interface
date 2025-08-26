import React from "react";

/**
 * MailIcon
 * - Usa `fill="currentColor"` para herdar a cor do CSS (text-*, dark:text-*)
 * - Aceita `size`, `type`, `className` e `color` (se quiser forçar uma cor inline)
 */
const MailIcon = ({ type = 1, size = 18, color, className = "" }) => {
  // se passar color explicitamente, aplicamos via style; senão deixamos currentColor
  const style = color ? { color } : undefined;

  return (
    <>
      {type === 1 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
          role="img"
        >
          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
        </svg>
      )}

      {type === 2 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 16 16"
          fill="currentColor"
          className={className}
          style={style}
          aria-hidden="true"
          role="img"
        >
          <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
        </svg>
      )}
    </>
  );
};

export default MailIcon;
