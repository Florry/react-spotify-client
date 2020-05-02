import { Request } from "express";

export interface ServerRequest extends Request {
	accessToken: string
}
