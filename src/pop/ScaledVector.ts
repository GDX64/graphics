import CVector from "./CVector";
import { Svg } from "@svgdotjs/svg.js";
import {
  scaleCreator,
  CustomScale,
  xyScaleCreator,
  diffScaleCreator,
} from "./Scalegrid";

interface ObjBase {
  ox?: number;
  oy?: number;
}

class ScaledVector {
  fnScale: (args: [number, number]) => number[];
  diffScale: CustomScale;
  childVec: CVector;
  x: number;
  y: number;

  constructor(
    draw: Svg,
    arrPos: number[],
    fnScale: CustomScale,
    objConfig: ObjBase
  ) {
    this.diffScale = diffScaleCreator(fnScale);
    this.fnScale = xyScaleCreator(fnScale);
    [this.x, this.y] = arrPos;

    objConfig.ox = objConfig.ox || 0;
    objConfig.oy = objConfig.oy || 0;
    [objConfig.ox, objConfig.oy] = this.fnScale([objConfig.ox, objConfig.oy]);
    const [x, y] = arrPos.map((item) => this.diffScale(item));

    this.childVec = new CVector(draw, [x, -y], {
      ox: objConfig.ox,
      oy: -250,
    }).updatePos();
  }

  updatePos(x = this.x, y = this.y) {
    debugger;
    return this.childVec.updatePos(...this.fnScale([x, y]));
  }
}

export default ScaledVector;

export {};
