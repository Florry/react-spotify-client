import { API_ROOT } from "../constants/api-constants";
import HttpClient from "./HttpClient";

export default (new HttpClient(API_ROOT));

// import WsClient from "./WsClient";

// export default (new WsClient(API_ROOT));
