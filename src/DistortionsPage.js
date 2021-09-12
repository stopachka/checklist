const DISTORTIONS = [
  [
    "All or Nothing Thinking",
    <p>
      You see things in black-or-white categories. If a situation falls short of
      perfect, you see it as a total failure. When a young woman on a diet ate a
      spoonful of ice cream, she told herself, “I’ve blown my diet completely.”
      This thought upset her so much that she gobbled down an entire quart of
      ice cream!
    </p>,
  ],
  [
    "Over-generalization",
    <p>
      You see a single negative event, such as a romantic rejection or a career
      reversal, as a never-ending pattern of defeat by using words such as
      “always” or “never” when you think about it. A depressed salesman became
      terribly upset when he noticed bird dung on the windshield of his car. He
      told himself, “Just my luck! Birds are always crapping on my car!”
    </p>,
  ],
  [
    "Mental Filter",
    <p>
      You pick out a single negative detail and dwell on it exclusively, so that
      your vision of all reality becomes darkened, like the drop of ink that
      discolors a beaker of water. Example: You receive many positive comments
      about your presentation to a group of associates at work, but one of them
      says something mildly critical. You obsess about his reaction for days and
      ignore all the positive feedback.
    </p>,
  ],
  [
    "Discounting the Positive",
    <p>
      You reject positive experiences by insisting they "don\'t count." If you
      do a good job, you may tell yourself that it wasn’t good enough or that
      anyone could have done as well. Discounting the positive takes the joy out
      of life and makes you feel inadequate and unrewarded.
    </p>,
  ],
  [
    "Jumping to Conclusions",
    <>
      <p>
        You interpret things negatively when there are no facts to support your
        conclusion.
      </p>
      <ul>
        <li>
          <strong>Mind Reading</strong>: Without checking it out, you
          arbitrarily conclude that someone is reacting negatively to you.
        </li>
        <li>
          <strong>Fortune-telling:</strong> You predict that things will turn
          out badly. Before a test you may tell yourself, “I’m really going to
          blow it. What if I flunk?” If you’re depressed you may tell yourself,
          “I’ll never get better.”
        </li>
      </ul>
    </>,
  ],
  [
    "Magnification",
    <p>
      You exaggerate the importance of your problems and shortcomings, or you
      minimize the importance of your desirable qualities. This is also called
      the “binocular trick.”
    </p>,
  ],
  [
    "Emotional Reasoning",
    <p>
      You assume that your negative emotions necessarily reflect the way things
      really are: “I feel terrified about going on airplanes. It must be very
      dangerous to fly.” Or “I feel guilty. I must be a rotten person.” Or “I
      feel angry. This proves I’m being treated unfairly.” Or “I feel so
      inferior. This means I’m a second-rate person.” Or “I feel hopeless. I
      must really be hopeless."
    </p>,
  ],
  [
    "Should Statements",
    <>
      <p>
        You tell yourself that things should be the way you hoped or expected
        them to be. After playing a difficult piece on the piano, a gifted
        pianist told herself, “I shouldn’t have made so many mistakes.” This
        made her feel so disgusted that she quit practicing for several days.
        “Musts,” “oughts” and “have tos” are similar offenders.
      </p>
      <p>
        “Should statements” that are directed against yourself lead to guilt and
        frustration. Should statements that are directed against other people or
        the world in general lead to anger and frustration: “He shouldn’t be so
        stubborn and argumentative.”
      </p>
      <p>
        Many people try to motivate themselves with should and shouldn’ts, as if
        they were delinquents who had to be punished before they could be
        expected to do anything. “I shouldn’t eat that doughnut.” This usually
        doesn’t work because all these should and musts make you feel rebellious
        and you get the urge to do just the opposite. Dr. Albert Ellis has
        called this “musterbation.” I call it the “shouldy” approach to life.
      </p>
    </>,
  ],
  [
    "Labeling",
    <>
      <p>
        Labeling is an extreme form of all-or-nothing thinking. Instead of
        saying “I made a mistake,” you attach a negative label to yourself: “I’m
        a loser.” You might also label yourself “a fool” or “a failure” or “a
        jerk.” Labeling is quite irrational because you are not the same as what
        you do. Human beings exist, but “fools,” “losers,” and “jerks” do not.
        These labels are just useless abstractions that lead to anger, anxiety,
        frustration, and low self-esteem.
      </p>
      <p>
        You may also label others. When someone does something that rubs you the
        wrong way, you may tell yourself: “He’s an S.O.B.” Then you feel that
        the problem is with that person’s “character” or “essence” instead of
        with their thinking or behavior. You see them as totally bad. This makes
        you feel hostile and hopeless about improving things and leaves little
        room for constructive communication.
      </p>
    </>,
  ],
  [
    "Personalization and Blame",
    <>
      <p>
        Personalization occurs when you hold yourself personally responsible for
        an event that isn’t entirely under your control. When a woman received a
        note that her child was having difficulties at school, she told herself,
        “This shows what a bad mother I am,” instead of trying to pinpoint the
        cause of the problem so that she could be helpful to her child. When
        another woman’s husband beat her, she told herself, “If only I were
        better in bed, he wouldn’t beat me.” Personalization leads to guilt,
        shame, and feelings of inadequacy.
      </p>
      <p>
        Some people do the opposite. They blame other people or their
        circumstances for their problems, and they overlook ways that they might
        be contributing to the problem: “The reason my marriage is so lousy is
        because my spouse is totally unreasonable.” Blame usually doesn’t work
        very well because other people will resent being scapegoated and they
        will just toss the blame right back in your lap. It’s like the game of
        hot potato – no one wants to get stuck with it.
      </p>
    </>,
  ],
];

export default function DistortionsPage() {
  return (
    <div className="max-w-sm mx-auto p-4 space-y-4">
      {DISTORTIONS.map(([title, body], idx) => {
        return (
          <div>
            <h3 className="text-lg font-bold">
              {idx + 1}. {title}
            </h3>
            <div className="space-y-3">{body}</div>
          </div>
        );
      })}
    </div>
  );
}
