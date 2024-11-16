import Phaser from "phaser";


const {SpliceOne} = Phaser.Utils.Array;


export default class ProceduralGenerationHelper
{
    static baseSeed = "";

    static rect = new Phaser.Geom.Rectangle();

    static rnd; // = Phaser.Math.RND || new Phaser.Math.RandomDataGenerator();

    static setBaseSeed(baseSeed)
    {
        this.baseSeed = `${baseSeed}`;

        console.log(this.rnd);
    }

    static random(max = 1)
    {
        return Math.floor(this.rnd.frac() * max);
    }
}
