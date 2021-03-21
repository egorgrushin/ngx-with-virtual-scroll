# ngx-with-virtual-scroll

[<img src="https://img.shields.io/badge/npm-1.0.0-brightgreen">](https://www.npmjs.com/package/ngx-with-virtual-scroll)
[<img src="https://img.shields.io/badge/minzipped-2.6kb-informational">](https://bundlephobia.com/result?p=ngx-with-virtual-scroll)

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

- The most minimal use case [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/examples/src/app/minimal) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/minimal&file=/src/app/minimal/minimal.component.html)

- Pre and post blocks with any nested level. It can be helpful if your viewport and container are not in direct inheritance [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/master/examples/src/app/blocks) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/blocks&file=/src/app/blocks/blocks.component.html)

- Using one viewport to render several independent virtual scrolls. It can be very useful if you have kinda a list of sections with items inside, but you need to use shared scroll viewport [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/readme/examples/src/app/one-viewport-several-scrolls) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/one-viewport-several-scrolls&file=/src/app/one-viewport-several-scrolls/one-viewport-several-scrolls.component.html)

- Using one viewport to render multiple columns with the same list. It can be very useful if you are building a table with two columns where first is a main column and second is table columns [Source](https://github.com/egorgrushin/ngx-with-virtual-scroll/tree/readme/examples/src/app/multi-columns) | [Live](https://codesandbox.io/s/github/egorgrushin/ngx-with-virtual-scroll/tree/master/examples?initialpath=/multi-columns&file=/src/app/multi-columns/multi-columns.component.html)

  

