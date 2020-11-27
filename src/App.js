import React, { useEffect, useState } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation } from "aws-amplify";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import { listNotes } from "./graphql/queries";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";

// const notes = [
// 	{ id: 1, note: "laundry" },
// 	{ id: 2, note: "the Great Gatsby" },
// 	{ id: 3, note: "dinner" },
// ];

function App() {
	const [inputValue, setInputValue] = useState("");
	const [notes, setNotes] = useState([]);
	const [editable, setEditable] = useState({ id: 0, text: "" });
	const [hoveredId, setHoveredId] = useState(0);

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
			return 1;
		else return -1;
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
				const updatedNotes = notes.filter((note) => note.id !== deletedNoteId);
				setNotes(updatedNotes);
			})
			.catch((err) => console.error(err));
	}

	function handleMouseEnter(id) {
		setHoveredId(id);
	}

	function handleMouseLeave() {
		setHoveredId(0);
	}

	function handleToggleEdit(id, noteText) {
		setEditable({ id, text: noteText });
	}

	function handleEditNote(event) {
		setEditable({ id: editable.id, text: event.target.value });
	}

	async function handleUpdateNote(event) {
		event.preventDefault();
		const response = await API.graphql(
			graphqlOperation(updateNote, {
				input: {
					id: editable.id,
					note: editable.text,
				},
			})
		);
		const updatedNote = response.data.updateNote;
		const updatedNotes = notes.map((note) => {
			if (note.id === updatedNote.id) return updatedNote;
			else return note;
		});

		setNotes(updatedNotes);
		setEditable({ id: 0, text: "" });
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
							return (
								<div
									key={note.createdAt}
									style={{ border: "1px solid orange" }}
									onMouseEnter={() => handleMouseEnter(note.id)}
									onMouseLeave={handleMouseLeave}
								>
									{Boolean(editable.id) && editable.id == note.id ? (
										<form onSubmit={handleUpdateNote}>
											<input
												type="text"
												value={editable.text}
												onChange={handleEditNote}
											/>
											<button type="submit">update</button>
										</form>
									) : (
										<span>{note.note}</span>
									)}

									{Boolean(hoveredId) && note.id === hoveredId && (
										<button
											onClick={() => handleToggleEdit(note.id, note.note)}
										>
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
