import type { Component, Setter } from "solid-js";
import Menu from "./Menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const MenuPanel: Component<{
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}> = (props) => {
	return (
		<>
			<div class="hidden size-full min-h-screen min-w-72 grow items-start justify-end border-black lg:flex">
				<Menu />
			</div>
			<div class="flex lg:hidden">
				<Sheet onOpenChange={props.setMenuOpen} open={props.menuOpen}>
					<SheetTrigger></SheetTrigger>
					<SheetContent>
						<Menu />
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
};

export default MenuPanel;
