import React from "react";
import "./SunnyCast.css";
import CastCard from "./CastCard";
import photo from "./img_avatar.png";
import img_sweet_dee from "./sweet-dee.jpg";
import img_frank from "./frank.jpg";
import img_dennis from "./dennis.jpg";

export default function SunnyCast() {
	return (
		<div>
			<CastCard
				img={img_sweet_dee}
				name="Sweet Dee"
				jobTitle="bartender"
				description={`I'm not a bird.`}
			/>
			<CastCard
				img={img_frank}
				name="Frank"
				jobTitle="sweatshop owner"
				description={`"You gotta pay him the troll toll."`}
			/>
			<CastCard
				img={img_dennis}
				name="Dennis"
				jobTitle="bar owner"
				description={`"I'm the golden god."`}
			/>
		</div>
	);
}
