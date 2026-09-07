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
}
