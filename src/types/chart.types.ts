export interface ChartDataPoint {
	x: string | number;
	y: number;
}

export interface ChartSeries {
	name: string;
	data: number[];
}

export interface UserGrowthData {
	newUsers: number[];
	activeUsers: number[];
	months: string[];
}

export interface DepartmentData {
	name: string;
	value: number;
	color?: string;
}

export interface ActivityData {
	logins: number[];
	reportsCreated: number[];
	dataExports: number[];
	months: string[];
}

export interface SystemHealthData {
	cpuUsage: number[];
	memoryUsage: number[];
	diskUsage: number[];
	timestamps: string[];
}

export interface ChartConfig {
	colors: string[];
	height: number;
	showLegend: boolean;
	showTooltip: boolean;
	showDataLabels: boolean;
}
