import type { Component, Setter } from "solid-js";
import Menu from "./Menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const MenuPanel: Component<{
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
}> = (props) => {
	return (
		<>
			<div class="flex w-full justify-end">
				<div class="my-8 hidden min-h-screen w-11/12 max-w-lg grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 bg-white shadow-md lg:flex">
					<Menu />
				</div>
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
