import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        console.log("Starting:", this.scene.key);
    }

    preload ()
    {
        this.load.on('filecomplete-image-bitsy', this.addBitmapFont, this);

        this.load.image('bitsy', 'assets/bitsy-6x8.png');
    }

    create ()
    {
        this.scene.start('MainMenu');
    }

    addBitmapFont(a, b, c)
    {
        const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZ,.:;"!abcdefghijklmnopqrstuvwxyz?+-*/= 0123456789'&$|_àèìòù#^><%()[]`;
      
        const config = {
          image: 'bitsy',
          width: 6,
          height: 8,
          chars: chars,
        //   lineSpacing: 2,
          charsPerRow: 32 //,
          //spacing: { x: 1, y: 1 }
        }
          
        this.cache.bitmapFont.add('bitsy', Phaser.GameObjects.RetroFont.Parse(this, config));
    }
}
