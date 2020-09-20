<template>
  <div class="container">
    <h1>This the svg Hello page</h1>
    <p>Anle: {{angle}} | module: {{module}}</p>
    <div id="hellosvg-container"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { SVG, Line, Polygon, Svg, G } from "@svgdotjs/svg.js";
import CVector from "../pop/CVector";

const [ox, oy] = [250, -250];

export default Vue.extend({
  data() {
    return {
      angle: "0",
      module: "0",
    };
  },
  mounted() {
    console.log("mounted");
    const draw = SVG().addTo("#hellosvg-container").size(500, 500);
    draw.line(250, 0, 250, 500).stroke({ color: "black" });
    draw.line(0, 250, 500, 250).stroke({ color: "black" });
    const vec = new CVector(draw, [100, 200], {
      ox,
      oy,
      stroke: { width: 2, color: "green" },
    });
    vec.updatePos(50, 50);

    const yVec = new CVector(draw, [0, vec.y], {
      ox,
      oy,
      stroke: { width: 2, color: "red" },
    });
    const xVec = new CVector(draw, [vec.x, 0], {
      ox,
      oy,
      stroke: { width: 2, color: "blue" },
    });

    const moveAction = vec.trackRotation();
    moveAction.start({
      update: (v: { xNow: number; yNow: number }) => {
        yVec.updatePos(0, v.yNow);
        xVec.updatePos(v.xNow, 0);
        this.module = vec.mod.toFixed(2);
        this.angle = vec.rotation.toFixed(2) + "º";
      },
    });

    const moveActionY=yVec.trackAndSnap((arr)=> [yVec.x,arr[1]])
    moveActionY.start({
      update: (v: { xNow: number; yNow: number }) => {
        yVec.updatePos(0, v.yNow);
        vec.updatePos(vec.x, v.yNow);
        this.module = vec.mod.toFixed(2);
        this.angle = vec.rotation.toFixed(2) + "º";
      },
    })

    const moveActionX=xVec.trackAndSnap((arr)=> [arr[0], 0])
    moveActionX.start({
      update: (v: { xNow: number; yNow: number }) => {
        xVec.updatePos(v.xNow, v.yNow);
        vec.updatePos(v.xNow, vec.y);
        this.module = vec.mod.toFixed(2);
        this.angle = vec.rotation.toFixed(2) + "º";
      },
    })
  },
});
</script>

<style lang="scss">
.container {
  color: green;
}
.ball {
  position: absolute;
}
.myLine {
  stroke: green;
  &:hover {
    fill: red;
    stroke: red;
  }
}

.vector-head {
  cursor: pointer;
}
</style>