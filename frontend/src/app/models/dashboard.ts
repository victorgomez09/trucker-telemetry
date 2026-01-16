import { Job } from "./job"

export interface Dashboard {
    stats: UserStatsResponse,
    jobs: Job[]
}

interface UserStatsResponse {
    total_jobs: number,
    total_km: number,
    total_income: number,
    avg_consumption: number
}