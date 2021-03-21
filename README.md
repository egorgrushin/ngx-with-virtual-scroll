# ngx-with-virtual-scroll

[<img src="https://img.shields.io/badge/npm-1.0.0-brightgreen">](https://www.npmjs.com/package/ngx-with-virtual-scroll) [<img src="https://img.shields.io/badge/minzipped-2.6kb-informational">](https://bundlephobia.com/result?p=ngx-with-virtual-scroll)

The kit to create virtual scrolling lists, tables, grids etc. **Zero styling, non-component**. It allows you to render huge amount of items with high performance by rendering only items within viewport. Other items will be rendered dynamicly   during the scroll. 

Heavily inspired by [react-virtual](https://github.com/tannerlinsley/react-virtual)

## Features

- It doesn't provide any component to wrap your lists, so you can create your own markup and styling
- You can pass any scroll element to be scrolled, even if it's not ancestor of your container (see [examples](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/README.md#examples))
- It can render both static, dynamic and different size elements
- It provides scrollTo and scrollToIndex functions
- It allows you to override scrolling function that is using in previous pt.
- It allows you to render one list to several containers (see examples)
- It can be both horizontal and vertical

## Examples

- The most minimal use case [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/examples/src/app/minimal) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/minimal&file=/src/app/minimal/minimal.component.html)
- Pre and post blocks with any nested level. It can be helpful if your viewport and container are not in direct inheritance [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/examples/src/app/blocks) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/blocks&file=/src/app/blocks/blocks.component.html)
- Using one viewport to render several independent virtual scrolls. It can be very useful if you have kinda a list of sections with items inside, but you need to use shared scroll viewport [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/readme/examples/src/app/one-viewport-several-scrolls) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/one-viewport-several-scrolls&file=/src/app/one-viewport-several-scrolls/one-viewport-several-scrolls.component.html)
- Using one viewport to render multiple columns with the same list. It can be very useful if you are building a table with two columns where first is a main column and second is table columns [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/readme/examples/src/app/multi-columns) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/multi-columns&file=/src/app/multi-columns/multi-columns.component.html)


## Instalation

```bash
npm install ngx-with-virtual-scroll@latest -S
```

## How to use

The package provides two Angular's directives: `with-virtual-scroll` and `measure-size-for`. You need to use either first or both depends on your case (see [examples](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/README.md#examples)). First one `with-virtual-scroll` is the main directive. It accepts `count` and `viewportRef` in order to calculate `virtualItems` you gonna to use in your component. Second. `measure-size-for` is using when you don't want to declare `estimateSize` input, or your items have different or even dynamic sizes.

To start using you need to:

1. Import `NgxWithVirtualScrollModule` to your module

2. In your component's html (it is recommended to create your list component that will wrap and hide virtual scrolling applying) use `with-virtual-scroll` directive (it is recommended to use it on `ng-container`):

   ```html
   <ng-container with-virtual-scroll
                 [count]="rows.length"
                 [estimateSize]="estimateSizeFn"
                 [viewportRef]="verticalViewportRef"
                 #verticalScroll="with-virtual-scroll">
       <div class="viewport" #verticalViewportRef>
           <div [style.height.px]="verticalScroll.totalSize" class="container">
               <div *ngFor="let item of verticalScroll.virtualItems; trackBy: trackByRows()"
                    [style.transform]="'translateY(' + item.start + 'px)'"
                    class="item">
                   {{rows[item.index].name}}
               </div>
           </div>
       </div>
   </ng-container>
   ```

3. In your component's style:

   ```css
   .viewport {
       overflow: auto;
       height: 600px;
   }
   
   .container {
       height: 100%;
       position: relative;
   }
   
   .item {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
   }
   ```

4. In your component's ts:

   ```typescript
   import { VirtualItem } from 'ngx-with-virtual-scroll';
   
   export class ListComponent {
       rows = [...Array(100000)].map((i, index) => ({
           id: index,
           name: `row ${index}`,
           size: 50,
       }));
   
       estimateSizeFn = () => 50;
   
       trackByRows() {
           return (index: number, item: VirtualItem) => this.rows[item.index].id;
       }
   }
   ```

5. That is it. It is up to you to create your own logic of markup and styling. This is just one recommended way to do it. For more cases see [examples](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/README.md#examples).

## API

### with-virtual-scroll

```typescript
export declare class WithVirtualScrollDirective {
    /**
     * @Input() the total count of items to render
     */
    count: number;
    /**
     * @Input() the reference to viewport element ref. Its height / width will be used as items limiter
     */
    viewportRef?: HTMLElement;
    /**
     * @Input() whether horizontal or vertical scrolling is set
     * default: false
     */
    horizontal: boolean;
    /**
     * @Input() count of additional items before and after virtualItems.
     * It is recommended to add at least one bufferLength item, so focus will work
     * default: 0
     */
    bufferLength: number;
    /**
     * @Input() the reference to container element ref. This container should contain visible items,
     * but its height / width must be set using totalSize property.
     * This input is optional if viewportRef contains only containerRef
     */
    containerRef?: HTMLElement;
    /**
     * @Input() this fn is used for calculating size of item during initial measuring.
     * The value it returns will be overridden by [measure-size-for] directive if it is set
     * default () => 50
     */
    estimateSize?: VirtualEstimateSizeFn;
    /**
     * @Input() whether to use first measured size by [measure-size-for] directive as a size for all items.
     * It is useful when all of your items have the same size but you don't want to set it using estimateSize input.
     * default: true
     */
    useFirstMeasuredSize: boolean;
    /**
     * @Input() passing this function allows you to override default scrolling behavior.
     * Default scrolling behavior: setting scrollTop / scrollLeft
     */
    scrollToFn?: VirtualCustomScrollToFn;
    /**
     * this property must be used as height / width setter for containerRef
     */
    totalSize: number;
    /**
     * this property will contain virtual items to render
     */
    virtualItems: VirtualItem[];
    /**
     * current scroll offset
     */
    scrollOffset: number;
    /**
     * current measurements
     */
    measurements: VirtualMeasurement[];
    /**
     * current range in indexes
     */
    range: VirtualBoundaries;
    /**
     * this allows you to scroll to offset. There are align option:
     *  start - offset will be at start of visible viewport area
     *  end - offset will be at end of visible viewport area
     *  center - offset will be at center of visible viewport area
     *  auto - it will try to find closer align for offset.
     *  It will be end if current scroll position is more then offset + viewport size,
     *  otherwise it will be start
     */
    scrollToOffset(offset: number, align?: VirtualScrollToAlign): void;
    /**
     * this allows you to scroll to specified index. There are align option:
     *  start - top of the item will be at the top of visible viewport area
     *  end - bottom of the item will be at the top of visible viewport area
     *  center - center of the item will be at the top of visible viewport area
     *  auto - it will try to find closer align for item.
     *  It will be end if item's end at index position is more then offset + viewport size,
     *  otherwise it will be start
     */
    scrollToIndex(index: number, align?: VirtualScrollToAlign): void;
}
```

### measure-size-for

```typescript
export declare class MeasureSizeForDirective {
    /**
     * virtual item connect to
     */
    item?: VirtualItem;
}
```

