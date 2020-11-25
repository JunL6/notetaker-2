import React from "react";

export default function CastCard({ img, name, jobTitle, description }) {
	return (
		<div className="flip-card">
			<div className="flip-card-inner">
				<div className="flip-card-front">
					<img
						src={img}
						alt="Avatar"
						style={{ width: "300px", height: "300px" }}
					/>
				</div>

				<div class="flip-card-back">
					<h1>{name}</h1>
					<b>{jobTitle}</b>
					<p>{description}</p>
				</div>
			</div>
		</div>
	);
}
