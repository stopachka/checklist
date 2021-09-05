import { useContext, useState } from "react";
import { saveQuiz } from "./shared/api";
import Button from "./shared/Button";
import UserContext from "./shared/UserContext";
import { useHistory } from "react-router-dom";
import { calcScore } from "./shared/quizUtils";

const makeFormData = () => [
  {
    q: "Feeling sad or down in the dumps",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Feeling unhappy or blue",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Crying spells or tearfulness",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Feeling discouraged",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Feeling hopeless",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Low self-esteem",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Feeling worthless or inadequate",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Guilt or shame",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Criticizing yourself or blaming",
    cat: "Thoughts and Feelings",
  },
  {
    q: "Loss of interest in family, friends or colleagues",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Loneliness",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Spending less time with family or friends",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Loss of motivation",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Loss of interest in work or other activities",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Avoiding work or other activities",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Loss of pleasure or satisfaction in life",
    cat: "Activities and Personal Relationships",
  },
  {
    q: "Feeling tired",
    cat: "Physical Symptoms",
  },
  {
    q: "Difficulty sleeping or sleeping too much",
    cat: "Physical Symptoms",
  },
  {
    q: "Decreased or increased appetite",
    cat: "Physical Symptoms",
  },
  {
    q: "Loss of interest in sex",
    cat: "Physical Symptoms",
  },
  {
    q: "Worrying about your health",
    cat: "Physical Symptoms",
  },
  {
    q: "Do you have any suicidal thoughts?",
    cat: "Suicidal Urges",
  },
  {
    q: "Would you like to end your life?",
    cat: "Suicidal Urges",
  },
  {
    q: "Do you have a plan for harming yourself?",
    cat: "Suicidal Urges",
  },
];

const ANSWERS = [
  [0, "Not at all"],
  [1, "Somewhat"],
  [2, "Moderately"],
  [3, "A Lot"],
  [4, "Extremely"],
];

const currentQuestion = (allQs, qIdx) => {
  return allQs[qIdx];
};

const updateAnswer = (allQs, qIdx, answer) => {
  const newFormData = [...allQs];
  const newQ = { ...allQs[qIdx] };
  newFormData[qIdx] = newQ;
  newQ.a = answer;
  return newFormData;
};

const percentCompleted = (allQs) => {
  const numCompleted = allQs.filter((x) => !!x.a);
  return Math.round((numCompleted.length / allQs.length) * 100);
};

const incStep = (allQs, qIdx) => {
  return Math.min(qIdx + 1, allQs.length);
};

const decStep = (qIdx) => {
  return Math.max(qIdx - 1, 0);
};

const scoreMeaning = (score) => {
  if (score <= 5) {
    return "No depression!";
  }
  if (score <= 10) {
    return "Normal, but unhappy";
  }
  if (score <= 25) {
    return "Mild Depression";
  }
  if (score <= 50) {
    return "Moderate depression";
  }
  if (score <= 75) {
    return "Moderate depression";
  }
  return "Extreme depression";
};

// ---
// Components

function QuestionHeader({ q }) {
  return (
    <div className="h-40 flex items-center justify-center">
      <h2 className="text-center text-2xl">{q}</h2>
    </div>
  );
}

function ProgressBar({ perc }) {
  return (
    <div className="flex bg-blue-900 h-3">
      <div className="bg-blue-600 h-3" style={{ width: `${perc}%` }}></div>
    </div>
  );
}

function Answers({ onAnswer, activeAnswer }) {
  return (
    <div className="flex flex-col items-center space-y-4">
      {ANSWERS.map((a) => {
        const [severity, label] = a;
        const isActiveAnswer = activeAnswer && activeAnswer[0] === severity;
        return (
          <button
            key={severity}
            className={`
              block w-full 
              text-left px-4 py-2 border 
              border-blue-800 text-xl rounded-md cursor-pointer
              hover:bg-gray-800 focus:outline-none focus:border-none 
              focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50
              ${isActiveAnswer ? "bg-gray-800" : null}
            `}
            onClick={(_) => onAnswer(a)}>
            {severity} - {label}
          </button>
        );
      })}
    </div>
  );
}

function DoneScreen({ score, onSave }) {
  return (
    <div className="flex justify-center h-full">
      <div className="space-y-4 flex-1">
        <div className="text-center space-y-1">
          <div className="text-gray-400">Your Score</div>
          <h1 className="text-8xl">{score}</h1>
          <div>{scoreMeaning(score)}</div>
        </div>
        <Button onClick={onSave} className="block w-full text-xl bold">
          Save
        </Button>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const user = useContext(UserContext);
  const [qIdx, setStep] = useState(0);
  const [allQs, setFormData] = useState(makeFormData());
  const history = useHistory();
  const currentStep = currentQuestion(allQs, qIdx);
  const percCompleted = percentCompleted(allQs);
  const score = calcScore(allQs);
  const isAnsweringQuestion = qIdx < allQs.length;
  const isBackValid = qIdx > 0;
  const isNextValid = currentStep && currentStep.a;
  return (
    <div className="max-w-sm mx-auto flex flex-col justify-between flex-1">
      <div className="flex-1 flex flex-col space-y-4">
        <ProgressBar perc={percCompleted} />
        <div className="px-4 space-y-4 flex-1">
          {isAnsweringQuestion ? (
            <>
              <QuestionHeader q={currentStep.q} />
              <Answers
                activeAnswer={currentStep.a}
                onAnswer={(a) => {
                  setFormData(updateAnswer(allQs, qIdx, a));
                  const nextStep = incStep(allQs, qIdx);
                  setStep(nextStep);
                }}
              />
            </>
          ) : (
            <DoneScreen
              score={score}
              onSave={() => {
                saveQuiz(user, allQs).then(() => {
                  history.push("/stats");
                });
              }}
            />
          )}
        </div>
      </div>
      <div className="px-4 mb-4 flex">
        {isBackValid && (
          <Button
            className="text-sm px-3 py-1"
            onClick={(_) => {
              setStep(decStep(qIdx));
            }}>
            Back
          </Button>
        )}
        <div className="flex-1"></div>
        {isNextValid && (
          <Button
            className="text-sm px-3 py-1"
            onClick={(_) => {
              setStep(incStep(allQs, qIdx));
            }}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
