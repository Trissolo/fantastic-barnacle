// Yields the current vertex, the previous one and the next one
// example: ary = ['A', 'B', 'C', 'D', 'E'];
// result:
// A B E
// B C A
// C D B
// D E C
// E A D
// that is: [current, next, previous]

export default function* EachVectorAndAdjacents(ary)
{
    const len = ary.length - 1;
    let i = 0, j = len;

    for( ; i < len; j = i++)
    {
        yield [ ary[i], ary[i + 1], ary[j] ];
    }

    yield [ ary[i], ary[0], ary[j] ];
}
