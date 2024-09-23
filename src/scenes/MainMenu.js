import { Scene } from 'phaser';

import CommonSceneNames from './CommonSceneNames';

export class MainMenu extends Scene
{
    edge = 32;
    gap = 6;
    allowed = 26; // that is: edge - gap // 32 - 6

    percent = this.allowed / this.edge;

    constructor ()
    {
        super('MainMenu');
    }
      
      create ()
      {
        console.log("Starting:", this.scene.key);
        // console.log("Font", this.cache.bitmapFont.get('bitsy').data.lineHeight);
        // console.log("Font", this.cache.bitmapFont.get('bitsy'));

        // add new frame
        this.textures.get('bitsy').add("whitePixel", 0, 1, 0, 1, 1);

        // const testTexture = this.textures.get('bitsy');

        // testTexture.add("whitePixel", 0, 1, 0, 1, 1);

        // console.log(testTexture);

        this.rect = this.add.image(6, -990, 'bitsy', 'whitePixel').setOrigin(0).setScale(60, 9).setVisible(false);

        const refText = this.add.bitmapText(8, 10, 'bitsy', CommonSceneNames)
        .setOrigin(0)
        .setTintFill(0x454589)
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.clickedText, this)
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, this.onMove, this)
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => this.rect.setVisible(true))
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.rect.setVisible(false));
        
        refText.input.hitArea.height -= 1;

        // console.log('HitArea', refText.input.hitArea.height, this.textures);
        // this.input.once('pointerdown', () => {

        //     this.scene.start('Game');

        // });
        
        // test block
        {
          // this.input.setPollAlways();
          // const ht = this.input.hitTestPointer(this.input.activePointer);
          // const {worldX:px, worldY:py} = this.input.activePointer
          // console.log("HT!:", refText.input.hitArea, px, py);
          // const manualCheck = Phaser.Geom.Rectangle.Contains(refText.input.hitArea, px, py)
          // console.log("INPUT", manualCheck, this.input);
          const {x: px, y: py} = this.input.activePointer;

          const fakeHitTest = Phaser.Geom.Rectangle.Contains({type: 5, x: refText.x, y: refText.y, width: 48, height: 15}, px, py);

          // console.log("Hit", fakeHitTest);

          if (fakeHitTest)
          {
            this.rect.setPosition(this.rect.x,   Phaser.Math.Snap.Floor(py, 8, refText.y) - 1)
                      .setVisible(true);

            // this.rect.y = Phaser.Math.Snap.Floor(py, 8, refText.y) - 1;
            
            // this.rect.setVisible(true);
          }
        }
        //end block
    }
    onMove(pointer, x, y)
    {
      const gag = Phaser.Math.Snap.Floor(y, 8, 0);

      this.rect.y = gag + 9;
    }

    clickedText(pointer, x, y, stopPropagation)
    {
        console.log(`Clicked at: x: ${x}, y: ${y}`, stopPropagation);

        // const fontHeight = this.cache.bitmapFont.get('bitsy').data.lineHeight;

        const index = Math.max(0, Math.floor(y / 8));

        // pointer.camera.scene.scene.start(CommonSceneNames[index]);

        this.scene.start(CommonSceneNames[index]);
    }

    // update(time, delta)
    // {
    //   console.log(this.input_pollTimer);
    // }



     // console.log(this.zone.input.hitArea)
    
    //this.rect = this.add.rectangle(this.grid.x, this.grid.y, this.allowed, this.allowed, 0x89db23).setOrigin(0).setVisible();
