import "./Stats.css";
import React, { useState } from "react";
import ApexChart from "react-apexcharts";
import * as utils from "./shared/utils";
import { useLogPageLoad } from "./shared/api";
import {
  colorForCalories,
  colorForExercise,
  exerciseTimeLabel,
  WeeklyCaloriesLegend,
  ExerciseLegend,
  WeeklyNavigation,
  Legend,
  Heading,
} from "./shared/DashboardComponents";

function MacroSummary({ activeWeek }) {
  const days = activeWeek.map((entry) => entry[1]);
  const totals = days.map((x) => x.totals).filter((x) => x);
  const avgCalories = utils.round(utils.avg(totals.map((x) => x.calories)), 0);
  const avgCarb = utils.round(utils.avg(totals.map((x) => x.carbohydrates)), 0);
  const avgFat = utils.round(utils.avg(totals.map((x) => x.fat)), 0);
  const avgProtein = utils.round(utils.avg(totals.map((x) => x.protein)), 0);
  const percCarbs = utils.perc(avgCarb * 4, avgCalories);
  const percFats = utils.perc(avgFat * 9, avgCalories);
  const percProteins = utils.perc(avgProtein * 4, avgCalories);
  const exerciseDays = days.map((day) =>
    utils.extractDailyExercise(day.exercises)
  );
  const exerciseSummary = utils.dailyToWeeklyExerciseSummary(exerciseDays);
  const fitnessNumDays = exerciseSummary.numDays;
  const fitnessHrs = exerciseSummary.totalHours;
  const thCl =
    "text-right py-1 pl-1 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right";
  const tdCl = "text-sm text-right py-1 pl-1";
  return (
    <div>
      <div className="px-6 flex max-w-md mx-auto items-center">
        <div
          style={{ width: "6.5rem", height: "6.5rem" }}
          className="bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex flex-col items-center justify-center"
        >
          <div className="bg-gray-900 rounded-full h-24 w-24 flex flex-col items-center justify-center">
            <div className="font-semibold">{avgCalories}</div>
            <div className="text-gray-400 text-sm">cal/day</div>
          </div>
        </div>
        <table className="flex-1 table-auto">
          <thead>
            <tr>
              <th className={thCl}>Carbs</th>
              <th className={thCl}>Fat</th>
              <th className={thCl}>Protein</th>
              <th className={thCl}>Fitness</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={tdCl}>{avgCarb}g</td>
              <td className={tdCl}>{avgFat}g</td>
              <td className={tdCl}>{avgProtein}g</td>
              <td className={tdCl}>{fitnessNumDays}x</td>
            </tr>
            <tr>
              <td className={tdCl}>{percCarbs}%</td>
              <td className={tdCl}>{percFats}%</td>
              <td className={tdCl}>{percProteins}%</td>
              <td className={tdCl}>{fitnessHrs}hrs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalorieWeekday({ calories, day, color }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-end space-y-1">
      <div className="font-semibold text-sm">{calories}</div>
      <div className={`w-full h-5 rounded-sm ${color}`}></div>
      <div className="text-gray-400 text-sm">{day}</div>
    </div>
  );
}

function CalorieWeekdays({ activeWeek, target }) {
  const labelAndDay = utils.ORDERED_WEEKDAYS.map((label, i) => [
    label,
    activeWeek[i] && activeWeek[i][1],
  ]);
  return (
    <div className="flex space-x-1 justify-center max-w-md mx-4">
      {labelAndDay.map(([label, day]) => {
        const calories = day && day.totals && day.totals.calories;
        return (
          <CalorieWeekday
            key={label}
            calories={calories}
            color={colorForCalories({ calories, target })}
            day={label}
          />
        );
      })}
    </div>
  );
}

function WeeklyCalories(props) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Weekly Calories</Heading>
      <WeeklyCaloriesLegend />
      <CalorieWeekdays {...props} />
    </div>
  );
}

