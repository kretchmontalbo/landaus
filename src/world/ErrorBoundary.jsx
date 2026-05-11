import { Component } from 'react'

// Error boundary specifically for the 3D world layer. If anything inside
// the canvas throws (texture failure, WebGL crash, geometry bug), this
// catches it and renders the children prop (the regular site) instead
// of breaking the whole page.
export default class WorldErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('[3d world] caught error, falling back to classic:', error?.message || error)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}
