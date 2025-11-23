    import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    } from "recharts";
    const LineChartComponent = ({ data }) => {
    return (
        <>
        <LineChart
            style={{
            width: "100%",
            maxWidth: "700px",
            height: "100%",
            maxHeight: "70vh",
            aspectRatio: 1.618,
            }}
            data={data}
            responsive
            margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 5,
            }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis width="auto" />
            <Tooltip />
            <Legend />
            <Line
            type="monotone"
            dataKey="sales"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
        </LineChart>
        </>
    );
    };

    export default LineChartComponent;