function ExerciseWeekday({ dayName, time, names }) {
  const color = colorForExercise(time);
  return (
    <div className="flex space-x-4">
      <div className="flex w-24 space-x-2">
        <div className={`w-6 h-auto ${color} rounded-sm`}></div>
        <div>
          <div className="text-gray-400">{dayName}</div>
          <div className="font-semibold">{exerciseTimeLabel(time)}</div>
        </div>
      </div>
      <div className="flex-1">
        {names && names.map((name) => <div key={name}>{name}</div>)}
      </div>
    </div>
  );
}

function ExerciseWeekdays({ activeWeek }) {
  const emptyInfo = [undefined, undefined];
  const dayAndInfo = utils.ORDERED_WEEKDAYS.map((label, i) => [
    label,
    (activeWeek[i] && utils.extractDailyExercise(activeWeek[i][1].exercises)) ||
      emptyInfo,
  ]);
  return (
    <div className="px-4 space-y-4">
      {dayAndInfo.map(([dayName, [names, time]]) => (
        <ExerciseWeekday
          key={dayName}
          dayName={dayName}
          names={names}
          time={time}
        />
      ))}
    </div>
  );
}
function WeeklyExercise({ activeWeek }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Weekly Exercise</div>
      <ExerciseLegend />
      <ExerciseWeekdays activeWeek={activeWeek} />
    </div>
  );
}

function WeightGraph({ dates, loggedWeights, targetWeights }) {
  const series = [
    {
      name: "Weight",
      data: loggedWeights,
    },
    {
      name: "Target Weight",
      data: targetWeights,
    },
  ];
  const options = {
    theme: {
      mode: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      show: false,
    },
    chart: {
      background: "transparent",
      type: "line",
      sparkline: { enabled: true },
      animations: {
        enabled: false,
      },
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    markers: {
      size: 0,
    },
    colors: ["#3B82F6", "#FBBF24"],
    xaxis: {
      show: false,
      type: "category",
      categories: dates,
    },
  };

  return (
    <div className="mx-4">
      <ApexChart series={series} options={options} />
    </div>
  );
}

function WeightInfo({ dates, loggedWeights, targetWeights }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Weight</Heading>
      <WeightGraph
        dates={dates}
        loggedWeights={loggedWeights}
        targetWeights={targetWeights}
      />
      <Legend
        items={[
          ["bg-blue-500", "Weight"],
          ["bg-yellow-400", "Target"],
        ]}
      />
    </div>
  );
}

const HISTORICAL_NAVIGATION_OPTIONS = [7, 30, 90];
const DEFAULT_HISTORICAL_NAVIGATION = HISTORICAL_NAVIGATION_OPTIONS[0];

