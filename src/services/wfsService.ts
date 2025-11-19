import axios from "axios";

export async function getMonuments(): Promise<any> {
  const url = "https://ahocevar.com/geoserver/wfs";

  const response = await axios.get(url, {
    params: {
      service: "WFS",
      version: "1.1.0",
      request: "GetFeature",
      typename: "ne:ne_10m_populated_places",
      outputFormat: "application/json"
    }
  });

  return response.data;
}