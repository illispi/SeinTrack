import type { Component, ParentComponent } from "solid-js";

const SidePanel: ParentComponent = (props) => {
	return (
		<>
			<div class="hidden size-full min-h-screen min-w-72 grow items-start justify-end border-black border-r lg:flex">
				HELLO
			</div>
			{props.children}
			<div class="hidden h-full min-h-screen grow xl:flex" />
		</>
	);
};

export default SidePanel;
