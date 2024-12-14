import GraphManager from "../GraphManager.mjs";

import PriorityQueue from "./PriorityQueue.mjs";

export default class AStar
{
    // start;
    // target;
    // graph;

    // heuristic;

    costSoFar = new Map();

    fScore = new Map();

    cameFrom = new Map();

    // frontier;

    constructor(start, target, graph, heuristic)
    {
        this.start = start;

        this.target = target;

        this.graph = graph;

        this.heuristic = heuristic;

        this.costSoFar.set(start, 0);

        this.fScore.set(start, 0);

        this.frontier = new PriorityQueue(this.costSoFar);

        this.frontier.insert(start);

        // visited nodes
        // key<node>
        // value<node> (cheapest neighbor)

        this.cameFrom.set(start, null);

    }

    search()
    {
        const {frontier, costSoFar, cameFrom, fScore, start, target, graph} = this;

        while (frontier.orderedArr.length !== 0) // !frontier.isEmpty())
        {
            const currentNode = frontier.pop();

            if (currentNode === target)
            {
                return this.getPath();
            }

            for (const [neighbor, distance] of graph.get(currentNode))
            {
                const newCost = costSoFar.get(currentNode) + distance;

                const betterCost = newCost < costSoFar.get(neighbor);

                // if not yet visited, or already visited but we have a cheaper cost
                // (testing: check 'costSoFar' instead 'cameFrom')
                if(!costSoFar.has(neighbor) || betterCost)
                {
                    // set or update the cost
                    costSoFar.set(neighbor, newCost);

                    // mark as visited / update the path portion
                    cameFrom.set(neighbor, currentNode);

                    // the difference than Dijkstra
                    fScore.set(neighbor, newCost + this.heuristic(neighbor, target));

                    // update frontier determine priority
                    betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor);
                }
            }
        }

        return this.getPath();
    }

    getPath()
    {
        const path = [];

        let {target: currNode} = this;

        if (!this.cameFrom.has(currNode) || this.cameFrom.size === 1)
        {
            this.destroy();
            
            return path;
        }

        path.push(currNode);

        // Maybe, to avoid putting the start node in the path array maybe we should:
        // while (cameFrom.get(currNode) !== start)
        
        while (currNode !== this.start)
        {
            currNode = this.cameFrom.get(currNode);

            // path.push(currNode);

            //maybe a new obj?
            path.push({x: currNode.x, y: currNode.y});
        }

        this.destroy();

        return path;
	}

    destroy()
    {
        this.frontier.orderedArr.length = 0;
        this.frontier.orderedArr = undefined;
        this.frontier.distancesMap = undefined;
        this.frontier = undefined;

        
        this.costSoFar = this.costSoFar.clear();

        this.heuristic = undefined;

        this.fScore = this.fScore.clear();
     
        this.cameFrom = this.cameFrom.clear();

        this.start = undefined;
        this.target = undefined;

        this.graph = GraphManager.destroyGraph(this.graph);
    }

}
