import Phaser from "phaser";

import CommonSceneNames from './CommonSceneNames.js';

export class RayCastDDA extends Phaser.Scene
{
    edge = 24;

    cellsAmount = 8;

    map;
    constructor()
    {
        super({
            key: CommonSceneNames[2],
            active: false,
            visible: false,
            plugins: [
                'Clock',  //this.time
                //'DataManagerPlugin',  //this.data
                'InputPlugin',  //this.input
                // 'Loader',  //this.load
                //'TweenManager',  //this.tweens
                //'LightsPlugin'  //this.lights
            ],
            cameras:
            {
                // height: 128,
                // width: 30,
                backgroundColor: "#225"
            }
        });
    }

    init()
    {
        console.log('init', this.sys.settings.key);

        // this.events.once('create', () => {

        //     console.log("on create evt", this.sys.settings.key, this.scene.getStatus(this));
        //     // this.scene.sleep(this);

        // });
    }

    // preload()
    // {
    //     console.log('preload', this.sys.settings.key);
    // }

    create()
    {
        console.log('create', this.scene.key);

        {
            const { edge, cellsAmount } = this;

            const visSize = edge * cellsAmount;

            this.dt = this.textures.addDynamicTexture('dt', visSize, visSize).fill(0x343489, 0.7, 0, 0, visSize, visSize);

            const qqq = this.add.grid(0, 0, visSize, visSize, edge, edge, 0x313231, 1, 0, 0).setAltFillStyle(0x545454).setOutlineStyle().setOrigin(0);

            this.add.image(0, 0, 'dt').setOrigin(0).setInteractive().on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.gridClicked, this);

            // const line = new Phaser.Geom.Line(140, 20, 34, 159);

            // const graphics = this.add.graphics().lineStyle(1, 0xffff23, 1).strokeLineShape(line);

            this.prepareThings();

            this.map = this.buildRandomMap();
            this.updateObstacles();
        }

    }

    prepareThings()
    {
        this.line = new Phaser.Geom.Line(140, 20, 34, 159);

        this.graphics = this.add.graphics().lineStyle(1, 0x545423, 1).strokeLineShape(this.line);

        const trh = -8;
        const trHalf = 3;

        this.tr = this.add.triangle(
            200, 200,
            -trHalf, trh,
            trHalf, trh,
            0, 0, 0x888899).setOrigin(0);
    }

    gridClicked(pointer, relX, relY)
    {

        const { x, y } = pointer;

        const { line, tr, graphics, edge } = this;

        // Grid Cell
        const actualCellX = Math.floor(relX / edge);

        const actualCellY = Math.floor(relY / edge);

        const clickedCell = this.map[actualCellY][actualCellX];

        console.log("Cell", actualCellX, actualCellY, clickedCell);

        if (pointer.rightButtonDown())
        {
            line.x2 = x;

            line.y2 = y;
        }

        else if (pointer.leftButtonDown())
        {
            line.x1 = x;

            line.y1 = y;
        }

        const angle = Phaser.Geom.Line.NormalAngle(this.line);

        graphics.clear().strokeLineShape(line);

        tr.setRotation(angle).setPosition(line.x1, line.y1);

    }

    buildRandomMap(cellsAmount = 8, toll = 0.6)
    {
        const map = [];

        const clRow = new Array(cellsAmount).fill(0);

        map.push(clRow);

        for (let i = 2; i < cellsAmount; i++)
        {
            const temp = [0];

            for (let j = 2; j < cellsAmount; j++) {
                temp.push(Math.random() > toll ? 1 : 0);
            }

            temp.push(0);

            map.push(temp);
        }

        map.push(clRow);

        return map;
    }
    updateObstacles()
    {
        let curr;

        let res = "";

        const { map, dt, cellsAmount, edge } = this;

        for (let y = 0; y < cellsAmount; y++)
        {
            for (let x = 0; x < cellsAmount; x++)
            {
                curr = map[y][x];

                res += curr;

                if (curr)
                {
                    dt.fill(0x656565, 1, x * edge, y * edge, edge, edge);
                }
            }

            res += "\n";
        }

        console.log(res, map)
    }
}  // end Scene Class
