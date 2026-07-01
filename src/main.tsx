// Ponto de entrada do app: importa os estilos e monta o shell React no #root.
import './styles.css';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
