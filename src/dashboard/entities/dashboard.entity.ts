import { schoolclass } from "prisma/generated/client"

export class Dashboard {
    lastTests: {
        id: number,
        name: string,
        date: Date,
        schoolclass: {
            id: number,
            name: string,
        },
        completion: number
    }[]
    schoolClasses: Partial<schoolclass>[]
}
