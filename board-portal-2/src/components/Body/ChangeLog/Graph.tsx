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

const Graph = () => {
  const chartData: dummySubmission[] = [
    { year: 1991, submissions: 30 },
    { year: 1992, submissions: 40 },
    { year: 1993, submissions: 45 },
    { year: 1994, submissions: 50 },
    { year: 1995, submissions: 55 },
    { year: 1996, submissions: 60 },
    { year: 1997, submissions: 65 },
    { year: 1998, submissions: 70 },
    { year: 1999, submissions: 75 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bar Chart</CardTitle>
        <CardDescription>Historical Submissions 1991-1999</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="year"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <Tooltip />
              <Bar
                dataKey="submissions"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export default Graph