import axios from "axios";
import FormData from "form-data";

export const getAdvert = async id => {
  let data = new FormData();
  data.append("version", "1.1");
  data.append("company", process.env.PLEKTAN_COMPANY);
  data.append("access_key", process.env.PLEKTAN_ACCESS_KEY);
  data.append("access_password", process.env.PLEKTAN_KEY);
  data.append("adid", id);
  data.append("currency_id", "UAH");

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://re.plektan.com/uk/API_view/view",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };
  const response = await axios.request(config);
  if (typeof response.data !== "object") {
    return null;
  }
  const media = [];
  for (const [key, value] of Object.entries(response.data.media)) {
    if (!isNaN(key) && parseInt(key) < 10) {
      media.push(`https:${value.src}`);
    }
  }
  return {
    propertyComplex: response.data["property_complex"],
    streetId: response.data["street_id"],
    roomCount: response.data["room_count"],
    storey: response.data.storey,
    storeys: response.data.storeys,
    price: response.data.price.value,
    housestr: response.data.housestr,
    media: media,
    advertInfo: response.data["advert_info"],
    guestsRequirements: response.data["guests_requirements"],
    ownerShip: response.data.ownership,
    legalInformation: response.data["legal_information"],
    areaTotal: response.data["area_total"],
  };
};
