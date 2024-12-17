import Phaser from "phaser";

import PMDebug from "./pmdebug/PMDebug.mjs";

import Dijkstra from "./pathfinding/Dijkstra.mjs";

import AStar from "./pathfinding/AStar.mjs";

const {BetweenPoints: heuristic} = Phaser.Math.Distance;

const {GetMidPoint} = Phaser.Geom.Line;

const {LineToLine} = Phaser.Geom.Intersects;


import AnyAgainstAllOthers from "./generators/AnyAgainstAllOthers.mjs";

import EachPolygonSide from "./generators/EachPolygonSide.mjs";

import EachVectorAndAdjacents from "./generators/EachVectorAndAdjacents.mjs";


import GraphManager from "./GraphManager.mjs";


export default class PMStroll
{
    // optional:
    // debug;

    // defaults:
    static epsilon = 0.03;

    static splitAmount = 5;

    // for recycle:
    static vertexA = new Phaser.Math.Vector2();

    static vertexB = new Phaser.Math.Vector2();

    static out = new Phaser.Math.Vector2();

    static useDebug(scene)
    {
        this.debug = new PMDebug(scene);
        
        return this;
    }

    // test simple add
    static addVisibilityMap(aryOfPhaserPolygonParams)
    {
        // 'Build" the VisibilityMap
        const graph = new Map();
        
        const polygons = [];

        for (const phaserPolygonParams of aryOfPhaserPolygonParams)
        {
            polygons.push(new Phaser.Geom.Polygon(phaserPolygonParams));
        }

        const visMap = {graph, polygons};

        //bui

        this.grabConcave(visMap)
            .checkAdjacent(visMap)
            .connectNodes(visMap);

        // this.visibilityMaps.set(name, visMap);

        console.dir("new VisibilityMap", visMap);

        return visMap;
    }

    static grabConcave(visibilityMap)
    {
        const {vertexA, vertexB} = this;
        
        let isFirstPoly = true;
        
        //iterate all walkable poly
        for (const {points} of visibilityMap.polygons)
        {
            //iterate all vertices in each poly
            for(const [curr, succ, prec] of EachVectorAndAdjacents(points))
            {
            
                vertexA.copy(succ).subtract(curr);

                vertexB.copy(curr).subtract(prec);
     
                if( (vertexB.cross(vertexA) < 0) === isFirstPoly )
                {
                    GraphManager.addNode(curr, visibilityMap.graph);
                }
            
            }
            
            // The fist polygon - the walkable one - has been checked. The remaining obstacle-polys need 'isFirstPoly' to be false
            isFirstPoly = false;
        
        }

        return this;
        
    } // end grabConcave

    static checkAdjacent(visibilityMap)
    {
        const {graph} = visibilityMap;

        for (const {points} of visibilityMap.polygons)
        {
            // EachPolygonSide
            for (const [sidePointA, sidePointB] of EachPolygonSide(points))
            {
                if (graph.has(sidePointA) && graph.has(sidePointB))
                {
                    GraphManager.addEdge(sidePointA, sidePointB, heuristic(sidePointA, sidePointB), graph);
                }
            }
        }

        return this;

    } // end checkAdjacent

    static connectNodes(visibilityMap, graph = visibilityMap.graph)
    {
        for (const [concaveA, concaveB] of AnyAgainstAllOthers([...graph.keys()]))
        {
            if (this.quickInLineOfSight(concaveA, concaveB, visibilityMap))
            {
                GraphManager.addEdge(concaveA, concaveB, heuristic(concaveA, concaveB), graph);
            }
        }
    }

