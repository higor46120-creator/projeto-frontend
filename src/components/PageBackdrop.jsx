/**
 * Fundo decorativo reutilizável: algumas manchas coloridas desfocadas
 * (blobs) atrás do conteúdo, dando um pouco mais de vida às páginas
 * internas sem interferir na leitura ou nas interações.
 *
 * Uso: coloque como primeiro filho de um container com `relative` e,
 * de preferência, `overflow-hidden`.
 */
export function PageBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-purple-300/25 blur-3xl" />
      <div className="absolute top-1/3 -right-28 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-sky-200/20 blur-3xl" />
    </div>
  );
}
