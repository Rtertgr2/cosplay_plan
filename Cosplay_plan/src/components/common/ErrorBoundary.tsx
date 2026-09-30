import { Component, type ErrorInfo, type ReactNode } from 'react'
import PageState from './PageState'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/** Fallback แยกออกมาให้ทดสอบได้โดยตรง (SSR ไม่ catch render error) */
export function ErrorFallback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <PageState status="error" message={message} onRetry={onRetry} />
}

/**
 * ErrorBoundary (T5) — กันหน้าขาว
 * ก่อน T5 ถ้า component ใดพังตอน render ผู้ใช้เจอหน้าขาวเงียบ ๆ ไม่มีทางออก
 * ครอบทั้งแอปใน App.tsx (หลัง providers) · error จริงถูก log ลง console
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary จับ render error:', error, info.componentStack)
  }

  handleRetry = () => {
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback message={this.state.error.message} onRetry={this.handleRetry} />
      )
    }
    return this.props.children
  }
}
