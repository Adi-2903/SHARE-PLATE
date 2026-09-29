import { Component } from 'react'

/**
 * Global Error Boundary — catches any unhandled render/lifecycle errors
 * and displays a readable recovery UI instead of a blank/black screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[SharePlate] Uncaught render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #faf8ff, #f5fbf7)',
            fontFamily: "'Inter', sans-serif",
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(186,26,26,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: '#ba1a1a', fontSize: 32 }}
            >
              error
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#131b2e',
              marginBottom: '0.5rem',
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: '#6d7a72', fontSize: '0.9rem', maxWidth: 400, marginBottom: '2rem' }}>
            An unexpected error occurred. Your data is safe — please reload to
            continue.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: '0.75rem',
                color: '#ba1a1a',
                background: 'rgba(255,218,214,0.4)',
                border: '1px solid rgba(186,26,26,0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
                maxWidth: 480,
                overflow: 'auto',
                textAlign: 'left',
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.href = '/'
            }}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #006948, #00855d)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Return to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
