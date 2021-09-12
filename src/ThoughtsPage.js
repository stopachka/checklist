import { useContext, useState, useEffect } from "react";
import { saveThought } from "./shared/api";
import Button from "./shared/Button";
import UserContext from "./shared/UserContext";
import { useHistory } from "react-router-dom";

const QS = [
  [
    "Briefly describe the actual situation",
    "Potential customer hung up on me",
    "situation",
  ],
  [
    "What emotions did you feel, and how severe was it?",
    "Angry 50%, Sad 90%",
    "initialEmotions",
  ],
  [
    "Write down the automatic thoughts that occured",
    "I'll never sell a policy",
    "automaticThoughts",
  ],
  ["What were the cognitive distortions?", "Overgeneralization", "distortions"],
  [
    "What are some rational responses here?",
    "I've sold a lot of policies",
    "rationalResponses",
  ],
  ["Outcome: How do you feel now?", "Angry 10%, Sad 20%", "outcome"],
];

export default function ThoughtsPage() {
  const user = useContext(UserContext);
  const history = useHistory();
  const [data, setData] = useState({});
  return (
    <div className="max-w-sm mx-auto">
      <form
        className="space-y-4 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          const toSave = {
            qs: QS.map(([q, _, k]) => {
              return { q, k, a: data[k] || null };
            }),
          };
          saveThought(user, toSave).then(() => {
            history.push("/log");
          });
        }}>
        {QS.map(([q, placeholder, k], idx) => {
          return (
            <div key={k} className="space-y-2">
              <h3 className="font-bold">
                {idx + 1}. {q}
              </h3>
              <textarea
                className="
                  bg-gray-700
                  text-gray-200
                  w-full
                  h-24
                "
                placeholder={placeholder}
                value={data[k] || ""}
                onChange={(e) => setData({ ...data, [k]: e.target.value })}
              />
            </div>
          );
        })}
        <Button type="submit">Save</Button>
      </form>
    </div>
  );
}
