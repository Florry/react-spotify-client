export default function getToken(request, response, next) {
	if (!request.headers.authorization) {
		response.status(401);
		response.end();
	} else
		request.accessToken = request.headers.authorization.replace("Bearer ", "");

	next();
}
