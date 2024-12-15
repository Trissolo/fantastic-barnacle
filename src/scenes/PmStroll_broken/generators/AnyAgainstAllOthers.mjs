//  AnyAgainstAllOthers (in graph)
//  returns (an array of) two points: the current one, and each one of the remaining vertices
//  ie:
// [..."ABCD"] yields:
// A B
// A C
// A D
// B C
// B D
// C D

export default function* AnyAgainstAllOthers(ary)
{
    const jMax = ary.length;
    const iMax = jMax - 1;

    for (let i = 0; i < iMax; i++)
    {
        for (let j = i + 1; j < jMax; j++)
        {
            yield [ ary[i], ary[j] ];
        }
    }
}
