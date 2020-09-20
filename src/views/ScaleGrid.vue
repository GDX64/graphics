<template>
  <div class="container">
      <h1 class="title">Scale grid</h1>
      <button class="animate" @click="animeNow">animate</button>
      <div id="svg-container">
      </div>
  </div>
</template>

<script>
import {SVG} from '@svgdotjs/svg.js'
import ScaleGrid, {range} from '../pop/Scalegrid'

const N=500
const sin=Math.sin

export default {
    data(){
        return{
            sg: {}
        }
    },
    mounted(){
        const nDrawSize=300
        const draw=SVG().addTo('#svg-container').size(nDrawSize,nDrawSize)
        window.draw=draw
        const sg=new ScaleGrid(draw, {nTicks: 1,
        scale: [-3, 3]})
        const x=range(-5, 5, N)
        sg.plot(x, x)

        this.sg=sg
    },
    methods:{
        animeNow(){
            const x=range(-5, 5, N)
            const f1=Math.random()*3
            const f2=Math.random()*10
            this.sg.animatePlot(x, x.map(el=>sin(el*f1)+sin(el*f2)+sin(el)))
        }
    }

}
</script>

<style lang="scss">

</style>