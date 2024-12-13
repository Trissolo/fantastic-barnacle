export default class PriorityQueue
{
    // Es6 Map with key: node, and value: number.
    // distancesMap;

    // Array: index priority, value: node.
    // orderedArr = [];
    
    constructor(distancesMap)
    {
        this.distancesMap = distancesMap;
        this.orderedArr = [];
    }
    
    // insert(node, distance)
    // {
    //     this.orderedArr.push(node);

    //     this.distancesMap.set(node, distance);

    //     this.reorderUp();
    // }

    insert(node)
    {
        this.orderedArr.push(node);

        this.reorderUp();
    }
    
    pop(orderedArr = this.orderedArr)
    {
        const ret = orderedArr[0];
        
        orderedArr[0] = orderedArr[orderedArr.length - 1];
        
        orderedArr.pop();
        
        this.reorderDown();
        
        return ret;
    }
    
    reorderUp(orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        for (let idx = orderedArr.length - 1; distancesMap.get(orderedArr[idx]) < distancesMap.get(orderedArr[idx - 1]); idx--)
        {
            [ orderedArr[idx], orderedArr[idx - 1] ] = [orderedArr[idx - 1], orderedArr[idx]];
        }
    }
    
    reorderDown(orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        for (let idx = 0; distancesMap.get(orderedArr[idx]) > distancesMap.get(orderedArr[idx + 1]); idx++)
        {
            [ orderedArr[idx], orderedArr[idx + 1] ] = [ orderedArr[idx + 1], orderedArr[idx] ];
        }
    }

    reorderUpFrom(node, orderedArr = this.orderedArr, distancesMap = this.distancesMap)
    {
        for (let idx = orderedArr.indexOf(node); distancesMap.get(orderedArr[idx]) < distancesMap.get(orderedArr[idx - 1]); idx--)
        {
            [ orderedArr[idx], orderedArr[idx - 1] ] = [orderedArr[idx - 1], orderedArr[idx]];
        }
    }
    
    isEmpty()
    {
        return this.orderedArr.length === 0;
    }


    // show()
    // {
    //     let res = "";

    //     for (const node of this.orderedArr)
    //     {
    //         res += `{${node.x}, ${node.y}} -`; // `${this.distancesMap.get(node)} - `;
    //     }

    //     return res
    // }

}  // end class
