package handler

import "time"

func CalculateStartDate(endDate time.Time, timePeriod string) time.Time {
	switch timePeriod {
	case "5year":
		return endDate.AddDate(-5, 0, 0)
	case "3year":
		return endDate.AddDate(-3, 0, 0)
	case "1year":
		return endDate.AddDate(-1, 0, 0)
	case "6months":
		return endDate.AddDate(0, -6, 0)
	case "3months":
		return endDate.AddDate(0, -3, 0)
	case "1month":
		return endDate.AddDate(0, -1, 0)
	default:
		return endDate.AddDate(-1, 0, 0)
	}
}
