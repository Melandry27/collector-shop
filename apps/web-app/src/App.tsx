import type { AppConfig } from './config';

interface AppProps {
  config: AppConfig;
}

export function App({ config }: AppProps) {
  return (
    <>
      <header>
        <h1>Collector.shop</h1>
        <p>La place de marché des objets de collection entre particuliers.</p>
      </header>
      <main>
        <section aria-labelledby="catalogue-title">
          <h2 id="catalogue-title">Catalogue</h2>
          <p>Le catalogue arrive bientôt.</p>
        </section>
      </main>
      <footer>
        <small>API catalogue : {config.apiCatalogUrl}</small>
      </footer>
    </>
  );
}
