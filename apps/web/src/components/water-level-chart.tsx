import { useMemo, useState } from "react";

type Reading = {
	level: number;
	recordedAt: string | Date;
};

type Threshold = {
	safeMax: number;
	warningMax: number;
} | null;

const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 24, left: 40 };

function formatTime(date: Date) {
	return date.toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function WaterLevelChart({
	readings,
	threshold,
}: {
	readings: Reading[];
	threshold: Threshold;
}) {
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const chart = useMemo(() => {
		const innerWidth = WIDTH - PADDING.left - PADDING.right;
		const innerHeight = HEIGHT - PADDING.top - PADDING.bottom;

		const levels = readings.map((r) => r.level);
		const thresholdValues = threshold
			? [threshold.safeMax, threshold.warningMax]
			: [];
		const allValues = [...levels, ...thresholdValues];
		const rawMin = Math.min(...allValues);
		const rawMax = Math.max(...allValues);
		const span = rawMax - rawMin || 1;
		const min = rawMin - span * 0.1;
		const max = rawMax + span * 0.1;

		const toX = (index: number) =>
			readings.length <= 1
				? PADDING.left
				: PADDING.left + (index / (readings.length - 1)) * innerWidth;
		const toY = (value: number) =>
			PADDING.top + (1 - (value - min) / (max - min)) * innerHeight;

		const points = readings.map((r, i) => ({
			x: toX(i),
			y: toY(r.level),
			reading: r,
		}));
		const linePath = points
			.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
			.join(" ");
		const areaPath =
			points.length > 0
				? `${linePath} L ${points[points.length - 1]?.x} ${PADDING.top + innerHeight} L ${points[0]?.x} ${PADDING.top + innerHeight} Z`
				: "";

		const yTicks = Array.from(
			{ length: 4 },
			(_, i) => min + ((max - min) * i) / 3,
		);

		return { points, linePath, areaPath, yTicks, toY, innerWidth, innerHeight };
	}, [readings, threshold]);

	if (readings.length === 0) {
		return (
			<div className="flex h-[240px] items-center justify-center text-muted-foreground text-sm">
				Chưa có dữ liệu mực nước.
			</div>
		);
	}

	const hovered = hoverIndex !== null ? chart.points[hoverIndex] : null;

	return (
		<div className="relative">
			<svg
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				className="w-full text-primary"
				role="img"
				aria-label="Biểu đồ mực nước theo thời gian"
				onPointerLeave={() => setHoverIndex(null)}
				onPointerMove={(event) => {
					const rect = event.currentTarget.getBoundingClientRect();
					const relativeX = ((event.clientX - rect.left) / rect.width) * WIDTH;
					let nearest = 0;
					let nearestDist = Number.POSITIVE_INFINITY;
					chart.points.forEach((point, index) => {
						const dist = Math.abs(point.x - relativeX);
						if (dist < nearestDist) {
							nearestDist = dist;
							nearest = index;
						}
					});
					setHoverIndex(nearest);
				}}
			>
				{chart.yTicks.map((tick) => (
					<g key={tick}>
						<line
							x1={PADDING.left}
							x2={WIDTH - PADDING.right}
							y1={chart.toY(tick)}
							y2={chart.toY(tick)}
							stroke="currentColor"
							className="text-border"
							strokeWidth={1}
						/>
						<text
							x={PADDING.left - 6}
							y={chart.toY(tick)}
							textAnchor="end"
							dominantBaseline="middle"
							className="fill-muted-foreground text-[10px]"
						>
							{tick.toFixed(1)}
						</text>
					</g>
				))}

				{threshold ? (
					<>
						<line
							x1={PADDING.left}
							x2={WIDTH - PADDING.right}
							y1={chart.toY(threshold.safeMax)}
							y2={chart.toY(threshold.safeMax)}
							className="text-green-600 dark:text-green-400"
							stroke="currentColor"
							strokeWidth={1}
							strokeDasharray="4 3"
						/>
						<text
							x={WIDTH - PADDING.right}
							y={chart.toY(threshold.safeMax) - 4}
							textAnchor="end"
							className="fill-green-600 text-[10px] dark:fill-green-400"
						>
							An toàn ≤ {threshold.safeMax}m
						</text>
						<line
							x1={PADDING.left}
							x2={WIDTH - PADDING.right}
							y1={chart.toY(threshold.warningMax)}
							y2={chart.toY(threshold.warningMax)}
							className="text-amber-600 dark:text-amber-400"
							stroke="currentColor"
							strokeWidth={1}
							strokeDasharray="4 3"
						/>
						<text
							x={WIDTH - PADDING.right}
							y={chart.toY(threshold.warningMax) - 4}
							textAnchor="end"
							className="fill-amber-600 text-[10px] dark:fill-amber-400"
						>
							Cảnh báo ≤ {threshold.warningMax}m
						</text>
					</>
				) : null}

				<path
					d={chart.areaPath}
					fill="currentColor"
					opacity={0.1}
					stroke="none"
				/>
				<path
					d={chart.linePath}
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinejoin="round"
					strokeLinecap="round"
				/>

				{chart.points.length > 0 ? (
					<circle
						cx={chart.points[chart.points.length - 1]?.x}
						cy={chart.points[chart.points.length - 1]?.y}
						r={4}
						fill="currentColor"
						stroke="var(--background)"
						strokeWidth={2}
					/>
				) : null}

				{hovered ? (
					<>
						<line
							x1={hovered.x}
							x2={hovered.x}
							y1={PADDING.top}
							y2={PADDING.top + chart.innerHeight}
							className="text-border"
							stroke="currentColor"
							strokeWidth={1}
						/>
						<circle
							cx={hovered.x}
							cy={hovered.y}
							r={4}
							fill="currentColor"
							stroke="var(--background)"
							strokeWidth={2}
						/>
					</>
				) : null}

				<text
					x={PADDING.left}
					y={HEIGHT - 6}
					className="fill-muted-foreground text-[10px]"
				>
					{formatTime(new Date(readings[0]?.recordedAt ?? Date.now()))}
				</text>
				<text
					x={WIDTH - PADDING.right}
					y={HEIGHT - 6}
					textAnchor="end"
					className="fill-muted-foreground text-[10px]"
				>
					{formatTime(
						new Date(readings[readings.length - 1]?.recordedAt ?? Date.now()),
					)}
				</text>
			</svg>

			{hovered ? (
				<div
					className="pointer-events-none absolute rounded border bg-popover px-2 py-1 text-popover-foreground text-xs shadow-sm"
					style={{
						left: `${(hovered.x / WIDTH) * 100}%`,
						top: `${(hovered.y / HEIGHT) * 100}%`,
						transform: "translate(-50%, -130%)",
					}}
				>
					<div className="font-medium">{hovered.reading.level} m</div>
					<div className="text-muted-foreground">
						{formatTime(new Date(hovered.reading.recordedAt))}
					</div>
				</div>
			) : null}
		</div>
	);
}
