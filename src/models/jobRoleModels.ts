//creates DTOs

export class JobRoleModel {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly location: string,
        public readonly job_code: string
    ) {} // insert validation logic here
}

export class JobRoleResponseModel {
    constructor (
        public readonly id: string,
        public readonly title: string,
        public readonly location: string,
        public readonly job_code: string,
    ) {} // validation logic here
}