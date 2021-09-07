import { useContext } from "react";
import { useTests } from "./shared/api";
import { calcScore } from "./shared/quizUtils";
import UserContext from "./shared/UserContext";

export default function StatsPage() {
  const user = useContext(UserContext);
  const [isLoading, tests] = useTests(user);
  if (isLoading) {
    return <div className="max-w-sm mx-auto p-4 space-y-4 flex-1">...</div>
  }

  const dateAndScore = Object.entries(tests)
    .sort((entryA, entryB) => entryB[0] - entryA[0])
    .map(([at, test]) => {
      return [new Date(+at), calcScore(test.qs)];
    });
  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
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
    </div>
  );
}
