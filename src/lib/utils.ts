import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// 数组结构为[{teacher: 'xxx',schedule: [// monday [{class:'七（二）',project: '数学}]]}]
export function getOrganizedSingleSchedule(data: any[]) {
	const origin = {
		teacher: "",
		schedule: Array(5)
			.fill("")
			.map(() =>
				Array(8)
					.fill("")
					.map(() => ({ class: null, project: null })),
			),
	};
	const regex = /\s*(.*?)老师课表/;
	const teacherName = data[0]?.teacher?.match(regex)[1];
	origin.teacher = teacherName;
	data.slice(2, 18).forEach((item, index) => {
		const isProjectRow = index % 2 === 0;
		// 得到index整除2的结果
		const evenIndex = Math.floor(index / 2);
		const oddIndex = Math.ceil(index / 2) - 1;
		if (isProjectRow) {
			if (item?.c1) {
				origin.schedule[0][evenIndex].project = item.c1;
			}
			if (item?.c2) {
				origin.schedule[1][evenIndex].project = item.c2;
			}
			if (item?.c3) {
				origin.schedule[2][evenIndex].project = item.c3;
			}
			if (item?.c4) {
				origin.schedule[3][evenIndex].project = item.c4;
			}
			if (item?.c5) {
				origin.schedule[4][evenIndex].project = item.c5;
			}
		} else {
			if (item?.c1) {
				origin.schedule[0][oddIndex].class = item.c1;
			}
			if (item?.c2) {
				origin.schedule[1][oddIndex].class = item.c2;
			}
			if (item?.c3) {
				origin.schedule[2][oddIndex].class = item.c3;
			}
			if (item?.c4) {
				origin.schedule[3][oddIndex].class = item.c4;
			}
			if (item?.c5) {
				origin.schedule[4][oddIndex].class = item.c5;
			}
		}
	});
	return origin;
}

export function getSingleSchedule(data: any[]) {
	// 先将数据按照老师分组
	const container = [];
	let cell = [];
	for (const teacherData of data) {
		if (teacherData?.teacher?.endsWith("老师课表")) {
			if (cell.length > 0) {
				container.push(cell);
			}
			cell = [];
			cell.push(teacherData);
		} else {
			cell.push(teacherData);
		}
	}

	// 将数据组合成一个按照教师划分的包含所有课时信息的数组
	return container.map((item) => {
		return getOrganizedSingleSchedule(item);
	});
}
