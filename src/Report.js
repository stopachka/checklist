import { useState } from "react";
import { useLogPageLoad } from "./shared/api";
import * as utils from "./shared/utils";
import FirebaseImage from "./shared/FirebaseImage";
import ApexChart from "react-apexcharts";
import {
  WeeklyNavigation,
  Legend,
  Heading,
  colorForCalories,
  colorForProteins,
  colorForExercise,
} from "./shared/DashboardComponents";

// We give people slack for submitting things late
const PIC_DAYS_BUFFER = -5;
const REVIEW_DAYS_BUFFER = -5;

function Goal({ goal, targetDate, targetWeight }) {
  const data = [
    ["Goal", goal],
    ["Target Date", targetDate],
    ["Target Weight", targetWeight],
  ];
  return (
    <div className="flex px-4 max-w-md mx-auto">
      <table className="flex-1 mx-auto table-fixed">
        <thead>
          <tr>
            {data.map(([label], i) => (
              <th
                key={i}
                className="p-1 w-1/3 text-left text-xs text-table-heading"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {data.map(([_, v], i) => (
              <td className="p-1 text-left text-sm" key={i}>
                {v}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const ON_TRACK_STATUS_BUFFER = 0.5;
const AT_RISK_STATUS_BUFFER = 1.5;

const ON_TRACK_CALORIE_BUFFER = 1.05;
const AT_RISK_CALORIE_BUFFER = 1.15;

const ON_TRACK_PROTEIN_BUFFER = 1.15;
const AT_RISK_PROTEIN_BUFFER = 1.3;

const ON_TRACK_EXERCISE_BUFFER = 1;
const AT_RISK_EXERCISE_BUFFER = 3;

const NO_DATA_STATUS_LABEL = "No Data";
const ON_TRACK_STATUS_LABEL = "On Track";
const AT_RISK_STATUS_LABEL = "At Risk";
const OFF_TRACK_STATUS_LABEL = "Off Track";
const STATUS_LABEL_COLORS = {
  [NO_DATA_STATUS_LABEL]: "text-gray-400",
  [ON_TRACK_STATUS_LABEL]: "text-green-400",
  [AT_RISK_STATUS_LABEL]: "text-yellow-400",
  [OFF_TRACK_STATUS_LABEL]: "text-red-400",
};

const REWARD_ROW_STYLE = "bg-blue-400 bg-opacity-10";
const REWARD_CELL_STYLE =
  "bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300";
const WARNING_CELL_STYLE = "text-yellow-700";

// Weight Status
function _determineWeightStatusGainer({ weight, targetWeight }) {
  return weight + ON_TRACK_STATUS_BUFFER >= targetWeight
    ? ON_TRACK_STATUS_LABEL
    : weight + AT_RISK_STATUS_BUFFER >= targetWeight
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

function _determineWeightStatusCutter({ weight, targetWeight }) {
  return weight - ON_TRACK_STATUS_BUFFER <= targetWeight
    ? ON_TRACK_STATUS_LABEL
    : weight - AT_RISK_STATUS_BUFFER <= targetWeight
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

function determineWeightStatus({ weight, targetWeight, isGaining }) {
  if (!weight) {
    return NO_DATA_STATUS_LABEL;
  }
  return isGaining
    ? _determineWeightStatusGainer({ weight, targetWeight })
    : _determineWeightStatusCutter({ weight, targetWeight });
}

// Calorie Status
function _determineCalorieStatusGainer({ actual, target }) {
  return actual * ON_TRACK_CALORIE_BUFFER >= target
    ? ON_TRACK_STATUS_LABEL
    : actual * AT_RISK_CALORIE_BUFFER >= target
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

function _determineCalorieStatusCutter({ actual, target }) {
  return actual <= target * ON_TRACK_CALORIE_BUFFER
    ? ON_TRACK_STATUS_LABEL
    : actual <= target * AT_RISK_CALORIE_BUFFER
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

function determineCalorieStatus({ actual, target, isGaining }) {
  if (!actual) {
    return NO_DATA_STATUS_LABEL;
  }
  return isGaining
    ? _determineCalorieStatusGainer({ actual, target })
    : _determineCalorieStatusCutter({ actual, target });
}

// Protein Status
function determineProteinStatus({ actual, target }) {
  if (!actual) {
    return NO_DATA_STATUS_LABEL;
  }
  return actual * ON_TRACK_PROTEIN_BUFFER >= target
    ? ON_TRACK_STATUS_LABEL
    : actual * AT_RISK_PROTEIN_BUFFER >= target
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

// Exercise Status
function determineExerciseStatus({ actual, target }) {
  if (!actual) {
    return NO_DATA_STATUS_LABEL;
  }
  return actual + ON_TRACK_EXERCISE_BUFFER >= target
    ? ON_TRACK_STATUS_LABEL
    : actual + AT_RISK_EXERCISE_BUFFER >= target
    ? AT_RISK_STATUS_LABEL
    : OFF_TRACK_STATUS_LABEL;
}

function OverviewStatus({ isGaining, weight, targetWeight }) {
  const status = determineWeightStatus({
    weight,
    targetWeight,
    isGaining,
  });
  const statusColor = STATUS_LABEL_COLORS[status];
  return (
    <div className="flex px-6 max-w-md mx-auto space-x-2">
      <div className="uppercase tracking-widest text-gray-400 font-semibold">
        Status:
      </div>
      <div className={`uppercase tracking-widest font-semibold ${statusColor}`}>
        {status}
      </div>
    </div>
  );
}

function TableHeader({ styles, labels }) {
  const labelStyle = `${styles} text-right`;
  return (
    <thead>
      <tr>
        <th className={styles}>Metric</th>
        {labels.map((label) => (
          <th key={label} className={labelStyle}>
            {label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function OverviewDetailsRow({ label, actual, target, status }) {
  const baseStyle = "text-sm p-2";
  const valueStyle = "text-right";
  const warningStyle =
    status !== ON_TRACK_STATUS_LABEL ? STATUS_LABEL_COLORS[status] : "";
  const rewardRowStyle =
    status === ON_TRACK_STATUS_LABEL ? REWARD_ROW_STYLE : "";
  const rewardStyle =
    status === ON_TRACK_STATUS_LABEL
      ? "bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300"
      : "";
  return (
    <tr className={rewardRowStyle}>
      <td className={`${baseStyle} ${rewardStyle}`}>{label}</td>
      <td className={`${baseStyle} ${rewardStyle} ${valueStyle}`}>{actual}</td>
      <td className={`${baseStyle} ${rewardStyle} ${valueStyle}`}>{target}</td>
      <td
        className={`${baseStyle} ${rewardStyle} ${valueStyle} ${warningStyle} `}
      >
        {status}
      </td>
    </tr>
  );
}

function OverviewDetails({
  weight,
  targetWeight,
  weightStatus,
  calories,
  targetCalories,
  calorieStatus,
  protein,
  targetProtein,
  proteinStatus,
  exerciseDays,
  targetExerciseDays,
  exerciseStatus,
}) {
  const headerStyle =
    "p-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider";
  return (
    <div className="flex px-4 max-w-md mx-auto">
      <table className="flex-1 table-auto border-gray-500">
        <TableHeader
          styles={headerStyle}
          labels={["Actual", "Target", "Status"]}
        />
        <tbody>
          <OverviewDetailsRow
            label="Avg weight"
            actual={weight}
            target={targetWeight}
            status={weightStatus}
          />
          <OverviewDetailsRow
            label="Avg Calories"
            actual={calories}
            target={targetCalories}
            status={calorieStatus}
          />
          <OverviewDetailsRow
            label="Avg Protein (%)"
            actual={protein}
            target={targetProtein}
            status={proteinStatus}
          />
          <OverviewDetailsRow
            label="Days Exercised"
            actual={exerciseDays}
            target={targetExerciseDays}
            status={exerciseStatus}
          />
        </tbody>
      </table>
    </div>
  );
}

function Overview({
  isGaining,
  latestDays,
  latestWeights,
  latestTargetWeights,
  nutritionTargets,
}) {
  const weight = utils.round(
    utils.avg(latestWeights.map(([_, weight]) => weight)),
    1
  );
  const targetWeight = utils.round(
    utils.avg(latestTargetWeights.map(([_, weight]) => weight)),
    1
  );
  const totals = latestDays.map((x) => x.totals).filter((x) => x);

  const calories = utils.round(utils.avg(totals.map((x) => x.calories)), 0);
  const targetCalories = nutritionTargets.calories;

  const protein = utils.round(utils.avg(totals.map((x) => x.protein)), 0);
  const targetProtein = nutritionTargets.protein;
  const percProtein = utils.perc(protein * 4, calories);
  const targetPercProtein = utils.perc(targetProtein * 4, targetCalories);

  const _exerciseDays = latestDays.map((day) =>
    utils.extractDailyExercise(day.exercises)
  );
  const exerciseSummary = utils.dailyToWeeklyExerciseSummary(_exerciseDays);
  const exerciseDays = exerciseSummary.numDays;
  const targetExerciseDays = 7;

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Overview</Heading>
      <OverviewStatus
        isGaining={isGaining}
        weight={weight}
        targetWeight={targetWeight}
      />
      <OverviewDetails
        weight={weight}
        targetWeight={targetWeight}
        weightStatus={determineWeightStatus({
          weight,
          targetWeight,
          isGaining,
        })}
        calories={calories}
        targetCalories={targetCalories}
        calorieStatus={determineCalorieStatus({
          actual: calories,
          target: targetCalories,
          isGaining,
        })}
        protein={percProtein}
        targetProtein={targetPercProtein}
        proteinStatus={determineProteinStatus({
          actual: percProtein,
          target: targetPercProtein,
        })}
        exerciseDays={exerciseDays}
        targetExerciseDays={targetExerciseDays}
        exerciseStatus={determineExerciseStatus({
          actual: exerciseDays,
          target: targetExerciseDays,
        })}
      />
    </div>
  );
}

function Insights() {
  const winItemCl = "bg-blue-400 bg-opacity-10 px-2 py-1";
  const winTextCl =
    "bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-green-300";
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Insights</Heading>
      <div className="px-4 space-y-2">
        <div className="px-2 font-semibold">Wins</div>
        <div className="space-y-2">
          <div className="px-2 py-1">
            You’ve been on track 3 weeks in a row — keep up the good work!
          </div>
          <div className={winItemCl}>
            <span className={winTextCl}>
              You hit your lowest average weight this week at 143lb
            </span>
          </div>
          <div className={winItemCl}>
            <span className={winTextCl}>
              You hit your lowest bottom weight this week at 141lb
            </span>
          </div>
          <div className={winItemCl}>
            <span className={winTextCl}>
              You hit your lowest top weight this week at 145lb
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 space-y-2">
        <div className="px-2 font-semibold">Warnings</div>
        <div className="space-y-2">
          <div className="px-2 py-1">
            Your protein was 10% off your target (20% vs 30%) — let’s increase
            protein for next week!
          </div>
          <div className="px-2 py-1">
            You missed your exercise goal{" "}
            <span className="underline">3 weeks</span> in a row now. Let’s
            adjust your goal or fit in those workouts!
          </div>
          <div className="px-2 py-1">
            Your heaviest day was Friday at{" "}
            <span className="underline">150lb</span>, this was after eating 2000
            and 2100 calories, with 2000mg and 2500mg of sodium respectively the
            previous two days
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressPics({ pics }) {
  return (
    <div className="flex space-x-2 px-4">
      {pics.map(([url, label]) => (
        <div key={label} className="flex flex-1 flex-col space-y-2">
          <div className="flex-1">
            <FirebaseImage path={url} />
          </div>
          <div className="text-center text-sm">{label}</div>
        </div>
      ))}
    </div>
  );
}

function Reflection({ review }) {
  return (
    <div className="px-4 whitespace-pre-wrap">
      {review ||
        "No review submitted this week! Reviews are real helpful for providing context and looking back, so try to get these in!"}
    </div>
  );
}

function ProgressAndReflection({ activeWeekStart, pics, reviews }) {
  // Build Progress pics
  const progressPics = Object.entries(pics).filter(
    ([date, _]) =>
      new Date(
        utils.mostRecentWeekDayDate(
          utils
            .addDays(new Date(date), PIC_DAYS_BUFFER)
            .toLocaleDateString("en-US"),
          utils.GROUP_BY_WEEKDAY
        )
      ) <= new Date(activeWeekStart)
  );
  const activeProgressPics = new Set(
    [
      progressPics[0] && progressPics[0][1],
      progressPics[progressPics.length - 1] &&
        progressPics[progressPics.length - 1][1],
      progressPics[progressPics.length - 2] &&
        progressPics[progressPics.length - 2][1],
    ].filter((x) => x)
  );
  const labeledPics = utils.zip(
    [...activeProgressPics],
    ["Initial", "Latest", "Previous"]
  );
  // If three pics we show "Latest", "Previous", "Initial"
  // If two pics we show "Latest", "Initial"
  // Otherwise we just show "Initial"
  const orderedPics =
    labeledPics.length === 3
      ? labeledPics.slice(1).concat([labeledPics[0]])
      : labeledPics.length === 2
      ? labeledPics.slice().reverse()
      : labeledPics;

  // Build active Review
  // (TODO): Dealing with the various date forms is getting hairy,
  // beware the use of formatDateStr, importerDate, and toLocaleDateString
  const groupedReviews = Object.entries(reviews).reduce(
    (xs, [date, review]) => {
      const groupedDate = utils.mostRecentWeekDayDate(
        utils
          .addDays(new Date(date), REVIEW_DAYS_BUFFER)
          .toLocaleDateString("en-US"),
        utils.GROUP_BY_WEEKDAY
      );
      xs[groupedDate] = review;
      return xs;
    },
    {}
  );
  const activeReview = groupedReviews[activeWeekStart];

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Progress & Reflection</Heading>
      <ProgressPics pics={orderedPics} />
      <Reflection review={activeReview} />
    </div>
  );
}

function deltaCellValue(delta) {
  return delta ? (delta > 0 ? `+ ${delta}` : `- ${Math.abs(delta)}`) : "-";
}

function WeightOverviewTableDetailsRow({ label, current, prev, delta, isWin }) {
  const baseStyle = "text-sm p-1 py-2";
  const valueStyle = "text-right";
  const rewardRowStyle = isWin ? REWARD_ROW_STYLE : "";
  const rewardCellStyle = isWin ? REWARD_CELL_STYLE : "";
  const warningCellStyle = isWin || !delta ? "" : WARNING_CELL_STYLE;
  return (
    <tr className={rewardRowStyle}>
      <td className={`${baseStyle} ${rewardCellStyle}`}>{label}</td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {current}
      </td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {prev}
      </td>
      <td
        className={`${baseStyle} ${rewardCellStyle} ${valueStyle} ${warningCellStyle} `}
      >
        {deltaCellValue(delta)}
      </td>
    </tr>
  );
}

function WeightOverviewTable({ weights, isGaining }) {
  const thCl =
    "p-1 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider";
  const thValueCl = `${thCl} text-right`;

  const [currentWeights, prevWeights] = weights
    .map(([week, days]) =>
      days.map(([day, data]) => data).filter((x) => parseFloat(x))
    )
    .slice(0, 2);

  const numWeights = currentWeights ? currentWeights.length : 0;
  const numWeightsPrev = prevWeights ? prevWeights.length : 0;
  const numWeightsDelta = numWeights - numWeightsPrev;
  const numWeightsStatus = numWeights > numWeightsPrev || numWeights === 7;

  const avgWeights =
    currentWeights &&
    currentWeights.length > 0 &&
    utils.round(utils.avg(currentWeights), 1);
  const avgWeightsPrev =
    prevWeights &&
    prevWeights.length > 0 &&
    utils.round(utils.avg(prevWeights), 1);
  const avgWeightsDelta =
    avgWeights && avgWeightsPrev && utils.round(avgWeights - avgWeightsPrev, 1);
  const avgWeightsStatus =
    avgWeights &&
    avgWeightsPrev &&
    (isGaining ? avgWeights > avgWeightsPrev : avgWeights < avgWeightsPrev);

  const topWeights =
    currentWeights &&
    currentWeights.length > 0 &&
    utils.round(Math.max(...currentWeights), 1);
  const topWeightsPrev =
    prevWeights &&
    prevWeights.length > 0 &&
    utils.round(Math.max(...prevWeights), 1);
  const topWeightsDelta =
    topWeights && topWeightsPrev && utils.round(topWeights - topWeightsPrev, 1);
  const topWeightsStatus =
    topWeights &&
    topWeightsPrev &&
    (isGaining ? topWeights > topWeightsPrev : topWeights < topWeightsPrev);

  const bottomWeights =
    currentWeights &&
    currentWeights.length > 0 &&
    utils.round(Math.min(...currentWeights), 1);
  const bottomWeightsPrev =
    prevWeights &&
    prevWeights.length > 0 &&
    utils.round(Math.min(...prevWeights), 1);
  const bottomWeightsDelta =
    bottomWeights &&
    bottomWeightsPrev &&
    utils.round(bottomWeights - bottomWeightsPrev, 1);
  const bottomWeightsStatus =
    bottomWeights &&
    bottomWeightsPrev &&
    (isGaining
      ? bottomWeights > bottomWeightsPrev
      : bottomWeights < bottomWeightsPrev);

  return (
    <div className="flex px-4 max-w-md mx-auto">
      <table className="flex-1 table-auto border-gray-500">
        <thead>
          <tr>
            <th className={thCl}>Metric</th>
            <th className={thValueCl}>This Week</th>
            <th className={thValueCl}>Last Week</th>
            <th className={thValueCl}>Delta</th>
          </tr>
        </thead>
        <tbody>
          <WeightOverviewTableDetailsRow
            label="Weigh-ins"
            current={numWeights}
            prev={numWeightsPrev}
            delta={numWeightsDelta}
            isWin={numWeightsStatus}
          />
          <WeightOverviewTableDetailsRow
            label="Avg Weight"
            current={avgWeights}
            prev={avgWeightsPrev}
            delta={avgWeightsDelta}
            isWin={avgWeightsStatus}
          />
          <WeightOverviewTableDetailsRow
            label="Top Weight"
            current={topWeights}
            prev={topWeightsPrev}
            delta={topWeightsDelta}
            isWin={topWeightsStatus}
          />
          <WeightOverviewTableDetailsRow
            label="Bottom Weight"
            current={bottomWeights}
            prev={bottomWeightsPrev}
            delta={bottomWeightsDelta}
            isWin={bottomWeightsStatus}
          />
        </tbody>
      </table>
    </div>
  );
}

function WeightOverview({ weights, isGaining }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Weight</Heading>
      <WeightOverviewTable weights={weights} isGaining={isGaining} />
    </div>
  );
}

function weightFromDay([day, weight]) {
  return weight;
}
function weightsFromDays(days) {
  return days.map(weightFromDay);
}

function WeightRangeChart({ weights }) {
  const currentWeek = weights[0][0];

  // We offset weights to render ranges nicely
  const allWeights = weights
    .reduce((xs, [_week, days]) => xs.concat(weightsFromDays(days)), [])
    .filter((x) => parseFloat(x));
  const offsetWeight = Math.min(...allWeights) - 1;

  const data = weights.map(([week, days]) => ({
    x: utils.friendlyWeek(week, currentWeek),
    y: [
      utils.round(
        Math.min(...weightsFromDays(days).filter((x) => parseFloat(x))) -
          offsetWeight,
        1
      ),
      utils.round(
        Math.max(...weightsFromDays(days).filter((x) => parseFloat(x))) -
          offsetWeight,
        1
      ),
    ],
  }));

  const series = [{ data }];
  const options = {
    theme: {
      mode: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: false,
      },
      grid: {},
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
    tooltip: {
      enabled: false,
    },
    markers: {
      size: 0,
    },
    colors: ["#3B82F6", "#FBBF24"],
  };

  return (
    <div className="flex px-4">
      <div className="flex flex-col justify-around text-gray-300">
        {data.map(({ x }, idx) => (
          <div key={idx} className="text-xs">
            {x}
          </div>
        ))}
      </div>
      <div className="flex-1 items-center">
        <ApexChart
          type="rangeBar"
          series={series}
          options={options}
          height={100}
        />
      </div>
      <div className="flex flex-col justify-around  text-gray-300">
        {/* (TODO): Look deeper why we get Infinity values for when there is a missing week of data */}
        {data.map(({ y }, idx) => (
          <div key={idx} className="text-xs text-right">
            {y[0] !== Infinity && y[1] !== Infinity
              ? `${utils.round(y[0] + offsetWeight, 1)} - ${utils.round(
                  y[1] + offsetWeight,
                  1
                )}`
              : "-"}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeightRanges({ weights }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Weight Ranges</div>
      <WeightRangeChart weights={weights} />
    </div>
  );
}

function IntraWeekWeightsChart({ days }) {
  const weights = weightsFromDays(days);
  const offsetWeight = Math.min(...weights.filter((x) => parseFloat(x))) - 10;
  const x = utils.ORDERED_WEEKDAYS;
  const y = weights.map((y) => y && utils.round(y - offsetWeight, 1));

  const series = [
    {
      data: y,
      name: "Weight",
    },
  ];

  const options = {
    theme: {
      mode: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
      grid: {},
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const weight = utils.round(
          series[seriesIndex][dataPointIndex] + offsetWeight,
          1
        );
        // (TODO): Include previous day calories and previous data sodium in tooltip
        return `
          <div class="bg-blue-900 bg-opacity-50 p-4">
            <div>
              <span>Weight: </span>
              <span>${weight} lbs</span>
            </div>
          </div>
        `;
      },
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
    markers: {
      size: 0,
    },
    xaxis: {
      categories: x,
    },
    colors: ["#3B82F6", "#FBBF24"],
  };
  return (
    <div className="flex px-4">
      <div className="flex flex-col justify-around text-gray-300 pr-2">
        {x.map((day) => {
          return (
            <div key={day} className="text-sm">
              {day}
            </div>
          );
        })}
      </div>
      <div className="flex-1 items-center">
        <ApexChart type="bar" series={series} options={options} />
      </div>
      <div className="flex flex-col justify-around">
        {y.map((w, i) => {
          return (
            <div key={i} className="text-sm pl-2 text-gray-300">
              {(w && utils.round(w + offsetWeight, 1)) || "N/A"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function IntraWeekWeights({ days }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Daily Weigh-ins</div>
      <IntraWeekWeightsChart days={days} />
    </div>
  );
}

function WeightMonthlyInsights() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Monthly Insights</div>
      <div className="px-4">
        <div className="space-y-2">
          <div className="px-2 py-1">
            You weighed in <span className="underline">25</span> out of 28 days
          </div>
          <div className="px-2 py-1">
            Your average weight was <span className="underline">145lbs</span>{" "}
            these last four weeks vs <span className="underline">150lbs</span>{" "}
            the previous four weeks
          </div>
          <div className="px-2 py-1">
            You weighed between 140 - 150lbs these last four weeks vs 145 -
            155lbs the previous four weeks
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionGoals({ targets }) {
  const { calories, carbohydrates, fat, protein, sodium } = targets;
  const targetCarbs = utils.perc(carbohydrates * 4, calories);
  const targetFats = utils.perc(fat * 9, calories);
  const targetProteins = utils.perc(protein * 4, calories);

  const labelCl =
    "text-left text-xs font-semibold text-gray-400 uppercase tracking-wider";
  const valueCl = "text-sm p-1 text-left";
  return (
    <div className="flex px-2 max-w-md mx-auto">
      <table className="flex-1 mx-auto table-auto">
        <tbody>
          <tr>
            <td className={labelCl}>Target Average Calories</td>
            <td className={valueCl}>{calories}</td>
          </tr>
          <tr>
            <td className={labelCl}>Target Daily Calorie Range</td>
            <td className={valueCl}>
              {utils.round(calories * 0.8, 0)} -{" "}
              {utils.round(calories * 1.2, 0)}
            </td>
          </tr>
          <tr>
            <td className={labelCl}>Target % Carbs / Fat / Protein</td>
            <td className={valueCl}>
              {targetCarbs} / {targetFats} / {targetProteins}
            </td>
          </tr>
          <tr>
            <td className={labelCl}>Target Sodium</td>
            <td className={valueCl}>{sodium} mg</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function NutritionOverviewTableRow({
  label,
  current,
  prev,
  delta,
  isWin,
  isWarning,
  deltaSuffix,
}) {
  const baseStyle = "text-sm p-1 py-2";
  const valueStyle = "text-right";
  const rewardRowStyle = isWin ? REWARD_ROW_STYLE : "";
  const rewardCellStyle = isWin ? REWARD_CELL_STYLE : "";
  const warningCellStyle = !isWarning || !delta ? "" : WARNING_CELL_STYLE;
  return (
    <tr className={rewardRowStyle}>
      <td className={`${baseStyle} ${rewardCellStyle}`}>{label}</td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {current}
      </td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {prev}
      </td>
      <td
        className={`${baseStyle} ${rewardCellStyle} ${valueStyle} ${warningCellStyle} `}
      >
        {deltaCellValue(delta)}
        {deltaSuffix}
      </td>
    </tr>
  );
}

function avgMetric({ arr, precision }) {
  return arr && arr.length > 0 && utils.round(utils.avg(arr), precision);
}
function deltaMetric({ current, prev, precision }) {
  return current && prev && utils.round(current - prev, precision);
}

function NutritionOverviewTable({ nutrition, targets, isGaining }) {
  const thCl =
    "p-1 py-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider";
  const thValueCl = `${thCl} text-right`;

  const activeNutrition = nutrition
    .map(([week, days]) => days.map(([day, data]) => data).filter((x) => x))
    .slice(0, 4);
  const currentNutrition = activeNutrition[0];
  const prevNutrition = activeNutrition[1] || [];

  const numNutrition = currentNutrition ? currentNutrition.length : 0;
  const numNutritionPrev = prevNutrition ? prevNutrition.length : 0;
  const numNutritionDelta = numNutrition - numNutritionPrev;

  // Target Macros %
  const targetCarbsPerc = utils.perc(
    targets.carbohydrates * 4,
    targets.calories
  );
  const targetFatsPerc = utils.perc(targets.fat * 9, targets.calories);
  const targetProteinsPerc = utils.perc(targets.protein * 4, targets.calories);

  // Calories
  const avgCalories = avgMetric({
    arr: currentNutrition.map((x) => x.calories),
    precision: 0,
  });
  const avgCaloriesPrev = avgMetric({
    arr: prevNutrition.map((x) => x.calories),
    precision: 0,
  });
  const avgCaloriesDelta = deltaMetric({
    current: avgCalories,
    prev: avgCaloriesPrev,
    precision: 0,
  });

  const avgCaloriesWin =
    avgCalories >= 0.9 * targets.calories &&
    avgCalories <= 1.1 * targets.calories;
  const avgCaloriesWarning =
    !avgCalories &&
    (isGaining ? avgCalories < avgCaloriesPrev : avgCalories > avgCaloriesPrev);

  // Carbs
  const avgCarbs = avgMetric({
    arr: currentNutrition.map((x) => x.carbohydrates),
    precision: 0,
  });
  const avgCarbsPrev = avgMetric({
    arr: prevNutrition.map((x) => x.carbohydrates),
    precision: 0,
  });
  const avgCarbsPerc =
    avgCarbs && avgCalories && utils.perc(avgCarbs * 4, avgCalories);
  const avgCarbsPrevPerc =
    avgCarbsPrev &&
    avgCaloriesPrev &&
    utils.perc(avgCarbsPrev * 4, avgCaloriesPrev);
  const avgCarbsDelta = deltaMetric({
    current: avgCarbsPerc,
    prev: avgCarbsPrevPerc,
    precision: 0,
  });
  const avgCarbsWin =
    avgCarbsPerc >= 0.9 * targetCarbsPerc &&
    avgCarbsPerc <= 1.1 * targetCarbsPerc;

  // Fats
  const avgFats = avgMetric({
    arr: currentNutrition.map((x) => x.fat),
    precision: 0,
  });
  const avgFatsPrev = avgMetric({
    arr: prevNutrition.map((x) => x.fat),
    precision: 0,
  });
  const avgFatsPerc =
    avgFats && avgCalories && utils.perc(avgFats * 9, avgCalories);
  const avgFatsPrevPerc =
    avgFatsPrev &&
    avgCaloriesPrev &&
    utils.perc(avgFatsPrev * 9, avgCaloriesPrev);
  const avgFatsDelta = deltaMetric({
    current: avgFatsPerc,
    prev: avgFatsPrevPerc,
    precision: 0,
  });
  const avgFatsWin =
    avgFatsPerc >= 0.9 * targetFatsPerc && avgFatsPerc <= 1.1 * targetFatsPerc;

  // Proteins
  const avgProteins = avgMetric({
    arr: currentNutrition.map((x) => x.protein),
    precision: 0,
  });
  const avgProteinsPrev = avgMetric({
    arr: prevNutrition.map((x) => x.protein),
    precision: 0,
  });
  const avgProteinsPerc =
    avgProteins && avgCalories && utils.perc(avgProteins * 4, avgCalories);
  const avgProteinsPrevPerc =
    avgProteinsPrev &&
    avgCaloriesPrev &&
    utils.perc(avgProteinsPrev * 4, avgCaloriesPrev);
  const avgProteinsDelta = deltaMetric({
    current: avgProteinsPerc,
    prev: avgProteinsPrevPerc,
    precision: 0,
  });
  const avgProteinsWin = avgProteinsPerc >= targetProteinsPerc * 0.9;

  // Sodium
  const avgSodium = avgMetric({
    arr: currentNutrition.map((x) => x.sodium),
    precision: 0,
  });
  const avgSodiumPrev = avgMetric({
    arr: prevNutrition.map((x) => x.sodium),
    precision: 0,
  });
  const avgSodiumDelta = deltaMetric({
    current: avgSodium,
    prev: avgSodiumPrev,
    precision: 0,
  });
  const avgSodiumWin = avgSodium <= targets.sodium * 1.1;

  // Low Days
  const numLowDays = currentNutrition
    ? currentNutrition.filter((x) => x.calories < targets.calories * 0.8).length
    : null;
  const numLowDaysPrev = prevNutrition
    ? prevNutrition.filter((x) => x.calories < targets.calories * 0.8).length
    : null;
  const numLowDaysDelta = numLowDays - numLowDaysPrev;

  // Target Days
  const numTargetDays = currentNutrition
    ? currentNutrition.filter(
        (x) =>
          x.calories >= targets.calories * 0.8 &&
          x.calories <= targets.calories * 1.2
      ).length
    : null;
  const numTargetDaysPrev = prevNutrition
    ? prevNutrition.filter(
        (x) =>
          x.calories >= targets.calories * 0.8 &&
          x.calories <= targets.calories * 1.2
      ).length
    : null;
  const numTargetDaysDelta = numTargetDays - numTargetDaysPrev;

  // High Days
  const numHighDays = currentNutrition
    ? currentNutrition.filter((x) => x.calories > targets.calories * 1.2).length
    : null;
  const numHighDaysPrev = prevNutrition
    ? prevNutrition.filter((x) => x.calories > targets.calories * 1.2).length
    : null;
  const numHighDaysDelta = numHighDays - numHighDaysPrev;

  return (
    <div className="flex px-4 max-w-md mx-auto">
      <table className="flex-1 table-auto border-gray-500">
        <thead>
          <tr>
            <th className={thCl}>Metric</th>
            <th className={thValueCl}>This Week</th>
            <th className={thValueCl}>Last Week</th>
            <th className={thValueCl}>Delta</th>
          </tr>
        </thead>
        <tbody>
          <NutritionOverviewTableRow
            label="Days Logged"
            current={numNutrition}
            prev={numNutritionPrev}
            delta={numNutritionDelta}
            isWin={numNutrition === 7}
            isWarning={numNutrition < numNutritionPrev}
          />
          <NutritionOverviewTableRow
            label="Avg Calories"
            current={avgCalories}
            prev={avgCaloriesPrev}
            delta={avgCaloriesDelta}
            isWin={avgCaloriesWin}
            isWarning={avgCaloriesWarning}
          />
          <NutritionOverviewTableRow
            label="Avg Carbs"
            current={avgCarbs ? `${avgCarbs}g (${avgCarbsPerc}%)` : ""}
            prev={avgCarbsPrev ? `${avgCarbsPrev}g (${avgCarbsPrevPerc}%)` : ""}
            delta={avgCarbsDelta}
            deltaSuffix={avgCarbsDelta ? "%" : ""}
            isWin={avgCarbsWin}
          />
          <NutritionOverviewTableRow
            label="Avg Fats"
            current={avgFats ? `${avgFats}g (${avgFatsPerc}%)` : ""}
            prev={avgFatsPrev ? `${avgFatsPrev}g (${avgFatsPrevPerc}%)` : ""}
            delta={avgFatsDelta}
            deltaSuffix={avgFatsDelta ? "%" : ""}
            isWin={avgFatsWin}
          />
          <NutritionOverviewTableRow
            label="Avg Protein"
            current={avgProteins ? `${avgProteins}g (${avgProteinsPerc}%)` : ""}
            prev={
              avgProteinsPrev
                ? `${avgProteinsPrev}g (${avgProteinsPrevPerc}%)`
                : ""
            }
            delta={avgProteinsDelta}
            deltaSuffix={avgProteinsDelta ? "%" : ""}
            isWin={avgProteinsWin}
          />
          <NutritionOverviewTableRow
            label="Avg Sodium"
            current={avgSodium ? `${avgSodium}mg` : ""}
            prev={avgSodiumPrev ? `${avgSodiumPrev}mg` : ""}
            delta={avgSodiumDelta}
            deltaSuffix={avgSodiumDelta ? "mg" : ""}
            isWin={avgSodiumWin}
            isWarning={!avgSodiumWin && avgSodium > avgSodiumPrev}
          />
          <NutritionOverviewTableRow
            label="Low Days"
            current={numLowDays}
            prev={numLowDaysPrev}
            delta={numLowDaysDelta}
            isWin={numLowDays === 0}
          />
          <NutritionOverviewTableRow
            label="Target Days"
            current={numTargetDays}
            prev={numTargetDaysPrev}
            delta={numTargetDaysDelta}
            isWin={numTargetDays === 7}
          />
          <NutritionOverviewTableRow
            label="High Days"
            current={numHighDays}
            prev={numHighDaysPrev}
            delta={numHighDaysDelta}
            isWin={numHighDays === 0}
          />
        </tbody>
      </table>
    </div>
  );
}

function NutritionOverview({ targets, nutrition, isGaining }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Nutrition</Heading>
      <NutritionGoals targets={targets} />
      <NutritionOverviewTable
        nutrition={nutrition}
        targets={targets}
        isGaining={isGaining}
      />
    </div>
  );
}

// TODO: weekly calories legend and these colors also in Stats.js -- see about reuse
const LOW_COLOR = "bg-blue-200";
const TARGET_COLOR = "bg-blue-600";
const HIGH_COLOR = "bg-red-500";
const NO_DATA_COLOR = "bg-white";
const WIN_BG = "bg-gradient-to-r from-green-500 to-green-300";
const WIN_TEXT_CL = `bg-clip-text text-transparent ${WIN_BG}`;
const WIN_BOXES = utils.fill({ val: WIN_BG, n: 7 });

function WeeklyCaloriesLegend() {
  return (
    <Legend
      items={[
        [NO_DATA_COLOR, "No Data"],
        [LOW_COLOR, "Low"],
        [TARGET_COLOR, "Target"],
        [HIGH_COLOR, "High"],
      ]}
    />
  );
}

function BoxGrid({ rows, boxLabels }) {
  return (
    <table>
      <tbody>
        {rows.map((row, i) => {
          return (
            <tr className={row.rowClassName} key={i}>
              <td className={`whitespace-nowrap text-sm text-gray-300 p-2`}>
                <div className={row.leftLabelClassName}>{row.leftLabel}</div>
              </td>
              <td className="w-full">
                <div className="flex justify-between">
                  {row.boxes.map((box, i) => {
                    return (
                      <div key={i} className={`${box} w-7 h-7 rounded`}></div>
                    );
                  })}
                </div>
              </td>
              <td className="whitespace-nowrap text-sm text-gray-300 p-2">
                <div className={row.rightLabelClassName}>{row.rightLabel}</div>
              </td>
            </tr>
          );
        })}
        <tr>
          <td />
          <td className="w-full">
            <div className="flex justify-between">
              {boxLabels.map((label, i) => {
                return (
                  <div className="text-gray-300 w-7 h-7 text-center" key={i}>
                    {label}
                  </div>
                );
              })}
            </div>
          </td>
          <td />
        </tr>
      </tbody>
    </table>
  );
}

function WeeklyCaloriesTable({ calories, target }) {
  const rows = calories.map(([week, days]) => {
    const rawCalories = days.map(([_, calories]) => calories);
    const rawBoxes = rawCalories.map((x) =>
      colorForCalories({ calories: x, target: target })
    );
    const isWin = rawBoxes.every((x) => x === TARGET_COLOR);

    return {
      leftLabel: utils.friendlyWeek(week),
      boxes: isWin ? WIN_BOXES : rawBoxes,
      rightLabel: `${avgMetric({ arr: rawCalories, precision: 0 })} cal`,
      rowClassName: isWin ? "bg-blue-400 bg-opacity-10" : "",
      leftLabelClassName: isWin ? WIN_TEXT_CL : "",
      rightLabelClassName: isWin ? WIN_TEXT_CL : "",
    };
  });

  const boxLabels = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];
  return <BoxGrid boxLabels={boxLabels} rows={rows} />;
}

function WeeklyCalories({ calories, target }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Weekly Calories</div>
      <WeeklyCaloriesLegend />
      <WeeklyCaloriesTable calories={calories} target={target} />
    </div>
  );
}

function WeeklyProteinTable({ proteins, target }) {
  const rows = proteins.map(([week, days]) => {
    const rawProteins = days.map(([_, proteins]) => proteins);
    const rawBoxes = rawProteins.map((x) =>
      colorForProteins({ proteins: x, target: target })
    );
    const isWin = rawBoxes.every((x) => x === TARGET_COLOR);

    return {
      leftLabel: utils.friendlyWeek(week),
      boxes: isWin ? WIN_BOXES : rawBoxes,
      rightLabel: `${avgMetric({ arr: rawProteins, precision: 0 })}%`,
      rowClassName: isWin ? "bg-blue-400 bg-opacity-10" : "",
      leftLabelClassName: isWin ? WIN_TEXT_CL : "",
      rightLabelClassName: isWin ? WIN_TEXT_CL : "",
    };
  });

  const boxLabels = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];
  return <BoxGrid boxLabels={boxLabels} rows={rows} />;
}

function WeeklyProteinLegend() {
  return (
    <Legend
      items={[
        [NO_DATA_COLOR, "No Data"],
        [HIGH_COLOR, "Miss"],
        [TARGET_COLOR, "Target"],
      ]}
    />
  );
}

function WeeklyProtein({ proteins, target }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Weekly Protein</div>
      <WeeklyProteinLegend />
      <WeeklyProteinTable proteins={proteins} target={target} />
    </div>
  );
}

function NutritionMonthlyInsights() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Monthly Insights</div>
      <div className="px-4">
        <div className="space-y-2">
          <div className="px-2 py-1">
            You weighed in <span className="underline">25</span> out of 28 days
          </div>
          <div className="px-2 py-1">
            Your ate an average of 2000 calories these last four weeks vs 2100
            calories the previous four weeks
          </div>
        </div>
      </div>
    </div>
  );
}

function ExerciseOverviewTableRow({
  label,
  current,
  prev,
  delta,
  isWin,
  isWarning,
}) {
  const baseStyle = "text-sm p-1 py-2";
  const valueStyle = "text-right";
  const rewardRowStyle = isWin ? REWARD_ROW_STYLE : "";
  const rewardCellStyle = isWin ? REWARD_CELL_STYLE : "";
  const warningCellStyle = !isWarning || !delta ? "" : WARNING_CELL_STYLE;
  return (
    <tr className={rewardRowStyle}>
      <td className={`${baseStyle} ${rewardCellStyle}`}>{label}</td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {current}
      </td>
      <td className={`${baseStyle} ${rewardCellStyle} ${valueStyle}`}>
        {prev}
      </td>
      <td
        className={`${baseStyle} ${rewardCellStyle} ${valueStyle} ${warningCellStyle} `}
      >
        {deltaCellValue(delta)}
      </td>
    </tr>
  );
}

function ExerciseOverviewTable({ exercises }) {
  const thCl =
    "p-2 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider";
  const thValueCl = `${thCl} text-right`;

  const activeExercises = exercises
    .map(([week, days]) => days.map(([day, data]) => data).filter((x) => x))
    .slice(0, 4);
  const currentExercises = activeExercises[0];
  const prevExercises = activeExercises[1] || [];

  const numDaysExercises = currentExercises.filter(([_, time]) => time > 0)
    .length;
  const numDaysExercisesPrev = prevExercises.filter(([_, time]) => time > 0)
    .length;
  const numDaysExercisesDelta = numDaysExercises - numDaysExercisesPrev;

  const hoursExercises = utils.round(
    currentExercises.reduce((total, [_, minutes]) => (total += minutes), 0) /
      60,
    1
  );
  const hoursExercisesPrev = utils.round(
    prevExercises.reduce((total, [_, minutes]) => (total += minutes), 0) / 60,
    1
  );
  const hoursExercisesDelta = utils.round(
    hoursExercises - hoursExercisesPrev,
    1
  );

  const exerciseCounts = currentExercises.reduce((counts, [names, _]) => {
    names.forEach((name) => {
      counts[name] = counts[name] || 0;
      counts[name] += 1;
    });
    return counts;
  }, {});
  const exerciseCountsPrev = prevExercises.reduce((counts, [names, _]) => {
    names.forEach((name) => {
      counts[name] = counts[name] || 0;
      counts[name] += 1;
    });
    return counts;
  }, {});
  const exerciseCountsDelta = Object.keys(exerciseCounts).reduce(
    (counts, exName) => {
      counts[exName] =
        exerciseCounts[exName] - (exerciseCountsPrev[exName] || 0);
      return counts;
    },
    {}
  );

  return (
    <div className="flex px-4 max-w-md mx-auto">
      <table className="flex-1 table-auto border-gray-500">
        <thead>
          <tr>
            <th className={thCl}>Metric</th>
            <th className={thValueCl}>This Week</th>
            <th className={thValueCl}>Last Week</th>
            <th className={thValueCl}>Delta</th>
          </tr>
        </thead>
        <tbody>
          <ExerciseOverviewTableRow
            label="Days exercised"
            current={numDaysExercises}
            prev={numDaysExercisesPrev}
            delta={numDaysExercisesDelta}
            isWin={numDaysExercises === 7}
            isWarning={numDaysExercises < numDaysExercisesPrev}
          />
          <ExerciseOverviewTableRow
            label="Hours exercised"
            current={hoursExercises}
            prev={hoursExercisesPrev}
            delta={hoursExercisesDelta}
            isWin={hoursExercises >= 7}
            isWarning={
              hoursExercises < 7 && hoursExercises < hoursExercisesPrev
            }
          />
          {Object.entries(exerciseCounts).map(([name, count]) => (
            <ExerciseOverviewTableRow
              key={name}
              label={`# ${name}`}
              current={count}
              prev={exerciseCountsPrev[name]}
              delta={exerciseCountsDelta[name]}
              isWarning={count < exerciseCountsPrev[name]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExerciseOverview({ exercises }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Heading>Exercise</Heading>
      <ExerciseOverviewTable exercises={exercises} />
    </div>
  );
}

function WeeklyExerciseLegend() {
  return (
    <Legend
      items={[
        [NO_DATA_COLOR, "No Data"],
        [HIGH_COLOR, "< 30 min"],
        [LOW_COLOR, "< 1hr"],
        [TARGET_COLOR, "1 hr+"],
      ]}
    />
  );
}

function WeeklyExerciseTable({ exerciseTimes }) {
  const rows = exerciseTimes.map(([week, days]) => {
    const rawTimes = days.map(([_, time]) => time);
    const rawBoxes = rawTimes.map((x) => colorForExercise(x));
    const isWin = rawBoxes.every((x) => x === TARGET_COLOR);

    return {
      leftLabel: utils.friendlyWeek(week),
      boxes: isWin ? WIN_BOXES : rawBoxes,
      rightLabel: `${avgMetric({ arr: rawTimes, precision: 0 })} min`,
      rowClassName: isWin ? "bg-blue-400 bg-opacity-10" : "",
      leftLabelClassName: isWin ? WIN_TEXT_CL : "",
      rightLabelClassName: isWin ? WIN_TEXT_CL : "",
    };
  });

  const boxLabels = ["M", "Tu", "W", "Th", "F", "Sa", "Su"];
  return <BoxGrid boxLabels={boxLabels} rows={rows} />;
}

function WeeklyExercise({ exerciseTimes }) {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Weekly Exercise</div>
      <WeeklyExerciseLegend />
      <WeeklyExerciseTable exerciseTimes={exerciseTimes} />
    </div>
  );
}

function ExerciseMonthlyInsights() {
  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="font-semibold text-center">Monthly Insights</div>
      <div className="px-4">
        <div className="space-y-2">
          <div className="px-2 py-1">
            You exercised <span className="underline">26</span> out of the last
            28 days, exercising for one hour or more for 15 days.
          </div>
          <div className="px-2 py-1">
            You averaged 8 hours of exercise per week for the last 4 weeks
          </div>
        </div>
      </div>
    </div>
  );
}

const NUM_ACTIVE_WEEKS = 4;

function extractActiveNutrition(activeMFP) {
  return activeMFP.map(([week, days]) => [
    week,
    days.map(([day, { totals }]) => [day, totals]),
  ]);
}

function extractActiveCalories(activeMFP) {
  return activeMFP.map(([week, days]) => [
    week,
    days.map(([day, { totals }]) => [day, totals && totals.calories]),
  ]);
}

function extractActiveProtein(activeMFP) {
  return activeMFP.map(([week, days]) => [
    week,
    days.map(([day, { totals }]) => [
      day,
      totals && utils.perc(totals.protein * 4, totals.calories),
    ]),
  ]);
}

function extractActiveExercises(activeMFP) {
  return activeMFP.map(([week, days]) => [
    week,
    days.map(([day, { exercises }]) => [
      day,
      utils.extractDailyExercise(exercises),
    ]),
  ]);
}

function extractActiveExerciseTime(activeMFP) {
  return activeMFP.map(([week, days]) => [
    week,
    days.map(([day, { exercises }]) => [
      day,
      (exercises &&
        exercises.reduce((total, { minutes }) => (total += minutes || 0), 0)) ||
        0,
    ]),
  ]);
}

export default function Report({ data }) {
  useLogPageLoad("load-report");
  const info = data["profile"];
  const units = info["ideal-metric"];
  const days = data["mfp-results"];
  const weights = data["weights"];
  const reviews = data["reviews"];

  const activeDays = utils.removeCurrentWeek(utils.sortedWeeks(days));
  const [activeWeekIdx, setActiveWeekIdx] = useState(activeDays.length - 1);
  const activeWeekStart = utils.mostRecentWeekDayDate(
    utils.minDate(activeDays[activeWeekIdx].map((x) => x[0])),
    utils.GROUP_BY_WEEKDAY
  );
  const latestDays = activeDays[activeWeekIdx].map((x) => x[1]);

  const isGaining = info["mode"] === "bulk";
  const nutritionTargets = info["target-nutrition"];

  // Build Weights
  const groupedWeights = Object.entries(
    utils.groupDays(
      utils.cleanLoggedWeightMap({ weightMap: weights, units }),
      utils.GROUP_BY_WEEKDAY,
      utils.TODAY
    )
  ).sort(utils.dateEntrySort);
  const activeWeights = groupedWeights
    .slice(Math.max(0, activeWeekIdx - NUM_ACTIVE_WEEKS + 1), activeWeekIdx + 1)
    .reverse();
  const latestWeights = activeWeights[0][1];

  // Build targetWeights
  // (TODO): Considering using a data structure to generate / store this once
  // and then have other places in the codebase use it
  const earliestDate = utils.minDate(
    Object.keys(weights)
      .filter((d) => weights[d])
      .map((d) => utils.formatDateStr(d))
  );
  const startWeight = parseFloat(weights[utils.importerDate(earliestDate)]);
  const targetWeights = utils.buildDailyTargetWeightMap({
    startDate: earliestDate,
    endDate: utils.COHORT_END_DATE,
    startWeight,
    endWeight: info["target-weight"],
  });
  const groupedTargetWeights = Object.entries(
    utils.groupDays(targetWeights, utils.GROUP_BY_WEEKDAY, utils.TODAY)
  ).sort(utils.dateEntrySort);
  const activeTargetWeights = groupedTargetWeights.slice(
    Math.max(0, activeWeekIdx - NUM_ACTIVE_WEEKS + 1),
    activeWeekIdx + 1
  );
  const latestTargetWeights =
    activeTargetWeights[activeTargetWeights.length - 1][1];

  // Build mfp data
  const groupedMFP = Object.entries(
    utils.groupDays(days, utils.GROUP_BY_WEEKDAY, utils.TODAY)
  ).sort(utils.dateEntrySort);
  const activeMFP = groupedMFP
    .slice(Math.max(0, activeWeekIdx - NUM_ACTIVE_WEEKS + 1), activeWeekIdx + 1)
    .reverse();
  const activeNutrition = extractActiveNutrition(activeMFP);
  const activeCalories = extractActiveCalories(activeMFP);
  const activeProteins = extractActiveProtein(activeMFP);
  const activeExercises = extractActiveExercises(activeMFP);
  const activeExerciseTimes = extractActiveExerciseTime(activeMFP);

  return (
    <div className="space-y-4">
      <WeeklyNavigation
        weeks={activeDays}
        activeWeekIdx={activeWeekIdx}
        onIdxChange={(idx) => setActiveWeekIdx(idx)}
      />
      {/* (TODO): Remove gates for Goal and Overview once we update everyone's targets */}
      {false && (
        <Goal
          goal={isGaining ? "Bulk" : "Cut"}
          targetWeight={`${utils.weightInPrefUnits({
            lbs: info["target-weight"],
            units: info["ideal-metric"],
          })} ${info["ideal-metric"]}`}
          targetDate={utils.shortFriendlyDate(
            utils.COHORT_END_DATE.toLocaleDateString("en-US")
          )}
        />
      )}
      {false && (
        <Overview
          isGaining={isGaining}
          latestDays={latestDays}
          latestTargetWeights={latestTargetWeights}
          latestWeights={latestWeights}
          nutritionTargets={nutritionTargets}
        />
      )}
      {false && <Insights />}
      <ProgressAndReflection
        activeWeekStart={activeWeekStart}
        pics={data["progress-pics"]}
        reviews={reviews}
      />
      <WeightOverview weights={activeWeights} isGaining={isGaining} />
      <WeightRanges weights={activeWeights} />
      <IntraWeekWeights days={latestWeights} />
      {false && <WeightMonthlyInsights />}
      <NutritionOverview
        targets={nutritionTargets}
        nutrition={activeNutrition}
        isGaining={isGaining}
      />
      <WeeklyCalories
        calories={activeCalories}
        target={nutritionTargets.calories}
      />
      <WeeklyProtein
        proteins={activeProteins}
        target={utils.perc(
          nutritionTargets.protein * 4,
          nutritionTargets.calories
        )}
      />
      {false && <NutritionMonthlyInsights />}
      <ExerciseOverview exercises={activeExercises} />
      <WeeklyExercise exerciseTimes={activeExerciseTimes} />
      {false && <ExerciseMonthlyInsights />}
    </div>
  );
}
