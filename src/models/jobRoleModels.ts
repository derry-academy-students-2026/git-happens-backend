//creates DTOs

export class JobRoleModel {
    constructor(
        public readonly jobRoleId: number,
        public readonly roleName: string,
        public readonly location: string,
        public readonly capabilityId: string,
        public readonly bandId: number,
        public readonly closingDate: Date,
        public readonly status: Date
    ) {} // insert validation logic here
}

export class JobRoleResponseModel {
    constructor (
        public readonly jobRoleId: number,
        public readonly roleName: string,
        public readonly location: string,
        public readonly capabilityId: string,
        public readonly bandId: number,
        public readonly closingDate: Date,
        public readonly status: Date
    ) {} // validation logic here
}