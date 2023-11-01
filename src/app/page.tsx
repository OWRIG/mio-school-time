"use client";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { getSingleSchedule } from "@/lib/utils";
import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";

interface CellData {
	defaultData: { class: string | null; project: string | null } | undefined;
	onClick: (alignment: [number, number]) => void;
	alignment: [number, number];
	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	furtherData?: any;
}

const CellCom = (props: CellData) => {
	const { defaultData, onClick, alignment } = props;
	const ownData = defaultData?.class && defaultData?.project;
	return (
		<TableCell
			className={`hover:bg-blue-50 p-2 ${
				ownData ? "cursor-pointer" : "cursor-default"
			}`}
			onClick={ownData ? () => onClick(alignment) : () => {}}
		>
			<div className="flex flex-col items-center justify-center">
				<p className="pl-2">{defaultData?.class}</p>
				<p className="text-muted-foreground">{defaultData?.project}</p>
			</div>
		</TableCell>
	);
};

interface TableData {
	teacher: string;
	schedule: [{ class: string | null; project: string | null }][];
}

interface RelatedData {
	teacher: string;
	neededClass: string | null | undefined;
	schedule: { class: string | null; project: string | null } | undefined;
}

export default function Home() {
	const [tableData, setTableData] = useState<TableData[]>([]);
	const [relatedData, setRelatedData] = useState<RelatedData[]>([]);
	const [teacher, setTeacher] = useState<string>("杨婉昕");
	const [open, setOpen] = useState<boolean>(false);
	const ref = useRef<HTMLInputElement | undefined>(null);
	const dialogRef = useRef<HTMLButtonElement | undefined>(null);
	useEffect(() => {
		const _data = localStorage.getItem("mio-school-time-tableData");
		if (_data) {
			setTableData(JSON.parse(_data));
		}
	}, []);
	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	const handleFileUpload = (e: any) => {
		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onload = (evt) => {
			const bstr = evt.target?.result;
			const wb = XLSX.read(bstr, { type: "binary" });
			const name = wb.SheetNames[0];
			const ws = wb.Sheets[name];
			const data = XLSX.utils.sheet_to_json(ws, {
				blankrows: true,
			});
			const dividedData = getSingleSchedule(data);
			localStorage.setItem(
				"mio-school-time-tableData",
				JSON.stringify(dividedData),
			);
			setTableData(dividedData as TableData[]);
		};
		reader.readAsBinaryString(file);
	};
	const handleFileUploadClick = () => {
		ref.current?.click();
	};

	useEffect(() => {
		setTeacher("杨婉昕");
	}, [tableData]);

	const teacherSchedule = useMemo(() => {
		return tableData.find((item) => item.teacher === teacher);
	}, [tableData, teacher]);

	const onCellClick = (alignment: [number, number]) => {
		const scheduleInNeed =
			teacherSchedule?.schedule[alignment[0]][alignment[1]];
		const neededClass = scheduleInNeed?.class;

		// 找到所有同班教师
		const relatedTeachers = tableData.filter((data) => {
			if (data.teacher === teacher) return false;
			for (const i of data.schedule) {
				const hasRelatedClass = i.some((item) => item.class === neededClass);
				if (hasRelatedClass) return true;
			}
		});
		const relatedSchedules = relatedTeachers.map((data) => {
			const _teacher = data.teacher;
			const _alignment_schedule = data.schedule[alignment[0]][alignment[1]];
			return {
				teacher: _teacher,
				neededClass: neededClass,
				schedule: _alignment_schedule,
			};
		});
		setRelatedData(relatedSchedules);
		dialogRef.current?.click();
	};

	return (
		<main className="flex min-h-screen flex-col items-center p-24 gap-20">
			<div className="w-full flex flex-row justify-between">
				<div className="flex flex-row gap-2 items-center">
					{tableData.length > 0 && (
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={open}
									className="w-[120px] justify-between"
								>
									{teacher}
									<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-[120px] p-0">
								<Command>
									<CommandInput placeholder="搜索" />
									<CommandEmpty>未能找到该教师</CommandEmpty>
									<CommandGroup className="max-h-56 overflow-y-auto">
										{tableData.map((_data) => (
											<CommandItem
												key={_data.teacher}
												value={_data.teacher}
												onSelect={(currentValue) => {
													setTeacher(currentValue);
													setOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														teacher === _data.teacher
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{_data.teacher}
											</CommandItem>
										))}
									</CommandGroup>
								</Command>
							</PopoverContent>
						</Popover>
					)}
					<h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
						{`课表 (${tableData.length > 0 ? "数据已更新" : "未导入数据"})`}
					</h3>
				</div>
				<input
					// @ts-ignore
					ref={ref}
					type="file"
					onChange={handleFileUpload}
					accept=".xlsx"
					className="hidden"
				/>
				<Button onClick={handleFileUploadClick}>导入课表(.xlsx)</Button>
			</div>
			<div className="w-full h-full rounded-sm border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead> </TableHead>
							<TableHead className="text-center">星期一</TableHead>
							<TableHead className="text-center">星期二</TableHead>
							<TableHead className="text-center">星期三</TableHead>
							<TableHead className="text-center">星期四</TableHead>
							<TableHead className="text-center">星期五</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(8)].map((_, i) => {
							return (
								<TableRow key={`day${i + 1}`}>
									<TableCell>{i + 1}</TableCell>
									<CellCom
										defaultData={teacherSchedule?.schedule[0][i]}
										alignment={[0, i]}
										onClick={onCellClick}
									/>
									<CellCom
										defaultData={teacherSchedule?.schedule[1][i]}
										alignment={[1, i]}
										onClick={onCellClick}
									/>
									<CellCom
										defaultData={teacherSchedule?.schedule[2][i]}
										alignment={[2, i]}
										onClick={onCellClick}
									/>
									<CellCom
										defaultData={teacherSchedule?.schedule[3][i]}
										alignment={[3, i]}
										onClick={onCellClick}
									/>
									<CellCom
										defaultData={teacherSchedule?.schedule[4][i]}
										alignment={[4, i]}
										onClick={onCellClick}
									/>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
				<Dialog>
					{/* @ts-ignore */}
					<DialogTrigger ref={dialogRef} className="hidden">
						Open
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>以下为相关教师课程安排</DialogTitle>
							<DialogDescription className="pt-4">
								{relatedData.map((data) => {
									const ownSchedule =
										data.schedule?.class || data.schedule?.project;
									return (
										<span
											className={`flex flex-row justify-between mb-2 ${
												ownSchedule ? "text-gray-400" : "text-black"
											}`}
											key={data.teacher}
										>
											<span>{data.teacher}</span>
											<span>
												{(data.schedule?.class || "可") +
													(data.schedule?.project || "换")}
											</span>
										</span>
									);
								})}
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			</div>
		</main>
	);
}
