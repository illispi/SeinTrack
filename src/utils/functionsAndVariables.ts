export const weekdaysArr = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
];
export const weekdaysShortHandArr = [
	"Mon.",
	"Tue.",
	"Wed.",
	"Thu.",
	"Fri",
	"Sat",
	"Sun",
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

export const latestDateFunc = (dates: Date[]) => {
	dates.sort((a, b) => a.getTime() - b.getTime());
	return dates[dates.length - 1];
};
export const firstDateFunc = (dates: Date[]) => {
	dates.sort((a, b) => a.getTime() - b.getTime());
	return dates[0];
};

export const hoursToFormat = (hoursDec: number) => {
	let minutes = Math.floor(((hoursDec * 60) % 60) / 15) * 15;
	if (minutes >= 60) {
		minutes = 0;
	}
	const hours = Math.floor(hoursDec);

	return { minutes, hours };
};
