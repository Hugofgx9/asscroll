import Store from './Store'
import E from './E'
import Scrollbar from './Scrollbar'
import normalizeWheel from './utils/normalizeWheel'

export default class Scroll {

    constructor( options = {} ) {

        this.options = options
        this.scrollbarCheck = this.options.customScrollbar

        E.bindAll(this, ['onScroll', 'onRAF', 'onResize', 'toggleFixedContainer'])

        this.scrollContainer = document.querySelector( this.options.element )
        const possibleScrollTargets = this.scrollContainer.querySelectorAll( this.options.innerElement )
        this.scrollTargets = possibleScrollTargets.length ? possibleScrollTargets : [this.scrollContainer.firstElementChild]
        this.scrollTargetsLength = this.scrollTargets.length
        this.scrollPos = this.smoothScrollPos = this.prevScrollPos = this.maxScroll = 0
        this.enabled = false
        this.render = false
        this.scrolling = false
        this.syncScroll = false
        this.deltaY = 0
        this.horizontalScroll = false
        this.touchScroll = false
        this.firstResize = true
        this.preventResizeScroll = false
        this.ease = Store.isTouch ? this.options.touchEase : this.options.ease

        this.delta = 1
        this.time = this.startTime = performance.now()

        if( !Store.isTouch || !this.options.disableOnTouch ) {
            if( Store.isTouch ) this.options.customScrollbar = false
            this.smoothSetup()
        } else {
            this.touchScroll = true
            document.documentElement.classList.add('asscroll-touch')
            this.options.customScrollbar = false
            E.on('scroll', this.scrollContainer, e => { E.emit(Store.eventNames.SCROLL, { event: e }) }, { passive: true })
        }

        // enable smooth scroll if mouse is detected
        E.on(Store.eventNames.TOUCHMOUSE, () => {
            if (!this.options.disableOnTouch) return
            this.touchScroll = false
            this.options.customScrollbar = this.scrollbarCheck
            this.smoothSetup()
            this.onResize()
        })

        E.on('mouseleave', document, () => {
            window.scrollTo(0, -this.scrollPos)
        })

        E.on('keydown', window, e => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === 'Home' || e.key === 'End' || e.key === 'Tab') {
                window.scrollTo(0, -this.scrollPos)
            }
            if( e.key === 'Tab' ) {
                this.toggleFixedContainer()
            }
        })

        E.delegate('click', 'a[href^="#"]', this.toggleFixedContainer)
        E.delegate('wheel', this.options.blockScrollClass, this.blockScrollEvent)

    }

    smoothSetup() {

        Object.assign(this.scrollContainer.style, {
            position: 'fixed',
            top: '0px',
            left: '0px',
            width: '100%',
            height: '100%',
            contain: 'content'
        })

        if( this.options.customScrollbar ) {
            this.scrollbar = new Scrollbar(this)
        }

        E.on(Store.eventNames.RAF, this.onRAF)
        E.on(Store.eventNames.RESIZE, this.onResize)

    }

    onScroll({ event }) {

        if( !this.scrolling ) {
            this.options.customScrollbar && this.scrollbar.show()
            this.toggleIframes()
            this.scrolling = true
        }

        if( !Store.isTouch && event.type === Store.Events.wheelEvent ) {

            event.preventDefault()

            this.deltaY = normalizeWheel(event).pixelY
            this.syncScroll = true
            this.scrollPos += this.deltaY * -1
            this.clamp()
            E.emit(Store.eventNames.COMBOSCROLL, this.scrollPos)
            
            return

        } else {

            if (this.preventResizeScroll) {
                this.preventResizeScroll = false
                return
            }

            if (this.touchScroll) {
                this.scrollPos = this.horizontalScroll ? -this.scrollContainer.scrollLeft : -this.scrollContainer.scrollTop
            } else {
                this.scrollPos = -window.scrollY
            }
            
            if( Store.isTouch && this.options.disableOnTouch ) {
                this.smoothScrollPos = this.scrollPos
            }

            this.clamp()
            E.emit(Store.eventNames.COMBOSCROLL, this.scrollPos)
        }

    }

    onRAF() {

        if( !this.render ) return

        if (this.options.limitLerpRate) {
            this.time = performance.now() * 0.001
            this.delta = Math.min((this.time - this.startTime) * 60, 1)
            this.startTime = this.time
        }

        if( Math.abs( this.scrollPos - this.smoothScrollPos ) < 0.5 ) {
            this.smoothScrollPos = this.scrollPos
            if( this.syncScroll ) {
                this.syncScroll = false
                window.scrollTo(0, -this.scrollPos)
                E.emit(Store.eventNames.SCROLLEND, this.scrollPos)
            }
            if( this.scrolling ) {
                this.scrolling = false
                this.options.customScrollbar && this.scrollbar.hide()
                this.toggleIframes(true)
            }
        } else {
            this.smoothScrollPos += (this.scrollPos - this.smoothScrollPos) * this.ease * this.delta
        }

        const x = this.horizontalScroll ? this.smoothScrollPos : 0
        const y = this.horizontalScroll ? 0 : this.smoothScrollPos
        this.applyTransform(x, y)

        this.options.customScrollbar && this.scrollbar.transform()

        E.emit(Store.eventNames.EXTERNALRAF, { scrollPos: this.scrollPos, smoothScrollPos: this.smoothScrollPos })

    }

    applyTransform(x, y) {
        for (let i = 0; i < this.scrollTargetsLength; i++) {
            this.scrollTargets[i].style.transform = `translate3d(${ x }px, ${ y }px, 0px)`
        }
    }

    enable( restore = false, reset = false, newTargets = false, horizontalScroll = false ) {

        if( this.enabled ) return
        this.enabled = true

        this.render = true

        this.horizontalScroll = horizontalScroll

        if (newTargets) {
            this.scrollTargets = newTargets.length ? newTargets : [newTargets]
            this.scrollTargetsLength = this.scrollTargets.length
        }
        
        this.iframes = this.scrollContainer.querySelectorAll('iframe')

        if( Store.isTouch && this.options.disableOnTouch ) {
            Store.body.style.removeProperty('height')
            if( reset ) {
                this.scrollPos = this.smoothScrollPos = 0
                this.scrollTo(0, false)
            }
        } else {
            this.firstResize = true
            if( reset ) {
                this.scrollPos = this.smoothScrollPos = 0
                this.applyTransform(0, 0)
            }
            this.onResize()
        }

        if( restore ) {
            this.scrollTo(this.prevScrollPos, false)
        }
        
        E.on(Store.eventNames.WHEEL, this.onScroll)
        E.on(Store.eventNames.SCROLL, this.onScroll)

    }

    disable( inputOnly = false ) {

        if( !this.enabled ) return
        this.enabled = false

        if( !inputOnly ) {
            this.render = false
        }

        E.off(Store.eventNames.WHEEL, this.onScroll)
        E.off(Store.eventNames.SCROLL, this.onScroll)

        this.prevScrollPos = this.scrollPos
        Store.body.style.height = '0px'

    }

    clamp() {
        this.scrollPos = Math.max(Math.min(this.scrollPos, 0), this.maxScroll)
    }

    scrollTo( y, emitEvent = true ) {
        this.scrollPos = y
        if( Store.isTouch && this.options.disableOnTouch ) {
            if (this.horizontalScroll) {
                this.scrollContainer.scrollTo(-this.scrollPos, 0)
            } else {
                this.scrollContainer.scrollTo(0, -this.scrollPos)
            }
        }
        this.clamp()
        this.syncScroll = true
        if (emitEvent) E.emit(Store.eventNames.COMBOSCROLL, this.scrollPos)
    }

    onResize() {
        if (this.scrollTargetsLength > 1) {
            const lastTarget = this.scrollTargets[this.scrollTargetsLength - 1]
            const compStyle = window.getComputedStyle(lastTarget)
            const marginOffset = parseFloat(this.horizontalScroll ? compStyle.marginRight : compStyle.marginBottom)
            const bcr = lastTarget.getBoundingClientRect()
            const endPosition = this.horizontalScroll ? bcr.right : bcr.bottom
            this.scrollLength = endPosition + marginOffset - this.smoothScrollPos
        } else {
            this.scrollLength = this.horizontalScroll ? this.scrollTargets[0].scrollWidth : this.scrollTargets[0].scrollHeight
        }
        
        const windowSize = this.horizontalScroll ? Store.windowSize.w : Store.windowSize.h
        this.maxScroll = this.scrollLength > windowSize ? -(this.scrollLength - windowSize) : 0
        if (!this.firstResize) {
            this.preventResizeScroll = true
        }
        Store.body.style.height = this.scrollLength + 'px'
        this.options.customScrollbar && this.scrollbar.onResize()
        this.firstResize = false
    }

    toggleIframes(enable) {
        for (let i = 0; i < this.iframes.length; i++) {
            this.iframes[i].style.pointerEvents = enable ? 'auto' : 'none'
        }
    }

    blockScrollEvent(e) {
        e.stopPropagation()
    }

    toggleFixedContainer() {
        this.scrollContainer.style.position = 'static'
        const scrollPos = this.smoothScrollPos
        this.applyTransform(0, 0)
        requestAnimationFrame(() => {
            this.scrollContainer.style.position = 'fixed'
            const x = this.horizontalScroll ? scrollPos : 0
            const y = this.horizontalScroll ? 0 : scrollPos
            this.applyTransform(x, y)
        })
    }

}