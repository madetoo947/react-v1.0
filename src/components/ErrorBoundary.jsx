import React from 'react'

// Error Boundaries должны быть классовыми компонентами.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  // Этот метод обновляет состояние, чтобы следующий рендер показал запасной UI.
  static getDerivedStateFromError(error) {
    return { hasError: true, error: error }
  }

  // Этот метод можно использовать для логирования ошибок
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary поймал ошибку:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Рендерим запасной UI с сообщением об ошибке
      return (
        <div
          style={{
            padding: '20px',
            border: '1px solid red',
            borderRadius: '8px',
          }}
        >
          <h2>Что-то пошло не так.</h2>
          <pre style={{ color: 'red' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      )
    }

    // Если ошибки нет, рендерим дочерние компоненты как обычно.
    return this.props.children
  }
}
