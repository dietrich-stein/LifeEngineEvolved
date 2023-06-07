<script lang="ts">
  let width: number = 195;
  let height: number = 195;
</script>

<div id='env-editor'>
  <canvas id='env-editor-canvas' width={width} height={height}></canvas>
</div>

<style lang="css">
  #env-editor {
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-crisp-edges;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    height: 195px;
    width: 195px;
    display: block;
  }

  #env-editor-canvas {
    top: 0;
    left: 0;
    position: relative;
    height: 195px;
    width: 195px;    
  }
</style>