import { Job } from "./job"

export interface Dashboard {
    stats: UserStatsResponse,
    jobs: Job[]
}

interface UserStatsResponse {
    totalJobs: number,
    totalKm: number,
    totalIncome: number,
    avgConsumption: number
}