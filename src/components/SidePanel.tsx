import type { Component, ParentComponent } from "solid-js";

const SidePanel: ParentComponent = (props) => {
	return (
		<>
			<div class="hidden lg:flex border-r border-black min-h-screen h-full w-full max-w-72">
				HELLO
			</div>
			{props.children}
			<div class="hidden 2xl:block w-full max-w-72 h-full" />
		</>
	);
};

export default SidePanel;
