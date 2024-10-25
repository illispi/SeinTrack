import type { Component, Setter } from "solid-js";
import Menu from "./Menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const MenuPanel: Component<{
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
	selectedProjectId: number;
	setSelectedProjectId: Setter<number>;
}> = (props) => {
	return (
		<>
			<div class="flex w-full justify-end">
				<div class="my-8 hidden min-h-screen w-11/12 max-w-lg grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 bg-white shadow-md lg:flex">
					<Menu
						selectedProjectId={props.selectedProjectId}
						setSelectedProjectId={props.setSelectedProjectId}
					/>
				</div>
			</div>
			<div class="flex lg:hidden">
				<Sheet onOpenChange={props.setMenuOpen} open={props.menuOpen}>
					<SheetTrigger></SheetTrigger>
					<SheetContent>
						<Menu
							selectedProjectId={props.selectedProjectId}
							setSelectedProjectId={props.setSelectedProjectId}
						/>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
};

export default MenuPanel;
