<script lang="ts">
  import Grid from "svelte-grid";
  import gridHelp from "svelte-grid/build/helper/index.mjs";
  import { Svrollbar } from "svrollbar";
  import Editor from "./Components/Editor.svelte";

  const statsRowSpan = 9;
  const editorRowSpan = 9;

  const defaultGridItemMax = {
    w: 1,
    h: 1,
  };  
  const defaultGridItem = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    customDragger: true,
    fixed: false,
    resizable: false,
    draggable: true,
    min: {w: 1, h: 1},
    max: {...defaultGridItemMax},
  };
  let items = [
    // Statistics
    {
      id: 'stats',
      name: 'Statistics',
      component: null,
      rowSpan: statsRowSpan,
      hide: true,
      // the numberic key indicates how to show this item given that the
      // key is a match to the number of available columns given the viewport size
      1: gridHelp.item({
        ...defaultGridItem, 
        ...{
          y: 0, 
          h: 1, // use min for default hidden
          max: {
            ...defaultGridItemMax,
            ...{h: statsRowSpan}
          }
        }
      })
    },
    // Editor
    {
      id: 'editor',
      name: 'Organism Editor',
      rowSpan: editorRowSpan,
      hide: false,
      component: Editor,
      1: gridHelp.item({
        ...defaultGridItem, 
        ...{
          y: 1, 
          h: editorRowSpan, // use span for default NOT hidden
          max: {
            ...defaultGridItemMax,
            ...{h: editorRowSpan}
          }
        }
      })
    },
  ];

  const gridCols = [
    [
      0, // screen size breakpoint, all sizes if zero or omitted
      1 // key of items applicable to grid
    ],
  ]

  const toggle = (item: any) => {
    let i = items.findIndex((obj) => obj.id === item.id);
    let hide: boolean;
    let span: number;
    if (items[i][1].h === 1) {
      hide = false;
      span = items[i].rowSpan;
    } else {
      hide = true;
      span = 1;
    }
    items[i].hide = hide;
    items[i][1].h = span;
    items = gridHelp.adjust(items, 1); // 1 = single-column key
  };

  const onChange = () => {
    // sort by "y" so they don't jump around during toggle
    items.sort((a, b) => { 
      return (a[1].y > b[1].y) 
        ? 1 
        : (
          (b[1].y > a[1].y) 
            ? -1 
            : 0
          )
    });
  };

  let viewport: Element;
  let contents: Element;
</script>

<div id='env-world'>
  <canvas id='env-world-canvas'></canvas>
</div>
<div class='left-panel-wrapper'>
  <div class='left-panel-viewport' bind:this={viewport}>
    <div class='left-panel-contents' bind:this={contents}>
      <Grid 
        gap={[0, 0]} 
        bind:items={items} 
        rowHeight={30}
        let:item
        let:dataItem
        let:movePointerDown
        cols={gridCols}
        on:change={onChange}
      >
        <div class='panel'>
          {#if item.customDragger == true}
            <div class='panel-dragger' on:pointerdown={movePointerDown}>
              <button 
                class='panel-toggle' 
                on:pointerdown={e => e.stopPropagation()}
                on:click={() => toggle(dataItem)}
              >{#if dataItem.hide}&#9650;{:else}&#9660;{/if}</button>
              {dataItem.name}
            </div>
          {/if}
          <div class='panel-contents {dataItem.hide === true ? 'hide' : ''}' >
            {#if dataItem.component !== null}
              <svelte:component this={dataItem.component} />          
            {/if}
          </div>          
        </div>
      </Grid>	
    </div>
  </div>
  <Svrollbar {viewport} {contents} />  
</div>

<style lang="css">
  div {
    box-sizing: border-box;
    padding: 0;
    margin: 0;    
  }
  .left-panel-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    background-color: rgba(0,0,0,0.9);
    box-shadow: 3px 0px 10px -2px rgba(0, 0, 0, 0.9);
  }
  .left-panel-viewport {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: scroll;    
    scrollbar-width: none;    
  }  
  .left-panel-viewport::-webkit-scrollbar {
    display: none;
  }
  .left-panel-contents {
    text-align: center;
    width: 288px;
  }
  .panel {
    background: rgba(128, 128, 128, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.3);;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 30px;
    overflow: hidden;
  }
  .panel-contents {
    display: block;
  }
  .panel-contents.hide {
    display: none;
  }
  .panel-dragger {
    cursor: ns-resize;
    user-select: none;
    color: white;
    line-height: 30px;
    text-align: left;
    text-shadow: 1px 2px 2px rgba(0, 0, 0, 0.5);
    padding-left: 10px;
    background-color: rgba(0, 0, 0, 0.3);
    background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 700 700" width="700" height="700" opacity="0.2"><defs><filter id="nnnoise-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="linearRGB"><feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="4" seed="15" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence"></feTurbulence><feSpecularLighting surfaceScale="1" specularConstant="0.2" specularExponent="20" lighting-color="%23ffffff" x="0%" y="0%" width="100%" height="100%" in="turbulence" result="specularLighting"> <feDistantLight azimuth="3" elevation="69"></feDistantLight> </feSpecularLighting> </filter></defs><rect width="700" height="700" fill="transparent"></rect><rect width="700" height="700" fill="%23ffffff" filter="url(%23nnnoise-filter)"></rect></svg>');
    border-bottom: 1px solid rgba(0, 0, 0, 0.3);;
    width: 100%;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
  }
  button.panel-toggle {
    all: unset;
    cursor: pointer; 
    transform: scale(2,1);
    font-size: 7px;
    vertical-align: middle;
    position: fixed;
    right: 10px;    
  }
</style>