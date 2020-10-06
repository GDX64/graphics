import { Line, Polygon, Svg, G, Polyline, Text } from "@svgdotjs/svg.js";
import {
  pointer,
  listen,
  styler,
  ColdSubscription,
  calc,
  action,
} from "popmotion";

interface CustomScale {
  arrDomain: number[];
  arrImage: number[];
  (arg: number): number;
}

function scaleCreator(arrDomain: number[], arrImage: number[]) {
  const size1 = arrDomain[1] - arrDomain[0];
  const size2 = arrImage[1] - arrImage[0];
  const fnScale = (arg: number) => {
    return (size2 / size1) * (arg - arrDomain[0]) + arrImage[0];
  };
  fnScale.arrDomain = arrDomain;
  fnScale.arrImage = arrImage;
  return fnScale as CustomScale;
}

function diffScaleCreator(fnScale: CustomScale) {
  const deltaX = fnScale.arrDomain[1] - fnScale.arrDomain[0];
  const deltaY = fnScale.arrImage[1] - fnScale.arrImage[0];

  return scaleCreator([0, deltaX], [0, deltaY]);
}

//migration
function xyScaleCreator(fnBaseScale: CustomScale) {
  const fnScaleX = fnBaseScale;
  const fnScaleY = scaleCreator(fnBaseScale.arrDomain, [
    fnBaseScale.arrImage[1],
    fnBaseScale.arrImage[0],
  ]);
  return (arg: [number, number]) => {
    const x = fnScaleX(arg[0]);
    const y = fnScaleY(arg[1]);
    return [x, y];
  };
}

type Pixel = number;

function zip<T>(arr1: Array<T>, arr2: Array<T>) {
  if (arr1.length !== arr2.length) {
    throw { msg: "Sizes mismatch" };
  }
  return arr1.map((element, i) => [element, arr2[i]]);
}

function range(initial: number, final: number, N: number) {
  const fnScale = scaleCreator([0, N - 1], [initial, final]);
  return [...Array(N).keys()].map((el) => fnScale(el));
}

class ScaleGrid {
  origin: { x: number; y: number };
  size: number[];
  center: number[];
  fnScaleX: Function;
  fnScaleY: Function;
  polyline: Polyline;
  xData: number[];
  yData: number[];
  scale: number[];
  nTicks: number;
  arrTicksLines: Line[];
  arrTicksText: Text[];
  constructor(
    public draw: Svg,
    { scale = [-5, 5], stroke = { width: 2, color: "black" } }
  ) {
    const scaleRatio = scale[1] / (scale[1] - scale[0]);
    const origin = { x: 1 - scaleRatio, y: scaleRatio };
    const size = [draw.cx() * 2, draw.cy() * 2];
    const center = [
      Math.floor(size[0] * origin.x),
      Math.floor(size[1] * origin.y),
    ];

    const xAxis = draw.line(0, center[1], size[0], center[1]).stroke(stroke);
    const yAxis = draw.line(center[0], 0, center[0], size[1]).stroke(stroke);

    const xPositiveSize = size[0] - center[0];
    const yPositiveSize = size[1] - center[1];
    //const tickSize = xPos
    const fnScaleX = scaleCreator(scale, [0, size[0]]);
    const fnScaleY = scaleCreator(scale, [size[0], 0]);

    this.center = center;
    this.origin = origin;
    this.size = size;
    this.fnScaleX = fnScaleX;
    this.fnScaleY = fnScaleY;
    this.polyline = draw.polyline().fill("#00000000");
    this.xData = [];
    this.yData = [];
    this.scale = scale;
    this.draw = draw;
    this.nTicks = 0;
    this.arrTicksLines = [];
    this.arrTicksText = [];
  }

  plot(
    arrX: number[],
    arrY: number[],
    stroke = {
      width: 2,
      color: "#7777ff",
    }
  ) {
    const args = this._mapData(arrX, arrY);
    this.polyline.plot(args as any).stroke(stroke);
    return this;
  }

  _mapData(arrX: number[], arrY: number[]) {
    this.xData = arrX.map((el) => this.fnScaleX(el));
    this.yData = arrY.map((el) => this.fnScaleY(el));
    const args = zip(this.xData, this.yData);
    return args;
  }

  animatePlot(arrX: number[], arrY: number[]) {
    const args2 = this._mapData(arrX, arrY);
    this.polyline.animate().plot(args2);
  }

  ticksLoop(
    scale: number[],
    nTicks: number,
    fnTicks: (i: number, nPosition: Pixel) => void
  ) {
    const nRange = Math.abs(scale[1] - scale[0]);
    for (let i = 0; i < nRange * nTicks; i++) {
      const nPosition = i / nTicks + scale[0];
      fnTicks(i, nPosition);
    }
  }

  drawTicks({
    nTicks = 1,
    tickSize = 5,
    stroke = { width: 2, color: "black" },
  }) {
    this.nTicks = nTicks;
    this.arrTicksLines = [];

    this.ticksLoop(this.scale, nTicks, (i, nPosition) => {
      const linePosX = this.fnScaleX(nPosition) as Pixel;
      const linePosY = this.fnScaleY(nPosition) as Pixel;

      const lineX = this.draw
        .line(
          linePosX,
          this.center[1] + tickSize,
          linePosX,
          this.center[1] - tickSize
        )
        .stroke(stroke);

      const lineY = this.draw
        .line(
          this.center[0] + tickSize,
          linePosX,
          this.center[0] - tickSize,
          linePosX
        )
        .stroke(stroke);

      this.arrTicksLines.push(lineX, lineY);
    });
  }

  drawTicksText() {
    this.arrTicksText = [];
    this.ticksLoop(this.scale, this.nTicks, (i, nPosition) => {
      const linePosX = this.fnScaleX(nPosition) as Pixel;
      const linePosY = this.fnScaleY(nPosition) as Pixel;
      this.arrTicksText.push(
        this.draw.text(String(nPosition)).move(linePosX, this.center[1] + 10)
      );
      if (nPosition !== 0) {
        this.arrTicksText.push(
          this.draw.text(String(nPosition)).move(this.center[0] + 10, linePosY)
        );
      }
    });
  }

  clearTicks() {
    [...this.arrTicksText, ...this.arrTicksLines].forEach((objSvg) =>
      objSvg.remove()
    );
  }
}

export default ScaleGrid;
export {
  zip,
  scaleCreator,
  range,
  diffScaleCreator,
  xyScaleCreator,
  CustomScale,
};
