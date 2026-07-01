import { useEffect } from 'react';
import { initApp } from '../app';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { IdentificationCard } from './IdentificationCard';
import { ChecklistSections } from './ChecklistSections';
import { Termo } from './Termo';
import { Actions } from './Actions';
import { Footer } from './Footer';

// Shell React do checklist. Renderiza o esqueleto (estático) e, após montar,
// aciona initApp(), que gerencia o estado, os itens dinâmicos, o autosave e o
// resumo imperativamente sobre este DOM. A componentização do conteúdo dinâmico
// (seções/itens) é incremental (Sprint 0.4.1); por ora não há estado React.
export function App() {
  useEffect(() => {
    const teardown = initApp();
    return teardown;
  }, []);

  return (
    <div className="wrap">
      <Header />
      <ProgressBar />
      <form id="form">
        <IdentificationCard />
        <ChecklistSections />
        <Termo />
        <Actions />
      </form>
      <div id="summary"></div>
      <Footer />
    </div>
  );
}
