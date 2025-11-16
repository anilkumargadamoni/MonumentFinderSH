import axios from "axios";

export async function getMonuments() {
	const url =
		"https://geodienste.schleswig-holstein.de/denkmalkataster/ows?";

	const response = await axios.get(url, {
		params: {
			service: "WFS",
			version: "2.0.0",
			request: "GetFeature",
			typenames: "sh:Kulturdenkmal",
			outputFormat: "application/json"
		}
	});

	return response.data;
}