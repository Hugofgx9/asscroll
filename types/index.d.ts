export default ASScroll;
/**
* Ash's Smooth Scroll 🍑
*/
declare class ASScroll {
    /**
    * Creates an ASScroll instance
    *
    * @typicalname asscroll
    * @param {object} [parameters]
    * @param {string|HTMLElement} [parameters.containerElement=[asscroll-container]] The selector string for the outer container element, or the element itself
    * @param {string|HTMLElement|NodeList} [parameters.scrollElements=[asscroll]] The selector string for the elements to scroll, or the elements themselves
    * @param {number} [parameters.ease=0.075] The ease amount for the transform lerp
    * @param {number} [parameters.touchEase=1] The ease amount for the transform lerp on touch devices
    * @param {string} [parameters.touchScrollType=none] Set the scrolling method on touch devices. Other options are 'transform' and 'scrollTop'. See the [Touch Devices](#touch-devices) section for more info
    * @param {string} [parameters.scrollbarEl=.asscrollbar] The selector string for the custom scrollbar element
    * @param {string} [parameters.scrollbarHandleEl=.asscrollbar__handle] The selector string for the custom scrollbar handle element
    * @param {boolean} [parameters.customScrollbar=true] Toggle the custom scrollbar
    * @param {boolean} [parameters.scrollbarStyles=true] Include the scrollbar CSS via Javascript
    * @param {boolean} [parameters.disableNativeScrollbar=true] Disable the native browser scrollbar
    * @param {boolean} [parameters.disableRaf=false] Disable internal requestAnimationFrame loop in order to use an external one
    * @param {boolean} [parameters.disableResize=false] Disable internal resize event on the window in order to use an external one
    * @param {boolean} [parameters.limitLerpRate=true] Match lerp speed on >60Hz displays to that of a 60Hz display
    * @param {string} [parameters.blockScrollClass=.asscroll-block] The class to add to elements that should block ASScroll when hovered
    */
    constructor(parameters?: {
        containerElement?: string | HTMLElement;
        scrollElements?: string | HTMLElement | NodeList;
        ease?: number;
        touchEase?: number;
        touchScrollType?: string;
        scrollbarEl?: string;
        scrollbarHandleEl?: string;
        customScrollbar?: boolean;
        scrollbarStyles?: boolean;
        disableNativeScrollbar?: boolean;
        disableRaf?: boolean;
        disableResize?: boolean;
        limitLerpRate?: boolean;
        blockScrollClass?: string;
    });
    events: Events;
    controller: Controller;
    /**
    * Enable ASScroll.
    *
    * @example <caption>Enables ASScroll on the '.page' element and resets the scroll position to 0</caption>
    * asscroll.enable({ newScrollElements: document.querySelector('.page'), reset: true })
    *
    * @example <caption>Enables ASScroll and restores to the previous position before ASScroll.disable() was called</caption>
    * asscroll.enable({ restore: true })
    *
    * @param {object} [parameters]
    * @param {boolean|NodeList|HTMLElement} [parameters.newScrollElements=false] Specify the new element(s) that should be scrolled
    * @param {boolean} [parameters.reset=false] Reset the scroll position to 0
    * @param {boolean} [parameters.restore=false] Restore the scroll position to where it was when disable() was called
    * @param {boolean} [parameters.horizontalScroll=false] Toggle horizontal scrolling
    */
    enable(parameters?: {
        newScrollElements?: boolean | NodeList | HTMLElement;
        reset?: boolean;
        restore?: boolean;
        horizontalScroll?: boolean;
    }): void;
    /**
     * @deprecated since 2.0.0
     * @param {boolean} restore
     * @param {boolean} reset
     * @param {boolean} newTarget
     * @param {boolean} horizontalScroll
     */
     enable(restore?: boolean, reset?: boolean, newTarget?: boolean, horizontalScroll?: boolean): void;
    /**
    * Disable ASScroll.
    *
    * @example <caption>Disables the ability to manually scroll whilst still allowing position updates to be made via asscroll.currentPos, for example</caption>
    * asscroll.disable({ inputOnly: true })
    *
    * @param {object} [parameters]
    * @param {boolean} [parameters.inputOnly=false] Only disable the ability to manually scroll (still allow transforms)
    */
    disable(parameters?: {
        inputOnly?: boolean;
    }): void;
    /**
     * @deprecated since 2.0.0
     * @param {boolean} disableOnly
     */
     disable(disableOnly: boolean): void;
    /**
    * Call the internal animation frame request callback.
    * @function
    */
    update: () => void;
    /**
    * Call the internal resize callback.
    * @function
    * @param {object} [parameters]
    * @param {number} [parameters.width] Window width
    * @param {number} [parameters.height] Window height
    */
    resize: (parameters?: {
        width?: number;
        height?: number;
    }) => void;
    /**
    * Add an event listener.
    *
    * @example <caption>Logs out the scroll position when the 'scroll' event is fired</caption>
    * asscroll.on('scroll', scrollPos => console.log(scrollPos))
    *
    * @example <caption>Returns the target scroll position and current scroll position during the internal update loop</caption>
    * asscroll.on('update', ({ targetPos, currentPos }) => console.log(targetPos, currentPos))
    *
    * @example <caption>Fires when the lerped scroll position has reached the target position</caption>
    * asscroll.on('scrollEnd', scrollPos => console.log(scrollPos))
    *
    * @param {string} eventName Name of the event you wish to listen for
    * @param {function} callback Callback function that should be executed when the event fires
    */
    on(eventName: string, callback: Function): void;
    /**
    * Remove an event listener.
    * @param {string} eventName Name of the event
    * @param {function} callback Callback function
    */
    off(eventName: string, callback: Function): void;
    /**
    * Scroll to a given position on the page.
    * @param {number} targetPos Target scroll position
    * @param {boolean} [emitEvent=true] Whether to emit the external scroll events or not
    */
    scrollTo(targetPos: number, emitEvent?: boolean): void;
    /**
    * Returns the target scroll position.
    *
    * @return {number} Target scroll position
    */
    get targetPos(): number;
    set currentPos(arg: number);
    /**
    * Gets or sets the current scroll position.
    *
    * @example <caption>Sets the scroll position to 200, bypassing any lerps</caption>
    * asscroll.currentPos = 200
    *
    * @param {number} scrollPos The desired scroll position
    * @return {number} Current scroll position
    */
    get currentPos(): number;
    /**
    * Returns the maximum scroll height of the page.
    * @return {number} Maxmium scroll height
    */
    get maxScroll(): number;
    /**
     * Returns the outer element that ASScroll is attached to.
     * @return {HTMLElement} The outer element
     */
    get containerElement(): HTMLElement;
    /**
     * Returns the the element(s) that ASScroll is scrolling.
     * @return {Array} An array of elements ASScroll is scrolling
     */
    get scrollElements(): any[];
    /**
     * Returns whether or not ASScroll is in horizontal scroll mode
     * @return {boolean} The status of horizontal scroll
     */
    get isHorizontal(): boolean;
    /**
     * Returns whether or not ASScroll is actively transforming the page element(s). For example, would return false if running on a touch device and touchScrollType !== 'transform', or if ASScroll was currently disabled via the .disable() method.
     * @return {boolean} The status of actively controlling the page scroll
     */
    get isScrollJacking(): boolean;
    /**
     * @deprecated since 2.0.0 - use targetPos instead
     * @see {@link ASScroll#targetPos}
     */
    get scrollPos(): void;
    /**
     * @deprecated since 2.0.0 - use currentPos instead
     * @see {@link ASScroll#currentPos}
     */
    get smoothScrollPos(): void;
    /**
     * @deprecated since 2.0.0 - use update() instead
     * @see {@link ASScroll#update}
     */
    onRaf(): void;
    /**
     * @deprecated since 2.0.0 - use resize() instead
     * @see {@link ASScroll#resize}
     */
    onResize(): void;
}
import Events from "./Events";
import Controller from "./Controller";
