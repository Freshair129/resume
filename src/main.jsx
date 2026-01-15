import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './LanguageContext';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', backgroundColor: '#fee2e2', color: '#991b1b', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Click for error details</summary>
            <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#991b1b', color: 'white', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
)
