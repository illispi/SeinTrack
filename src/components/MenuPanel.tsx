import type { Component, Setter } from "solid-js";
import Menu from "./Menu";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import BackNav from "./BackNav";

const MenuPanel: Component<{
	menuOpen: boolean;
	setMenuOpen: Setter<boolean>;
	selectedProjectId: number;
	setSelectedProjectId: Setter<number>;
}> = (props) => {
	return (
		<>
			<div class="hidden w-full justify-center xl:flex">
				<div class="z-40 my-8 hidden min-h-screen w-11/12 max-w-md grow flex-col items-center rounded-xl border border-t-4 border-gray-200 border-t-green-500 bg-white shadow-md xl:flex">
					<Menu
						selectedProjectId={props.selectedProjectId}
						setSelectedProjectId={props.setSelectedProjectId}
					/>
				</div>
			</div>
			<div class="flex lg:hidden">
				<BackNav open={props.menuOpen} setOpen={props.setMenuOpen}>
					<Sheet onOpenChange={props.setMenuOpen} open={props.menuOpen}>
						<SheetTrigger></SheetTrigger>
						<SheetContent class="w-full max-w-96 p-0">
							<div class=" flex min-h-screen grow flex-col items-center border border-t-4 border-gray-200 border-t-green-500 bg-white ">
								<Menu
									selectedProjectId={props.selectedProjectId}
									setSelectedProjectId={props.setSelectedProjectId}
								/>
							</div>
						</SheetContent>
					</Sheet>
				</BackNav>
			</div>
		</>
	);
};

export default MenuPanel;
