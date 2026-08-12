//creates DTOs

// band as returned by the DAO layer
export class BandModel {
	constructor(
		public readonly bandId: number,
		public readonly bandName: string,
	) {} // insert validation logic here
}

// band as exposed to API consumers
export class BandResponseModel {
	constructor(
		public readonly bandId: number,
		public readonly bandName: string,
	) {} // validation logic here
}
