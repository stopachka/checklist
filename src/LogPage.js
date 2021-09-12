import { useContext } from "react";
import { useTests, useThoughts } from "./shared/api";
import { calcScore } from "./shared/quizUtils";
import UserContext from "./shared/UserContext";

export default function LogPage() {
  const user = useContext(UserContext);
  const [isLoadingTests, tests] = useTests(user);
  const [isLoadingThoughts, thoughts] = useThoughts(user);
  if (isLoadingTests || isLoadingThoughts) {
    return <div className="max-w-sm mx-auto p-4 space-y-4 flex-1">...</div>;
  }

  const dateAndScore = Object.entries(tests)
    .sort((entryA, entryB) => entryB[0] - entryA[0])
    .map(([at, test]) => {
      return [new Date(+at), calcScore(test.qs)];
    });
  const dateAndThoughtQs = Object.entries(thoughts)
    .sort((entryA, entryB) => entryB[0] - entryA[0])
    .map(([at, x]) => {
      return [new Date(+at), x.qs];
    });

  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      <h3 className="font-bold">Quiz Scores</h3>
      <table className="table-auto w-full space-y-2">
        {dateAndScore.length ? (
          dateAndScore.map(([date, score]) => {
            return (
              <tr key={+date}>
                <td className="font-semibold">
                  {date.toLocaleDateString("en-US")}
                </td>
                <td className=" text-right font-semibold">{score}</td>
              </tr>
            );
          })
        ) : (
          <div>No tests taken yet!</div>
        )}
      </table>
      <h3 className="font-bold">Thought Logs</h3>
      <div>
        {dateAndThoughtQs.map(([date, qs]) => {
          return (
            <div>
              <div className="font-bold font-sm">
                {date.toLocaleDateString("en-US")}
              </div>
              <div>
                {qs.map(({ q, k, a }) => {
                  return (
                    <div key={k} className="text-sm">
                      <div className="text-gray-300">{q}</div>
                      <div>{a || "N/A"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
