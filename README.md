# ngx-with-virtual-scroll

The kit to create virtual scrolling lists, tables, grids etc. **Zero styling, non-component**. It allows you to render huge amount of items with high performance by rendering only items within viewport. Other items will be rendered dynamicly   during the scroll. 

Heavily inspired by [react-virtual](https://github.com/tannerlinsley/react-virtual)

## Features

- It doesn't provide any component to wrap your lists, so you can create your own markup and styling
- You can pass any scroll element to be scrolled, even if it's not ancestor of your container (see examples)
- It can render both static, dynamic and different size elements
- It provides scrollTo and scrollToIndex functions
- It allows you to override scrolling function that is using in previous pt.
- It allows you to render one list to several containers (see examples)
- It can be both horizontal and vertical

## Examples

- The most minimal use case [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/examples/minimal) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/minimal)

  

