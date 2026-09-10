import { messages } from "@/shared/i18n/pt-BR";

export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary"
    >
      {messages.skipToContent}
    </a>
  );
}
