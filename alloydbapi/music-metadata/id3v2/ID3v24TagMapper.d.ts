import { CommonTagMapper } from '../common/GenericTagMapper';
import { IRating, ITag } from '../type';
export declare class ID3v24TagMapper extends CommonTagMapper {
    static toRating(popm: any): IRating;
    constructor();
    /**
     * Handle post mapping exceptions / correction
     * @param {string} id Tag key e.g. "©alb"
     * @param id e.g. "Buena Vista Social Club"
     * @return Common value e.g. "Buena Vista Social Club"
     */
    protected postMap(tag: ITag): void;
}
