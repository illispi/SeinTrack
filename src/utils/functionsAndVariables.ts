export const weekdaysArr = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];

export const monthsArr = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const adjustDateByOne = (
	year: number,
	month: number,
	forward: boolean,
) => {
	if (month === 11 && forward) {
		return { month: 0, year: year + 1 };
	}
	if (month === 0 && !forward) {
		return { month: 11, year: year - 1 };
	}

	if (forward) {
		return { month: month + 1, year };
	}

	return { month: month - 1, year };
};
