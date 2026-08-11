import type { BandModel, BandResponseModel } from "./bandModels.js";

export function mapBandToResponseModel(band: BandModel): BandResponseModel {
    return {
        nameId: band.nameId,
        bandName: band.bandName
    };
}

export function mapBandToModel(band: BandResponseModel): BandModel {
    return {
        nameId: band.nameId,
        bandName: band.bandName
    };
}
