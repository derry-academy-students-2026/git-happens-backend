//creates DTOs

export class BandModel {
    constructor(
        public readonly bandId: number,
        public readonly bandName: string
    ) {} // insert validation logic here
}

export class BandResponseModel {
    constructor(
        public readonly bandId: number,
        public readonly bandName: string
    ) {} // validation logic here
}
