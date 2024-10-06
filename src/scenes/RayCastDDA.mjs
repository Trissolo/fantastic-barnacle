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

        this.marker = this.add.rectangle(0, 0, 3, 3, 0xffffff, 1);
    }

    gridClicked(pointer, relX, relY)
    {
        const { line, tr, graphics, edge } = this;

        this.dt.clear()
        this.updateObstacles();


        const { x, y } = pointer;


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

        const angle = Phaser.Geom.Line.NormalAngle(line);

        const test = new Phaser.Math.Vector2(tr).subtract({x:line.x2, y:line.y2})//.normalize();


        // console.log("Angle", angle, new Phaser.Math.Vector2(test).normalize());
        // console.log("NORMXY", Phaser.Geom.Line.NormalX(line), Phaser.Geom.Line.NormalY(line))
        const realAngle = Phaser.Geom.Line.Angle(line);
        const realVec = new Phaser.Math.Vector2().copy(test).setToPolar(realAngle, 1)
        // console.log("Polar", realVec);

        graphics.clear().strokeLineShape(line);

        tr.setRotation(angle).setPosition(line.x1, line.y1);

        // new Phaser.Math.Vector2();
        // lc::vf2d vMouse = { float(GetMouseX()), float(GetMouseY()) };
		// olc::vf2d vMouseCell = vMouse / vCellSize;
		// olc::vi2d vCell = vMouseCell; // 
        

        this.castRay();//new Phaser.Math.Vector2(pointer), new Phaser.Math.Vector2(relX, relY))
    }

    castRay(vMouse, vMouseCell, vCell = vMouseCell)
    {
        const {x1, y1, x2, y2} = this.line;
        
        const startCoords = new Phaser.Math.Vector2(x1, y1);
        const angle = new Phaser.Math.Vector2(this.line.getPointB()).subtract(startCoords).normalize();

        const vRayUnitStepSize = new Phaser.Math.Vector2( Math.abs(1 / angle.x), Math.abs(1 / angle.y));


        // Lodev.org also explains this additional optimistaion (but it's beyond scope of video)
		// olc::vf2d vRayUnitStepSize = { abs(1.0f / vRayDir.x), abs(1.0f / vRayDir.y) };

        const vMapCheck = startCoords.clone();


        const vRayLength1D = new Phaser.Math.Vector2();

		const vStep = new Phaser.Math.Vector2();

        if (angle.x < 0)
            {
                vStep.x = -1;
                vRayLength1D.x = (startCoords.x - vMapCheck.x) * vRayUnitStepSize.x;
            }
            else
            {
                vStep.x = 1;
                vRayLength1D.x = ((vMapCheck.x + 1) - startCoords.x) * vRayUnitStepSize.x;
            }


            if (angle.y < 0)
            {
                vStep.y = -1;
                vRayLength1D.y = (startCoords.y - vMapCheck.y) * vRayUnitStepSize.y;
            }
            else
            {
                vStep.y = 1;
                vRayLength1D.y = (vMapCheck.y + 1 - startCoords.y) * vRayUnitStepSize.y;
            }

            console.log('%cvRayLength1D', "color: yellow; font-style: italic; background-color: blue;", vRayLength1D);

            console.log("vRayUnitStepSize", vRayUnitStepSize)

            //DDA:
            let bTileFound = false;
            let fMaxDistance = 200;
            let fDistance = 0;

            
            
            while (!bTileFound && fDistance < fMaxDistance)
		    {
                // Walk along shortest path
			    if (vRayLength1D.x < vRayLength1D.y)
                {
                    vMapCheck.x += vStep.x;
                    fDistance = vRayLength1D.x;
                    vRayLength1D.x += vRayUnitStepSize.x;
                }
                else
                {
                    vMapCheck.y += vStep.y;
                    fDistance = vRayLength1D.y;
                    vRayLength1D.y += vRayUnitStepSize.y;
                }
    
                // Test tile at new test point
                const visSize = this.edge * this.cellsAmount;
                const vMapSize = {x: visSize, y: visSize};
                
                let scallX = Math.floor(vMapCheck.x / this.edge); //vMapSize.x);
                let scallY = Math.floor(vMapCheck.y / this.edge);//vMapSize.y);
                
                const scall = new Phaser.Math.Vector2(scallX, scallY);

                this.dt.fill(0xadadad, 0.4, scallX * this.edge, scallY * this.edge, this.edge, this.edge);//, 10, vIntersection.x, vIntersection.y, 1, 1);
                console.log("*****vMapCheck", vMapCheck, scall);

                if (vMapCheck.x >= 0 && vMapCheck.x < vMapSize.x && vMapCheck.y >= 0 && vMapCheck.y < vMapSize.y)
                {
                    if (this.map[scallY][scallX] !== 0) ///vecMap[vMapCheck.y * vMapSize.x + vMapCheck.x] == 1)
                    {
                        bTileFound = true;
                    }
                }
            }

            console.log("Found?", bTileFound)

            const vIntersection = new Phaser.Math.Vector2()
            if (bTileFound)
            {
                vIntersection.setFromObject(startCoords).add(angle.scale(fDistance));//.clone(startCoords).scale(fDistance); // + vRayDir * fDistance;
                console.log("Inters draw", vIntersection, startCoords, fDistance);
            }

            if (bTileFound)
            {
                //DrawCircle(vIntersection * vCellSize, 4.0f, olc::YELLOW);
                // this.dt.clear()
                
                this.dt.fill(0xffff00, 1, vIntersection.x, vIntersection.y, 1, 1);
                this.marker.setPosition( vIntersection.x, vIntersection.y);
                console.log('INTERS', vIntersection)
            }
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
                    dt.fill(0x56aa56, 1, x * edge, y * edge, edge, edge);
                }
            }

            res += "\n";
        }

        // console.log(res, map)
    }
}  // end Scene Class
