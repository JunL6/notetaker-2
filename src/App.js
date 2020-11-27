import React, { useEffect, useState } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

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
	const [editableId, setEditableId] = useState(0);

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

	// function handleDeleteNote(id) {
	// 	return () => {
	// 		API.graphql(graphqlOperation(deleteNote, { input: { id } }))
	// 			.then((response) => {
	// 				// console.log(response.data.deleteNote.id);
	// 				const deletedNoteId = response.data.deleteNote.id;
	// 				const updatedNotes = notes.filter((note) => note.id != deletedNoteId);
	// 				setNotes(updatedNotes);
	// 			})
	// 			.catch((err) => console.error(err));
	// 	};
	// }

	function handleDeleteNote(id) {
		API.graphql(graphqlOperation(deleteNote, { input: { id } }))
			.then((response) => {
				// console.log(response.data.deleteNote.id);
				const deletedNoteId = response.data.deleteNote.id;
				const updatedNotes = notes.filter((note) => note.id != deletedNoteId);
				setNotes(updatedNotes);
			})
			.catch((err) => console.error(err));
	}

	function handleMouseEnter(id) {
		setEditableId(id);
	}

	function handleMouseLeave() {
		setEditableId(0);
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
					? notes.map((note) => {
							let editable = false;
							return (
								<div
									key={note.createdAt}
									style={{ border: "1px solid orange" }}
									onMouseEnter={() => handleMouseEnter(note.id)}
									onMouseLeave={handleMouseLeave}
								>
									{editable ? (
										<input type="text" value={note.note} />
									) : (
										<li>{note.note}</li>
									)}

									{Boolean(editableId) && note.id == editableId && (
										<button>
											<FontAwesomeIcon icon={faPen} />
										</button>
									)}

									<button onClick={() => handleDeleteNote(note.id)}>
										<span>&times;</span>
									</button>
								</div>
							);
					  })
					: "no notes"}
			</div>
		</div>
	);
}

export default withAuthenticator(App, { includeGreetings: true });
