import React, { useEffect, useState, useLayoutEffect } from "react";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { API, graphqlOperation, Auth } from "aws-amplify";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";

import { listNotes } from "./graphql/queries";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import {
	onCreateNote,
	onUpdateNote,
	onDeleteNote,
} from "./graphql/subscriptions";

const COMPARE_NOTES_CREATEDTIME_ASCENDING = function (a, b) {
	if (new Date(a.createdAt).getTime() < new Date(b.createdAt).getTime())
		return 1;
	else return -1;
};

const COMPARE_NOTES_CREATEDTIME_DESCENDING = function (a, b) {
	if (new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime())
		return 1;
	else return -1;
};

const COMPARE_NOTES_UPDATEDTIME_ASCENDING = function (a, b) {
	if (new Date(a.updatedAt).getTime() < new Date(b.updatedAt).getTime())
		return 1;
	else return -1;
};

const COMPARE_NOTES_UPDATEDTIME_DESCENDING = function (a, b) {
	if (new Date(a.updatedAt).getTime() > new Date(b.updatedAt).getTime())
		return 1;
	else return -1;
};

const SORTING_FUNCTIONS = [
	COMPARE_NOTES_CREATEDTIME_ASCENDING,
	COMPARE_NOTES_CREATEDTIME_DESCENDING,
	COMPARE_NOTES_UPDATEDTIME_ASCENDING,
	COMPARE_NOTES_UPDATEDTIME_DESCENDING,
];

function App() {
	const [inputValue, setInputValue] = useState("");
	const [notes, setNotes] = useState([]);
	const INITIAL_EDITABLE = { id: 0, text: "" };
	const [editable, setEditable] = useState(INITIAL_EDITABLE);
	const [hoveredId, setHoveredId] = useState(0);
	const [sortingFunctionIndex, setSortingFucntionIndex] = useState(0);
	const [userName, setUserName] = useState();

	useEffect(() => {
		getCurrentUserInfo();
		fetchNotes();
	}, []);

	useEffect(() => {
		try {
			const createNoteListener = API.graphql(
				graphqlOperation(onCreateNote, { owner: userName })
			).subscribe({
				next: (noteData) => {
					const newNote = noteData.value.data.onCreateNote;
					// const updatedNotes = [...notes, newNote];
					// setNotes(updatedNotes.sort(SORTING_FUNCTIONS[sortingFunctionIndex]));
					setNotes((prevNotes) => {
						const updatedNotes = [...prevNotes, newNote];
						return updatedNotes.sort(SORTING_FUNCTIONS[sortingFunctionIndex]);
					});
				},
			});

			return function cleanup() {
				createNoteListener.unsubscribe();
			};
		} catch (err) {
			console.error(err);
		}
	}, [notes, userName]);

	useEffect(() => {
		const deleteNoteListener = API.graphql(
			graphqlOperation(onDeleteNote, { owner: userName })
		).subscribe({
			next: (deletedNoteData) => {
				const { onDeleteNote: deletedNote } = deletedNoteData.value.data;
				// console.log(deletedNote);
				// debugger;
				setNotes((prevNotes) => {
					const updatedNotes = prevNotes.filter(
						(note) => note.id !== deletedNote.id
					);
					return updatedNotes.sort(SORTING_FUNCTIONS[sortingFunctionIndex]);
				});
			},
		});

		return function cleanup() {
			deleteNoteListener.unsubscribe();
		};
	}, [notes, userName]);

	useEffect(() => {
		const updateNoteListener = API.graphql(
			graphqlOperation(onUpdateNote, { owner: userName })
		).subscribe({
			next: (updatedNoteData) => {
				const updatedNote = updatedNoteData.value.data.onUpdateNote;
				// console.log(deletedNote);
				// debugger;

				setNotes((prevNotes) => {
					const updatedNotes = prevNotes.map((note) => {
						if (note.id === updatedNote.id) return updatedNote;
						else return note;
					});

					return updatedNotes.sort(SORTING_FUNCTIONS[sortingFunctionIndex]);
				});
			},
		});

		return function cleanup() {
			updateNoteListener.unsubscribe();
		};
	}, [notes, userName]);

	async function getCurrentUserInfo() {
		try {
			const currentUser = await Auth.currentUserInfo();
			// console.log(currentUser);
			// console.log(typeof currentUser.username);
			setUserName(currentUser.username);
		} catch (error) {
			console.error(error);
		}
	}

	async function fetchNotes() {
		try {
			const result = await API.graphql(graphqlOperation(listNotes));
			setNotes(
				result.data.listNotes.items.sort(
					SORTING_FUNCTIONS[sortingFunctionIndex]
				)
			);
		} catch (error) {
			console.error(error);
		}
	}

	function addNewNote(event) {
		event.preventDefault();
		if (!inputValue) return;
		API.graphql(graphqlOperation(createNote, { input: { note: inputValue } }))
			.then((response) => {
				// console.log(response);

				setInputValue("");
				/* update local array of notes */
				// const newNotes = [response.data.createNote, ...notes];
				// setNotes(newNotes.sort(compareNotes));
			})
			.catch((err) => console.error(err));
	}

	function handleDeleteNote(id) {
		API.graphql(graphqlOperation(deleteNote, { input: { id } }))
			.then((response) => {
				// console.log(response.data.deleteNote.id);
				// const deletedNoteId = response.data.deleteNote.id;
				// const updatedNotes = notes.filter((note) => note.id !== deletedNoteId);
				// setNotes(updatedNotes);
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
		// const updatedNote = response.data.updateNote;
		// const updatedNotes = notes.map((note) => {
		// 	if (note.id === updatedNote.id) return updatedNote;
		// 	else return note;
		// });

		// setNotes(updatedNotes);
		setEditable(INITIAL_EDITABLE);
	}

	function handleCancelEdit() {
		setEditable(INITIAL_EDITABLE);
	}

	function handleSelectSorting(event) {
		setSortingFucntionIndex(parseInt(event.target.value));
		setNotes(notes.sort(SORTING_FUNCTIONS[parseInt(event.target.value)]));
	}

	return (
		<div className="App">
			{console.log(notes)}
			{console.log(userName)}
			<AmplifySignOut />
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
			{/* sort button */}
			<div>
				<label>sort by: </label>
				<select onChange={handleSelectSorting}>
					<option value={0}>created time &uarr;</option>
					<option value={1}>created time &darr;</option>
					<option value={2}>updated time &uarr;</option>
					<option value={3}>updated time &darr;</option>
				</select>
			</div>

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
										<form
											onSubmit={handleUpdateNote}
											style={{ display: "inline-block" }}
										>
											<input
												type="text"
												value={editable.text}
												onChange={handleEditNote}
											/>
											<button type="submit">update</button>
											<button onClick={handleCancelEdit}>cancel</button>
										</form>
									) : (
										<span>{note.note}</span>
									)}

									{Boolean(hoveredId) && note.id === hoveredId && (
										<>
											<button
												onClick={() => handleToggleEdit(note.id, note.note)}
											>
												<FontAwesomeIcon icon={faPen} />
											</button>
											<button onClick={() => handleDeleteNote(note.id)}>
												<span>&times;</span>
											</button>
										</>
									)}
								</div>
							);
					  })
					: null}
			</div>
		</div>
	);
}

export default withAuthenticator(App);
