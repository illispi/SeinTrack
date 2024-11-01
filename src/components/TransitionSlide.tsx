import type { ParentComponent } from "solid-js";
import { Transition } from "solid-transition-group";

const TransitionSlide: ParentComponent<{ dir: number }> = (props) => {
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
						duration: 300,
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
						duration: 300,
						easing: "ease-in",
					},
				);
				a.finished.then(done);
			}}
			mode="outin"
		>
			{props.children}
		</Transition>
	);
};
export default TransitionSlide;
