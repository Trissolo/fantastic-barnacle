import { Geom } from "phaser";

export default class VisibilityMap
{
    constructor(aryOfNumberArys)
    {
        this.graph = new Map();
        
        this.polygons = [];

        for (const phaserPolygonParams of aryOfNumberArys)
        {
            this.polygons.push(new Geom.Polygon(phaserPolygonParams));
        }
    }
}
