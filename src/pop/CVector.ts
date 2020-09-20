import { Line, Polygon, Svg, G } from '@svgdotjs/svg.js'
import { pointer, listen, ColdSubscription, action } from 'popmotion'

class CVector {
    line: Line;
    arrow: Polygon;
    group: G;
    rotation: number;
    position: [number, number];
    ox: number;
    oy: number;
    x: number;
    y: number;
    mod: number;

    constructor(draw: Svg, arrPos: number[], {
        headSize = 5,
        stroke = { width: 2, color: 'black' },
        ox = 0,
        oy = 0
    }) {
        this.rotation = 0
        this.position = [0, 0] as [number, number]
        [this.ox, this.oy] = [ox, oy]
        const [x, y] = arrPos
        this.group = draw.group()
        this.mod = Math.sqrt(x ** 2 + y ** 2)
        this.line = this.group.line(0, 0, this.mod, 0).stroke(stroke)
        this.arrow = this.group.polygon(`0, ${headSize}, ${headSize * 1.5}, 0, 0, ${-headSize}`)
            .addClass('vector-head')
            .transform({
                origin: { x: x, y: -y },
                translateX: this.mod,
            }).fill(stroke.color)
        this.updatePos(x, y)
        this.moveTo(0, 0)
        this.x = x; this.y = y
    }

    updatePos(x: number, y: number) {
        this.x = x; this.y = y
        const atanX = Math.abs(x)
        this.rotation = Math.atan(y / atanX) / Math.PI * 180
        if (x < 0) this.rotation = 180 - this.rotation;
        this.mod = Math.sqrt(x ** 2 + y ** 2)

        this.line.plot(0, 0, this.mod, 0)
        this.arrow
            .transform({
                origin: { x: 0, y: 0 },
                translateX: this.mod,
            })
        this.moveTo(...this.position)

        return this
    }

    moveTo(x: number, y: number) {
        this.position = [x, y]
        this.group.transform(
            {
                translateX: x + this.ox,
                translateY: -y - this.oy,
                origin: 'left' as any,
                rotate: -this.rotation
            })
        return this
    }

    trackRotation() {
        let pointerTracker: ColdSubscription;
        let pointerXbefore = 0
        let pointerYbefore = 0
        const moveAction = action(({ update }) => {
            //const arrow = styler(this.arrow.node)
            listen(this.arrow.node, 'mousedown touchstart').start((event: Event) => {
                const xInit = 0
                const yInit = 0
                console.log({ xInit, yInit })
                pointerTracker = pointer({
                    x: xInit,
                    y: yInit
                })
                    .start(({ x, y }: { x: number; y: number }) => {
                        const xNow = x + this.x - pointerXbefore
                        const yNow = this.y - (y - pointerYbefore)
                        this.updatePos(xNow, yNow)
                        pointerXbefore = x
                        pointerYbefore = y
                        update({ xNow, yNow, x, y })
                    });

            });

            listen(document, 'mouseup touchend').start(() => {
                if (pointerTracker) {
                    pointerTracker.stop();
                    pointerXbefore = 0
                    pointerYbefore = 0
                }
            });
        })

        return moveAction
    }


    trackAndSnap(fnSnap: (arr: number[]) => number[]) {
        let pointerTracker: ColdSubscription;
        let pointerXbefore = 0
        let pointerYbefore = 0
        const moveAction = action(({ update }) => {
            //const arrow = styler(this.arrow.node)
            listen(this.arrow.node, 'mousedown touchstart').start((event: Event) => {
                const xInit = 0
                const yInit = 0
                console.log({ xInit, yInit })
                pointerTracker = pointer({
                    x: xInit,
                    y: yInit
                })
                    .start(({ x, y }: { x: number; y: number }) => {
                        const xNow = x + this.x - pointerXbefore
                        const yNow = this.y - (y - pointerYbefore)
                        this.updatePos(xNow, yNow)
                        pointerXbefore = x
                        pointerYbefore = y
                        const arr = fnSnap([xNow, yNow])
                        update({ xNow: arr[0], yNow: arr[1], x, y })
                    });

            });

            listen(document, 'mouseup touchend').start(() => {
                if (pointerTracker) {
                    pointerTracker.stop();
                    pointerXbefore = 0
                    pointerYbefore = 0
                }
            });
        })

        return moveAction
    }
}

export default CVector