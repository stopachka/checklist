import firebase from "firebase/app";
import Button from "./shared/Button";

function Link(props) {
  return (
    <a target="_blank" rel="noreferrer" className="underline" {...props} />
  );
}

export default function LoginPage() {
  return (
    <div className="px-4 py-4 space-y-4 max-w-sm mx-auto">
      <div className="text-xl font-bold">Mental Check</div>
      <div className="space-y-4">
        <p>
          I've been a big fan of David Burn's{" "}
          <Link href="https://www.amazon.com/Feeling-Good-New-Mood-Therapy/dp/0380810336">
            Feeling Good
          </Link>
          . If you ever find yourself in a blue mood, this book is a goldmine of
          ideas.
        </p>
        <p>
          In the book, he has a "Depression Checklist". You go through 20 or so
          questions, and get a score. This score can indiciate to you the
          severity of your mood. I made this app to make it easy to take that
          test, and to save the scores. This way, you can look over and see how
          your mood is changing over time.
        </p>
        <Button
          className="px-4 py-2 text-l"
          onClick={() => {
            firebase
              .auth()
              .signInWithRedirect(new firebase.auth.GoogleAuthProvider());
          }}>
          Sign in with Google
        </Button>
        <div className="space-y-4">
          <h2 className="text-xl font-bold">FAQ</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-bold">Why only sign in with Google?</h3>
              <p>
                This was a single-day project. May add more options in the
                future xD
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Is my data private?</h3>
              <p>
                Yes. I can of course access it, but you have my word I won’t.
                Also would never share the data with others.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Who are you?</h3>
              <p>
                <Link
                  href="https://stopa.io">
                  Stopa
                </Link>
                , founder of{" "}
                <Link href="https://consistent.fit">Consistent Fitness</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
