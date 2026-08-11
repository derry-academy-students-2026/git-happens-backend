import type { BandModel } from "../models/bandModels.js";

export class BandDao {
    async getBands(): Promise<BandModel[]> {
        //mock data
        return [
            {nameId: 1, bandName: "Band A"},
            {nameId: 2, bandName: "Band B"},
            {nameId: 3, bandName: "Band C"},
            {nameId: 4, bandName: "Band D"}
        ];
    }
}