function HistoricalNavigation({ options, currentOption, onChange }) {
  return (
    <div className="space-y-4 max-w-md mx-auto pb-2">
      <Heading>Nutrition</Heading>
      <div className="flex justify-center space-x-4 pt-2">
        {options.map((option) => {
          const customStyles =
            option === currentOption
              ? "bg-gray-700"
              : "bg-gray-800 text-blue-300";
          return (
            <button
              key={option}
              className={`rounded w-20 text-center py-1 font-semibold ${customStyles}`}
              onClick={() => onChange(option)}
            >
              {option} Days
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BarSection({ name, dates, data, target, targetLabel, targetSuffix }) {
  const series = [
    {
      name: name,
      data: data,
    },
  ];
  const options = {
    theme: {
      mode: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    annotations: {
      yaxis: [
        {
          y: target,
          borderColor: "#FBBF24",
          borderWidth: 5,
          label: {
            borderColor: "none",
            offsetY: 25,
            style: {
              color: "#fff",
              background: "transparent",
              fontSize: "20px",
            },
            text: `${target}${targetSuffix}`,
          },
        },
      ],
    },
    chart: {
      background: "transparent",
      animations: {
        enabled: false,
      },
      sparkline: {
        enabled: true,
      },
    },
    xaxis: {
      show: false,
      type: "category",
      categories: dates,
    },
    colors: ["#3B82F6", "#FBBF24"],
  };
  return (
    <div className="pb-2">
      <div className="font-semibold text-center">{name}</div>
      <ApexChart
        className="max-w-md mx-auto px-4 pb-4"
        type="bar"
        series={series}
        options={options}
      />
      <Legend
        items={[
          ["bg-blue-500", "Actual"],
          ["bg-yellow-400", targetLabel],
        ]}
      />
    </div>
  );
}

function DataMessage() {
  return (
    <div className="text-gray-400 text-center text-sm">
      Data refreshed every few hours
    </div>
  );
}

const Stats = ({ data }) => {
  useLogPageLoad("load-home");
  const [numDaysNutrition, setNumDaysNutrition] = useState(
    DEFAULT_HISTORICAL_NAVIGATION
  );

  const days = data["mfp-results"];
  const info = data["profile"];
  const units = info["ideal-metric"];
  const weights = data["weights"];

  const weeks = utils.sortedWeeks(days);
  const [activeWeekIdx, setActiveWeekIdx] = useState(weeks.length - 1);
  const activeWeek = weeks[activeWeekIdx];

  // Build weight graph data
  const earliestDate = utils.minDate(
    Object.keys(weights)
      .filter((d) => weights[d])
      .map((d) => utils.formatDateStr(d))
  );
  const weightDates = utils.buildClosedDailyRange(
    earliestDate,
    utils.COHORT_END_DATE
  );
  const loggedWeights = weightDates.map(
    (d) =>
      utils.weightInPrefUnits({
        lbs: parseFloat(weights[utils.importerDate(d)]),
        units,
      }) || null
  );
  const startingWeight = utils.weightInPrefUnits({
    lbs: parseFloat(weights[utils.importerDate(earliestDate)]),
    units,
  });
  const targetWeights = utils.buildDailyTargetWeights(
    startingWeight,
    utils.weightInPrefUnits({ lbs: info["target-weight"], units }),
    utils.daysBetween(earliestDate, utils.COHORT_END_DATE)
  );

  // Build nutrients data
  const loggedDays = Object.keys(days);
  const nutrientDates = loggedDays
    .sort(utils.dateSort)
    .slice(loggedDays.length - numDaysNutrition);
  const nutrientTotals = nutrientDates.map(
    (d) =>
      days[d]["totals"] || {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sodium: 0,
      }
  );
  const nutrientTargets = info["target-nutrition"];
  return (
    <div>
      <div className="space-y-4">
        <WeeklyNavigation
          weeks={weeks}
          activeWeekIdx={activeWeekIdx}
          onIdxChange={(idx) => setActiveWeekIdx(idx)}
        />
        <MacroSummary activeWeek={activeWeek} />
        <WeeklyCalories
          target={nutrientTargets["calories"]}
          activeWeek={activeWeek}
        />
        <WeeklyExercise activeWeek={activeWeek} />
        <WeightInfo
          dates={weightDates}
          loggedWeights={loggedWeights}
          targetWeights={targetWeights}
        />

        <HistoricalNavigation
          options={HISTORICAL_NAVIGATION_OPTIONS}
          currentOption={numDaysNutrition}
          onChange={setNumDaysNutrition}
        />
        <BarSection
          dates={nutrientDates}
          name="Calories"
          data={nutrientTotals.map((x) => x.calories)}
          target={nutrientTargets.calories}
          targetLabel="Target"
          targetSuffix="cal"
        />
        <BarSection
          dates={nutrientDates}
          name="Protein"
          data={nutrientTotals.map((x) => x.protein)}
          target={nutrientTargets.protein}
          targetLabel="Target"
          targetSuffix="g"
        />
        <BarSection
          dates={nutrientDates}
          name="Carbs"
          data={nutrientTotals.map((x) => x.carbohydrates)}
          target={nutrientTargets.carbohydrates}
          targetLabel="Target"
          targetSuffix="g"
        />
        <BarSection
          dates={nutrientDates}
          name="Fat"
          data={nutrientTotals.map((x) => x.fat)}
          target={nutrientTargets.fat}
          targetLabel="Target"
          targetSuffix="g"
        />
        <BarSection
          dates={nutrientDates}
          name="Sodium"
          data={nutrientTotals.map((x) => x.sodium)}
          target={nutrientTargets.sodium}
          targetLabel="Limit"
          targetSuffix="mg"
        />
      </div>
      <div className="mt-4">
        <DataMessage />
      </div>
    </div>
  );
};

export default Stats;
