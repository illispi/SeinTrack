import { useLocation, useSearchParams } from "@solidjs/router";
import {
	createEffect,
	createSignal,
	createUniqueId,
	type ParentComponent,
	type Setter,
} from "solid-js";

const BackNav: ParentComponent<{ setOpen: Setter<boolean>; open: boolean }> = (
	props,
) => {
	const [searchParams, setSearchParams] = useSearchParams();
	const id = createUniqueId();
	const location = useLocation();

	const [prev, setPrev] = createSignal(props.open);

	createEffect(() => {
		if (props.open) {
			if (searchParams[id]) {
				setPrev(true);
			} else {
				if (!prev()) {
					setSearchParams({ [id]: true });
					// const url = new URL(window.location.href);
					// const searchParamsString = url.searchParams.toString();
					// const final = searchParamsString.replace(`&${id}=true`, "");
					// history.replaceState(null, "", `/?${final}`);
				} else {
					props.setOpen(false);
					setPrev(false);
				}
			}
		} else {
			// document.body.removeAttribute("style");
			const url = new URL(window.location.href);
			const searchParamsString = url.searchParams.toString();
			//TODO generalize this, this is hacky that doesnt scale for more than 2 deep back
			if (searchParamsString.length > 10) {
				history.replaceState(null, "", "/");
			}
			setSearchParams({ [id]: null });
			setPrev(false);
		}
	});
	return <div>{props.children}</div>;
};

export default BackNav;
