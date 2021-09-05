import firebase from "firebase/app";
import Button from "./shared/Button";

export default function LoginPage() {
  return (
    <div className="px-4 py-4 space-y-4 max-w-sm mx-auto">
      <div className="text-xl font-bold">Mental Check</div>
      <div className="space-y-4">
        <p>
          I've been a big fan of David Burn's Feeling Good. This is a handy site
          for his depression checklist.
        </p>
        <p>
          If you're feeling blue, you can get a sense of the severity. The test
          will save, so you can see how your score changes over time.
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
                <a
                  href="https://stopa.io"
                  target="_blank"
                  rel="noreferrer" 
                  className="underline">
                  Stopa
                </a>{" "}
                : )
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
