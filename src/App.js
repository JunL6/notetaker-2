import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import "./App.css";
import SunnyCast from "./components/SunnyCast/SunnyCast";

function App() {
	return (
		<div className="App">
			<nav className="flex justify-between bb b--white-10">
				<a
					className="link white-70 hover-white no-underline flex items-center pa3"
					href=""
				>
					<svg
						className="dib h1 w1"
						data-icon="grid"
						viewBox="0 0 32 32"
						// style={{ fill: "#fff" }}
					>
						<title>Super Normal Icon Mark</title>
						<path d="M2 2 L10 2 L10 10 L2 10z M12 2 L20 2 L20 10 L12 10z M22 2 L30 2 L30 10 L22 10z M2 12 L10 12 L10 20 L2 20z M12 12 L20 12 L20 20 L12 20z M22 12 L30 12 L30 20 L22 20z M2 22 L10 22 L10 30 L2 30z M12 22 L20 22 L20 30 L12 30z M22 22 L30 22 L30 30 L22 30z"></path>
					</svg>
				</a>
				<div className="flex-grow pa3 flex items-center">
					<a className="f6 link dib  dim mr3 mr4-ns" href="#0">
						About
					</a>
					<a className="f6 link dib  dim mr3 mr4-ns" href="#0">
						Sign In
					</a>
					<a className="f6 dib  bg-animate hover-bg-white hover-black no-underline pv2 ph4 br-pill ba b--white-20">
						Sign Up
					</a>
					<a>
						<AmplifySignOut />
					</a>
				</div>
			</nav>
			notetaking app
			<SunnyCast />
		</div>
	);
}

// export default withAuthenticator(App, { includeGreetings: true });

export default App;