    static quickInLineOfSight(start, end, visibilityMap)
    {
        //the segment to check against any polygon side
        const ray = new Phaser.Geom.Line().setFromObjects(start, end);

        //One side of current polygon
        const polygonSide = new Phaser.Geom.Line();

        // internal recycled Vector2
        const tempVec = new Phaser.Math.Vector2();

        for (const {points} of visibilityMap.polygons)
        {
            for (const [sidePointA, sidePointB] of EachPolygonSide(points))
            {
                polygonSide.setFromObjects(sidePointA, sidePointB);

                if (LineToLine(ray, polygonSide, this.out) && !this.itsNear(start, end, sidePointA, sidePointB, tempVec))
                {
                    return false;
                }
            }
        }

        //another loop?
        const rayPoints = ray.getPoints(this.splitAmount);

        rayPoints[0] = GetMidPoint(ray);

        let isFirstAgain = false;

        for (const poly of visibilityMap.polygons)
        {
            if (rayPoints.some(this.isContained, poly) === isFirstAgain)
            {
                return false;
            }

            isFirstAgain = true;
        }

        return true;

    } // end quickInLineOfSight

    static itsNear(rayA, rayB, sideA, sideB, recycledVec = new Phaser.Math.Vector2())
    {
        return (recycledVec.setFromObject(rayA).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayB).fuzzyEquals(sideB, this.epsilon)) || (recycledVec.setFromObject(rayB).fuzzyEquals(sideA, this.epsilon) || recycledVec.setFromObject(rayA).fuzzyEquals(sideB, this.epsilon));
    }

    static isContained(point) //, idx, ary)
    {
        return this.contains(point.x, point.y);
    }

    static prepareGraph(start, end, visibilityMap)
    {
        // 1) clone the base Graph:
        const clonedGraph = GraphManager.cloneGraph(visibilityMap.graph);

        // 2) get the vertices to be checked against the new one
        const graphKeys = [...clonedGraph.keys()];

        // 3) create edge if needed
        for (const newVertex of [start, end])
        {
            GraphManager.addNode(newVertex, clonedGraph);

            for (const existingVertex of graphKeys)
            {
                if (this.quickInLineOfSight(newVertex, existingVertex, visibilityMap))
                {
                    GraphManager.addEdge(newVertex, existingVertex, heuristic(newVertex, existingVertex), clonedGraph);
                }
            }

            // From now, the 'newVertex' belongs in the graph, so add it to be checked against the next vertex
            graphKeys.push(newVertex);
        }

        return clonedGraph;
    }

    static pathDijkstra(start, end, visibilityMap)
    {
        // disposable clones of the two new vertices, although I'm not sure garbage collection will benefit from them
        start = {x: start.x, y: start.y};

        end = {x: end.x, y: end.y};

        const clonedGraph = this.prepareGraph(start, end, visibilityMap);

        return new Dijkstra(start, end, clonedGraph).search();

    }  // end pathDijkstra

    static pathAStar(start, end, visibilityMap)
    {
        // disposable clones of the two new vertices, although I'm not sure garbage collection will benefit from them
        start = {x: start.x, y: start.y};
        
        end = {x: end.x, y: end.y};

        const clonedGraph = this.prepareGraph(start, end, visibilityMap);

        return new AStar(start, end, clonedGraph, heuristic).search();

    } // end pathAStar

    static permittedPosition({x, y}, {polygons})
    {
        for (let i = 0, poly, isFirst = false; i < polygons.length; i++)
        {
            poly = polygons[i];

            if (poly.contains(x, y) === isFirst)
            {
                return false;
            }

            isFirst = true;
        }

        return true;
    }

}

// the original 'Phaser.Geom.Line.GetPoints' function, in case it gets changed in the future:
// function GetPoints(line, quantity, stepRate, out)
// {
//     if (out === undefined) { out = []; }

//     //  If quantity is a falsey value (false, null, 0, undefined, etc) then we calculate it based on the stepRate instead.
//     if (!quantity && stepRate > 0)
//     {
//         quantity = Length(line) / stepRate;
//     }

//     var x1 = line.x1;
//     var y1 = line.y1;

//     var x2 = line.x2;
//     var y2 = line.y2;

//     for (var i = 0; i < quantity; i++)
//     {
//         var position = i / quantity;

//         var x = x1 + (x2 - x1) * position;
//         var y = y1 + (y2 - y1) * position;

//         out.push(new Point(x, y));
//     }

//     return out;
// }
