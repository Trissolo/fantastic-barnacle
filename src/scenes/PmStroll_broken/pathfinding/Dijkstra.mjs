class Dijkstra
{
    // start;
    // target;
    // graph;

    // cameFrom;
    // costSoFar;
    // frontier;

    constructor(start, target, graph)
    {
        this.start = start;

        this.target = target;

        this.graph = graph;

        this.costSoFar = new Map(); //[...graph.keys()].map(el => [el, 0]));
        this.costSoFar.set(start, 0);

        this.frontier = new PriorityQueue(this.costSoFar);
        this.frontier.insert(start);

        // visited nodes
        // key<node>
        // value<(node> (cheapest neighbor)
        this.cameFrom = new Map();
        this.cameFrom.set(start, null);

        // start the search immediately
        // this.search();
    }

    search()
    {
        const {frontier, costSoFar, cameFrom, target, graph} = this;

        while(!frontier.isEmpty())
        {
            const currentNode = frontier.pop();

            if (currentNode === target) {return this.getPath()}

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

                    // update frontier determine priority
                    betterCost? frontier.reorderUpFrom(neighbor) : frontier.insert(neighbor)
                }
            }
        }

        return this.getPath()
    }

    getPath()
    {
        const path = [];

        let {target: currNode} = this;

        if (!this.cameFrom.has(currNode) || this.cameFrom.size === 1)
        {
            this.destroy();
            
            return path
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

        return path
	}

    destroy()
    {
        this.frontier.orderedArr.length = 0;
        this.frontier.orderedArr = undefined;
        this.frontier.distancesMap = undefined;
        this.frontier = undefined;

        this.costSoFar.clear();
        this.costSoFar = undefined;

        this.cameFrom.clear();
        this.cameFrom = undefined;

        this.start = undefined;
        this.target = undefined;

        GraphManager.destroyGraph(this.graph);
        this.graph = undefined;
    }

}
