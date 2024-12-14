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

    graphToString(graph = this.graph)
    {
        let res = `Visibility Map (${graph.size})\n`;
        
        for (const [pointA, edges] of graph)
        {
           let stringEdges = "";
           for (const [pointB, distance] of edges)
           {
             stringEdges += `\n├── {x: ${pointB.x}, y: ${pointB.y}} -> ${distance}`
           }
           res += `\n\n{x: ${pointA.x}, y: ${pointA.y}}\n|` + stringEdges+"\n\t";
        }
        
      return res;
    }
}
