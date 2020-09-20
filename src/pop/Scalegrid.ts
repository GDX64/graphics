import { Line, Polygon, Svg, G, Polyline } from '@svgdotjs/svg.js'
import { pointer, listen, styler, ColdSubscription, calc, action } from 'popmotion'

function scaleCreator(s1: number[], s2: number[]) {
    const size1 = (s1[1] - s1[0])
    const size2 = (s2[1] - s2[0])
    return (arg: number) => {
        return size2 / size1 * (arg - s1[0]) + s2[0]
    }
}

type Pixel = number

function zip<T>(arr1: Array<T>, arr2: Array<T>) {
    if (arr1.length !== arr2.length) {
        throw { msg: 'Sizes mismatch' }
    }
    return arr1.map((element, i) => [element, arr2[i]])
}

function range(initial: number, final: number, N: number) {
    const fnScale = scaleCreator([0, N - 1], [initial, final])
    return [...Array(N).keys()].map(el => fnScale(el))
}

class ScaleGrid {
    origin: { x: number; y: number };
    size: number[];
    center: number[];
    fnScaleX: Function;
    fnScaleY: Function;
    polyline: Polyline
    xData: number[];
    yData: number[];
    scale: number[];
    draw: Svg
    constructor(draw: Svg, { scale = [-5, 5], nTicks = 1,
        stroke = { width: 2, color: 'black' },
        tickSize = 5
    }) {
        const scaleRatio = scale[1] / (scale[1] - scale[0])
        const origin = { x: scaleRatio, y: scaleRatio }
        const size = [draw.cx() * 2, draw.cy() * 2]
        const center = [Math.floor(size[0] * origin.x), Math.floor(size[1] * origin.y)]

        const xAxis = draw.line(0, center[1], size[0], center[1]).stroke(stroke)
        const yAxis = draw.line(center[0], 0, center[0], size[1]).stroke(stroke)

        const xPositiveSize = size[0] - center[0]
        const yPositiveSize = size[1] - center[1]
        //const tickSize = xPos
        const fnScaleX = scaleCreator(scale, [0, size[0]])
        const fnScaleY = scaleCreator(scale, [size[0], 0])

        this.center = center
        this.origin = origin
        this.size = size
        this.fnScaleX = fnScaleX
        this.fnScaleY = fnScaleY
        this.polyline = draw.polyline().fill('#00000000')
        this.xData = []
        this.yData = []
        this.scale = scale
        this.draw = draw

        this.ticksLoop(scale, nTicks, (i, nPosition) => {
            const linePosX = this.fnScaleX(nPosition) as Pixel
            const linePosY = this.fnScaleY(nPosition) as Pixel
            this.draw.line(linePosX, this.center[1] + tickSize, linePosX, this.center[1] - tickSize).stroke(stroke)
            this.draw.line(this.center[0] + tickSize, linePosX, this.center[0] - tickSize, linePosX).stroke(stroke)
            this.draw.text(String(nPosition)).move(linePosX, this.center[1] + 10)
            if (nPosition !== 0) {
                this.draw.text(String(nPosition)).move(this.center[0] + 10, linePosY)
            }
        })
    }

    plot(arrX: number[], arrY: number[],
        stroke = {
            width: 2, color: '#7777ff'
        }) {
        const args = this._mapData(arrX, arrY)
        this.polyline.plot(args as any).stroke(stroke)
        return this
    }

    _mapData(arrX: number[], arrY: number[]) {
        this.xData = arrX.map(el => this.fnScaleX(el))
        this.yData = arrY.map(el => this.fnScaleY(el))
        const args = zip(this.xData, this.yData)
        return args
    }

    animatePlot(arrX: number[], arrY: number[]) {
        const args2 = this._mapData(arrX, arrY)
        this.polyline
            .animate()
            .plot(args2)
    }

    ticksLoop(scale: number[], nTicks: number, fnTicks: (i: number, nPosition: Pixel) => void) {
        const nRange = Math.abs(scale[1] - scale[0])
        for (let i = 0; i < nRange * nTicks; i++) {
            const nPosition = i / nTicks + scale[0]
            fnTicks(i, nPosition)
        }
    }
}

export default ScaleGrid
export {
    zip,
    scaleCreator,
    range
}