import { useState } from 'react';
import { ChecklistProvider } from './store';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { IdentificationCard } from './IdentificationCard';
import { Section1 } from './Section1';
import { Section2 } from './Section2';
import { Section3 } from './Section3';
import { Section4, Section5 } from './DynSection';
import { Section6 } from './Section6';
import { Termo } from './Termo';
import { Actions } from './Actions';
import { Summary } from './Summary';
import { Footer } from './Footer';

// App do checklist, agora componentizado em React. O estado vive no
// ChecklistProvider (acima do Shell), então alternar entre formulário e resumo
// ("Voltar e editar") preserva o preenchimento. O autosave é feito pelo provider.
export function App() {
  return (
    <ChecklistProvider>
      <Shell />
    </ChecklistProvider>
  );
}

function Shell() {
  const [showSummary, setShowSummary] = useState(false);
  return (
    <div className="wrap">
      <Header />
      <ProgressBar />
      {showSummary ? (
        <Summary onEdit={() => setShowSummary(false)} />
      ) : (
        <form id="form">
          <IdentificationCard />
          <Section1 />
          <Section2 />
          <Section3 />
          <Section4 />
          <Section5 />
          <Section6 />
          <Termo />
          <Actions onFinish={() => setShowSummary(true)} />
        </form>
      )}
      <Footer />
    </div>
  );
}
