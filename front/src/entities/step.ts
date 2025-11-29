export interface ProgressiveRange {
  from: number
  to: number
}

export interface Step {
  ftp_percent: number | null
  duration: number
  rpm: number | null
  progressive_range: ProgressiveRange | null
}
