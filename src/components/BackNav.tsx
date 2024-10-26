import { useSearchParams } from "@solidjs/router";
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

	const [prev, setPrev] = createSignal(props.open);

	createEffect(() => {
		if (props.open) {
			if (searchParams[id]) {
				setPrev(true);
			} else {
				if (!prev()) {
					setSearchParams({ [id]: true });
				} else {
					props.setOpen(false);
					setPrev(false);
				}
			}
		} else {
      // document.body.removeAttribute("style");
			setSearchParams({ [id]: null });
			setPrev(false);
		}
	});
	return <div>{props.children}</div>;
};

export default BackNav;
