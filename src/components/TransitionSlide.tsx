import type { ParentComponent, Setter } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionSlide: ParentComponent<{
	dir: number;
	setDifMonth?: Setter<number>;
	curMonth?: number;
	setDifYear?: Setter<number>;
	curYear?: number;
}> = (props) => {
	return (
		<Transition
			onEnter={(el, done) => {
				const a = el.animate(
					[
						{
							opacity: 0,
							transform: `translate(${props.dir * 100}px)`,
						},
						{ opacity: 1, transform: "translate(0)" },
					],
					{
						duration: 350,
						easing: "ease-out",
					},
				);

				a.finished.then(done);
			}}
			onExit={(el, done) => {
				const a = el.animate(
					[
						{
							opacity: 1,
							transform: "translate(0)",
						},
						{ opacity: 0, transform: `translate(${props.dir * -100}px)` },
					],
					{
						duration: 350,
						easing: "ease-in",
					},
				);
				a.finished.then(done);
				if (
					props.setDifMonth &&
					props.curMonth !== null &&
					props.curMonth !== undefined &&
					props.setDifYear &&
					props.curYear
				) {
					props.setDifMonth(props.curMonth);
					props.setDifYear(props.curYear);
				}
			}}
			mode="outin"
		>
			{props.children}
		</Transition>
	);
};
export default TransitionSlide;
