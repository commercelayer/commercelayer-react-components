import CommerceLayer from "#components/auth/CommerceLayer";
import OrderContainer from "#components/orders/OrderContainer";
import { render, renderHook, waitFor, screen } from "@testing-library/react";
import { useEffect } from "react";
import type { OrderContext } from "specs/utils/context";
import useOrderContainer from "src/hooks/useOrderContainer";
import getToken from "../utils/getToken";

function HookComponent(): JSX.Element {
	const orderCtx = useOrderContainer();
	useEffect(() => {
		orderCtx.reloadOrder();
	}, [orderCtx.order]);
	if (orderCtx.order) {
		return <>{orderCtx.order?.id}</>;
	}
	return <>Hook component</>;
}

describe("useOrderContainer hook", () => {
	let token: string | undefined;
	let domain: string | undefined;
	beforeAll(async () => {
		const { accessToken, endpoint } = await getToken();
		if (accessToken !== undefined) {
			token = accessToken;
			domain = endpoint;
		}
	});
	beforeEach<OrderContext>(async (ctx) => {
		if (token != null && domain != null) {
			ctx.accessToken = token;
			ctx.endpoint = domain;
			// TODO: create a new one?
			ctx.orderId = "qQgYhvlDVM";
		}
	});
	it("useOrderContainer outside of OrderContainer", () => {
		expect(() => renderHook(() => useOrderContainer())).toThrow(
			"Cannot use `useOrderContainer` outside of <OrderContainer/>",
		);
	});
	it<OrderContext>("reload order by hook", async (ctx) => {
		render(
			<CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
				<OrderContainer orderId={ctx.orderId}>
					<HookComponent />
				</OrderContainer>
			</CommerceLayer>,
		);
		await waitFor(async () => await screen.findByText(ctx.orderId), {
			timeout: 5000,
		});
		const orderId = screen.getByText(ctx.orderId);
		expect(orderId.textContent).toEqual(ctx.orderId);
	});
});
