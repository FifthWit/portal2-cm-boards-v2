import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip , ResponsiveContainer} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface dummySubmission {
  year: number
  submissions: number
}

const chartData = [
    { year: "1991", submissions: 30 },
    { year: "1992", submissions: 40 },
    { year: "1993", submissions: 45 },
    { year: "1994", submissions: 50 },
    { year: "1995", submissions: 55 },
    { year: "1996", submissions: 60 },
    { year: "1997", submissions: 65 },
    { year: "1998", submissions: 70 },
    { year: "1999", submissions: 75 },
]

const chartConfig = {
  submissions: {
    label: "Submissions",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function Graph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Changelog</CardTitle>
        <CardDescription>Runs from the past (take data from db idc)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] max-h-[400px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="submissions" fill="var(--color-submissions)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default Graph