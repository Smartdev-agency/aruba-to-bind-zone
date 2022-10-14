import axios from "axios";

export default axios.create({
	baseURL: "https://syncfiles.emmemedia.net/dnsfromaruba",
	// withCredentials: true,
	// responseType: "json",
	headers: {
		'Content-Type': 'multipart/form-data',
	}
});
