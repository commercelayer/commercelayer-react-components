import CommerceLayer from "#components/auth/CommerceLayer";
import { render, renderHook, waitFor, screen } from "@testing-library/react";
import { useEffect, useState } from "react";
import useCommerceLayer from "src/hooks/useCommerceLayer";
import getToken from "../utils/getToken";
import type { SkusContext } from "specs/utils/context";

function HookComponent(): JSX.Element {
	const ctx = useCommerceLayer();
	const [sku, setSku] = useState<string | undefined>();
	useEffect(() => {
		if (ctx.sdkClient != null && sku == null) {
			ctx
				.sdkClient()
				?.skus.list({ filters: { code_eq: "BABYONBU000000E63E7412MX" } })
				.then((res) => {
					if (res.first() != null) {
						setSku(res.first()?.code);
					}
				});
		}
		return () => {
			setSku(undefined);
		};
	}, [ctx.accessToken]);
	if (sku != null) {
		return <>{sku}</>;
	}
	return <>Hook component</>;
}

describe("useCommerceLayer hook", () => {
	let token: string | undefined;
	let domain: string | undefined;
	beforeAll(async () => {
		const { accessToken, endpoint } = await getToken();
		if (accessToken !== undefined) {
			token = accessToken;
			domain = endpoint;
		}
	});
	beforeEach<SkusContext>(async (ctx) => {
		if (token != null && domain != null) {
			ctx.accessToken = token;
			ctx.endpoint = domain;
			ctx.sku = "BABYONBU000000E63E7412MX";
		}
	});
	it.skip("useCommerceLayer outside of CommerceLayer", () => {
		expect(() => renderHook(() => useCommerceLayer())).toThrow(
			"Cannot use `useCommerceLayer` outside of <CommerceLayer/>",
		);
	});
	it<SkusContext>("get sku by sdk client", async (ctx) => {
		render(
			<CommerceLayer accessToken={ctx.accessToken} endpoint={ctx.endpoint}>
				<HookComponent />
			</CommerceLayer>,
		);
		await waitFor(async () => await screen.findByText(ctx.sku), {
			timeout: 5000,
		});
		const sku = screen.getByText(ctx.sku);
		expect(sku.textContent).toEqual(ctx.sku);
	});
});
