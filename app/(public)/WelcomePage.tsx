"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { Typography } from "antd";
import {
  celInwestycyjnyZeSkladkiMiesiecznej,
  skladkaMiesieczna,
  wartosciPortfela,
} from "./calculator";

const { Title } = Typography;

export default function WelcomePage() {
  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  // console.log("Cel Inwestycyjny: ", celInwestycyjny());
  // console.log("Składka roczna: ", skladkaRoczna());
  // console.log("Składka miesięczna: ", skladkaMiesieczna());
  console.log(
    "Cel inwestycyjny ze składki miesięcznej: ",
    celInwestycyjnyZeSkladkiMiesiecznej(
      1,
      0.05,
      0,
      0.03,
      35,
      229.2789168618616,
    ),
  );
  console.log(
    "Wartości portfela co miesiąc: ",
    wartosciPortfela(1, 0.05, 0, 0.03, 35, 229.2789168618616),
  );
  console.log(
    "Wartości portfela co rok: ",
    wartosciPortfela(1, 0.05, 0, 0.03, 35, 229.2789168618616, true),
  );
  console.log(
    "skladkaMiesieczna: ",
    skladkaMiesieczna(1, 0.05, 0, 0.03, 35, 261567.38256215112),
  );

  return (
    <section className="max-w-full h-full flex flex-col items-center justify-center mx-auto p-4 sm:p-6">
      <header className="mb-8 text-center">
        <Title level={1} style={{ margin: 0, color: "var(--text)" }}>
          Tekst Start
        </Title>
        <Title level={5} style={{ margin: 0, color: "var(--text)" }}>
          Misja i wizja firmy
        </Title>
      </header>
      <LineChart
        style={{
          width: "100%",
          maxWidth: "700px",
          height: "100%",
          maxHeight: "70vh",
          aspectRatio: 1.618,
        }}
        responsive
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis width="auto" />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="pv"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        <RechartsDevtools />
      </LineChart>
    </section>
  );
}
