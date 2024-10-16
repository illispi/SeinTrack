import type { Component, ParentComponent } from "solid-js";

const SidePanel: ParentComponent = (props) => {
	return (
		<>
			<div class="hidden lg:flex grow border-r justify-end items-start border-black min-h-screen h-full w-full min-w-72">
				HELLO
			</div>
			{props.children}
			<div class="hidden xl:flex grow h-full min-h-screen" />
		</>
	);
};

export default SidePanel;
