"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

const cycles = [
  { cycle: "1", days: 27 }, { cycle: "2", days: 29 }, { cycle: "3", days: 28 },
  { cycle: "4", days: 31 }, { cycle: "5", days: 28 }, { cycle: "6", days: 29 },
];
const flow = [
  { day: "1", value: 2 }, { day: "2", value: 4 }, { day: "3", value: 5 },
  { day: "4", value: 3 }, { day: "5", value: 2 }, { day: "6", value: 1 }, { day: "7", value: 0.5 },
];
const chartConfig = {
  days: { label: "Длина цикла", color: "var(--chart-2)" },
  value: { label: "Интенсивность", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function UiKitShadcnCharts() {
  return (
    <div className="uik-graph-grid uik-shadcn-graphs">
      <Card>
        <CardHeader>
          <CardTitle>Длина цикла</CardTitle>
          <CardDescription>Последние шесть завершённых циклов</CardDescription>
          <CardAction><Badge variant="secondary">28–31 день</Badge></CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <LineChart accessibilityLayer data={cycles} margin={{ left: 8, right: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="cycle" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="days" type="natural" stroke="var(--color-days)" strokeWidth={3} dot={{ fill: "var(--color-days)" }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>Циклы остаются внутри вашего фактического диапазона.</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Интенсивность</CardTitle>
          <CardDescription>Отметки за последние семь дней</CardDescription>
          <CardAction><Badge variant="secondary">Дневник</Badge></CardAction>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={flow}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={7} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>Самая высокая интенсивность отмечена на третий день.</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Частота симптомов</CardTitle>
          <CardDescription>Фактические отметки за три цикла</CardDescription>
          <CardAction><Badge variant="outline">12 отметок</Badge></CardAction>
        </CardHeader>
        <CardContent className="uik-ranges">
          <label><span>Боль</span><i><b style={{ width: "72%" }} /></i><strong>8</strong></label>
          <label><span>Усталость</span><i><b style={{ width: "54%" }} /></i><strong>6</strong></label>
          <label><span>Мигрень</span><i><b style={{ width: "27%" }} /></i><strong>3</strong></label>
        </CardContent>
        <CardFooter>Цвет дополнен подписями и числовыми значениями.</CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Настроение</CardTitle>
          <CardDescription>Состояние без достаточного количества данных</CardDescription>
          <CardAction><Badge variant="outline">No data</Badge></CardAction>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><BarChart3 /></EmptyMedia>
              <EmptyTitle>Пока мало данных</EmptyTitle>
              <EmptyDescription>Добавьте состояние ещё 3–5 дней, чтобы увидеть первый график.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    </div>
  );
}