/*
    //this.gridIsOvered = false
    this.area = this.grid.input.hitArea; //new Phaser.Geom.Rectangle(this.grid.x, this.grid.y, this.grid.width - 1 , this.grid.height - 1)

    this.area.width-= 1;
    this.area.height-= 1;
    
    console.log(this.grid.input.hitArea, this.grid.x, this.grid.y, this.area)
    
    
    //this.timedEvent = this.time.addEvent({ delay: 50, callback: this.checkArea, callbackScope: this, loop: true });

    this.text = this.add.text(8, 8, "-").setScrollFactor(0)
    
    this.cameras.main.setScroll(-33, -11)
  }
  
  gag(pointer,px, py)
  {
    //log(pointer, this)
    const {worldX, worldY} = pointer;
    
    const snappedX = Snap(worldX, edge, this.x, false);
    const snappedY = Snap(worldY, edge, this.y, false);
    
    const pointerXrelCell = px % edge;
    const pointerYrelCell = py % edge;
    
    this.scene.text.setText([`edge: ${edge}\nallowed: ${allowed}\ngap: ${edge-allowed}`, `cell x: ${(snappedX - this.x) / edge}; cell y: ${Math.floor(py/edge)}`, `relPos/rows: ${pointerXrelCell}`,`relPos/cols: ${pointerYrelCell}`])
    
    if (pointerXrelCell <= allowed && pointerYrelCell <= allowed)
    {
    	this.scene.rect.x = snappedX;
      	this.scene.rect.y = snappedY;
    	this.scene.rect.setVisible(true);
      	this.scene.text.text += `\n${Math.floor(py/edge)*cellsInRow + Math.floor(px/edge)}`
      
    }
    
  
     
    
  }

  checkArea()
  {
    const {worldX, worldY} = this.input.activePointer
    if (this.area.contains(worldX, worldY))
    {
      const {x: areaX, y: areaY} = this.area
      const snappedX = Snap(worldX, edge, areaX, false)
      const snappedY = Snap(worldY, edge, areaY, false)
      this.scene.rect.x = snappedX
      this.rect.y = snappedY
      this.rect.setVisible(true)

      this.text.setText([`snappedX: ${snappedX}\nsnappedY: ${snappedY}`, `cell x: ${(snappedX - areaX) / edge}; cell y: ${(snappedY -areaY) / edge}`, `areaX: ${areaX}; areaY: ${areaY}`])
      //log(Snap(worldX, edge, this.area.x, true), Snap(worldY, edge, this.area.y, true))
    }
    else if (this.rect.visible)
    {
      this.rect.setVisible()
    }
  }//end checkArea
*/
  
  determineCell(pointer, relX, relY, d)
  {
    const {cellsInRow, edge, gap, allowed} = this.scene;
    
    const normalizedCellX = relX % edge;
    const normalizedCellY = relY % edge;
    
    //  Allow interaction if click coordinates are within the cell area - ...no effect if a gap was clicked.
    if (normalizedCellX <= allowed && normalizedCellY <= allowed)
    {
      const gridX = Math.floor(relX / edge);
      const gridY = Math.floor(relY / edge);

      const cell = gridX + gridY * cellsInRow;

      console.log(`Cell# %c${cell}`, "color: #a4a;");
      console.log(`Grid X: ${gridX}\nGrid Y: ${gridY}\n--------`);
    }
  }
  
  //determine cell without Remainder
    withoutRemainder(pointer, relX, relY, d)
    {
        const {cellsInRow, edge, percent} = this.scene;

            //testing:
            //rx = 26.1;
            //ry = 26.1;
            //

            const rx = relX / edge;
            const ry = relY / edge;

            const gridX = Math.floor(rx);
            const gridY = Math.floor(ry);
            
            log("---TEST---");
            console.log(`relX: ${relX}\nrelY: ${relY}`);

        //  Allow interaction if click coordinates are within the cell area - ...no effect if a gap was clicked.
        if (rx - gridX <= percent && ry - gridY <= percent)
        {
            const cell = gridX + gridY * cellsInRow;

            console.log(`%cCell %c ${cell} `, "background-color: #337;", "color: #dd7;background-color: #557;");
        }
    }
  
    onClick(pointer, relX, relY, d)
    {
        //quick bail (when using 'ary')
        if (ary.length === 0) {return}

        const {cellsInRow, cellsInCol, edge, gap, allowed} = this.scene;

        const normalizedCellX = relX % edge;
        const normalizedCellY = relY % edge;

        // console.log(relX, relY, normalizedCellX, normalizedCellY);

        if (normalizedCellX <= allowed && normalizedCellY <= allowed)
        {
            const gridX = Math.floor(relX / edge);
            const gridY = Math.floor(relY / edge);
            
            const cell = gridX + gridY * cellsInRow;
            
            console.log(`Cell# ${cell}\nGrid X: ${gridX}\nGrid Y: ${gridY}\n--------`);
            
            // if... then added as test
            if (cell < ary.length)
            {
            console.log("**There is an Item:", String.fromCharCode(65 + cell), `(last item: ${ary[ary.length - 1]})`)
            this.scene.rect.setPosition(this.x + gridX * edge, this.y + gridY * edge).setVisible(true);
            }
            
        } 
        else
        {
            this.scene.rect.setVisible();
        }
    }
}
