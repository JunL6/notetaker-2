import React, { useEffect, useState } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import "./App.css";
import { listNotes } from "./graphql/queries";
import { createNote, deleteNote } from "./graphql/mutations";

// const notes = [
// 	{ id: 1, note: "laundry" },
// 	{ id: 2, note: "the Great Gatsby" },
// 	{ id: 3, note: "dinner" },
// ];

function App() {
	const [inputValue, setInputValue] = useState("");
	const [notes, setNotes] = useState([]);

	useEffect(() => {
		fetchNotes();
	}, []);

	async function fetchNotes() {
		try {
			const result = await API.graphql(graphqlOperation(listNotes));
			setNotes(result.data.listNotes.items.sort(compareNotes));
		} catch (error) {
			console.error(error);
		}
	}

	// function fetchNotes() {
	// 	API.graphql(graphqlOperation(listNotes)).then(
	// 		(data) => console.log(data)
	// 		// console.log(data.listNotes.items)
	// 	);
	// }
	function compareNotes(a, b) {
		if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
			return -1;
		else return 1;
	}

	function addNewNote(event) {
		event.preventDefault();
		if (!inputValue) return;
		API.graphql(graphqlOperation(createNote, { input: { note: inputValue } }))
			.then((response) => {
				console.log(response);
				setInputValue("");
				/* update local array of notes */
				const newNotes = [response.data.createNote, ...notes];
				setNotes(newNotes.sort(compareNotes));
			})
			.catch((err) => console.error(err));
	}

	function handleDeleteNote(id) {
		return () => {
			API.graphql(graphqlOperation(deleteNote, { input: { id } }))
				.then((response) => {
					// console.log(response.data.deleteNote.id);
					setNotes(
						notes.filter((note) => note.id != response.data.deleteNote.id)
					);
				})
				.catch((err) => console.error(err));
		};
	}

	return (
		<div className="App">
			{console.log(notes)}
			<AmplifySignOut />
			{/* <SunnyCast /> */}
			<section>
				<h1>notetaking app</h1>
				<form onSubmit={addNewNote}>
					<input
						type="text"
						placeholder="write a note here"
						value={inputValue}
						onChange={(event) => setInputValue(event.target.value)}
					/>
					<button type="submit">Add</button>
				</form>
			</section>
			{/* note list */}
			<div>
				{notes.length > 0
					? notes.map((note) => (
							<div key={note.createdAt}>
								<li>{note.note}</li>
								<button onClick={handleDeleteNote(note.id)}>
									<span>&times;</span>
								</button>
							</div>
					  ))
					: "no notes"}
			</div>
		</div>
	);
}

export default withAuthenticator(App, { includeGreetings: true });
