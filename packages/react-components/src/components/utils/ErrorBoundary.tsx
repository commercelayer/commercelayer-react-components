import { Component, type ErrorInfo, type JSX } from 'react';

interface Props {
  children: JSX.Element
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Uncaught error:', error, errorInfo)
    } else {
      throw error
    }
  }

  public render(): JSX.Element {
    if (this.state.hasError) {
      return <h1>Sorry.. there was an error, check the console.</h1>
    }
    return this.props.children
  }
}

export default ErrorBoundary
