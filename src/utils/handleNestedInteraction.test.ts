// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { handleNestedInteraction } from './handleNestedInteraction'

describe('handleNestedInteraction', () => {
  beforeEach(() => {
    globalThis.document = window.document
    globalThis.Node = window.Node
    globalThis.HTMLElement = window.HTMLElement
    globalThis.SVGElement = window.SVGElement
  })

  const createMockEvent = (overrides = {}) => ({
    target: document.createElement('div'),
    currentTarget: document.createElement('div'),
    ...overrides,
  })

  it('should call callback for valid nested interaction', () => {
    const callback = vi.fn()
    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.appendChild(child)

    const event = createMockEvent({
      target: child,
      currentTarget: parent,
    })

    handleNestedInteraction(event as any, callback)

    expect(callback).toHaveBeenCalled()
  })

  it('should not call callback when target is currentTarget', () => {
    const callback = vi.fn()
    const element = document.createElement('div')

    const event = createMockEvent({
      target: element,
      currentTarget: element,
    })

    handleNestedInteraction(event as any, callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback for button elements', () => {
    const callback = vi.fn()
    const parent = document.createElement('div')
    const button = document.createElement('button')
    parent.appendChild(button)

    const event = createMockEvent({
      target: button,
      currentTarget: parent,
    })

    handleNestedInteraction(event as any, callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback for link elements', () => {
    const callback = vi.fn()
    const parent = document.createElement('div')
    const link = document.createElement('a')
    parent.appendChild(link)

    const event = createMockEvent({
      target: link,
      currentTarget: parent,
    })

    handleNestedInteraction(event as any, callback)

    expect(callback).not.toHaveBeenCalled()
  })

  it('should not call callback for SVG elements', () => {
    const callback = vi.fn()
    const parent = document.createElement('div')
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    parent.appendChild(svg)

    const event = createMockEvent({
      target: svg,
      currentTarget: parent,
    })

    handleNestedInteraction(event as any, callback)

    expect(callback).not.toHaveBeenCalled()
  })
})
