

export function Footer({ className = "", variant = "static" }) {
  const year = new Date().getFullYear();
  const fixedClass = variant === "fixed" ? "fixed bottom-0 left-0 right-0" : "";

  return (
    <footer
      className={`${fixedClass} bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t dark:border-gray-800 shadow-inner z-40 ${className}`}
      aria-label="Rodapé"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-300">© {year} G4M3</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
