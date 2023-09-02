import { Hono } from "hono"
import { login } from "./login"
import { logout } from "./logout"
import { signup } from "./signup"
import { cors } from "hono/cors"
import { validate } from "./validate"
import { uploadProfileImage } from "./user-attributes/self-upload/uploadAvatar"
import { uploadBannerImage } from "./user-attributes/self-upload/uploadBanner"
import { saveOCGeneratorResponse } from "./oc-generators/saveOCGeneratorResponse"
import { updateUserAttributes } from "./user-attributes/updateUserAttributes"
import { uploadAsset } from "./assets/uploadAsset"
import { Bindings } from "@/worker-configuration"
import { modifyAssetData } from "./assets/modifyAsset"
import { approveAsset } from "./assets/approveAsset"
import { viewOCGeneratorResponses } from "./oc-generators/viewOCGeneratorResponses"
import { followUser } from "./user-attributes/user-relations/followUser"
import { unFollowUser } from "./user-attributes/user-relations/unfollowUser"
import { deleteOCGeneratorResponse } from "./oc-generators/deleteOCGeneratorResponse"

const authRoute = new Hono<{ Bindings: Bindings }>()

authRoute.use(
	"*",
	cors({
		credentials: true,
		origin: ["https://next.wanderer.moe"],
	})
)

authRoute.post("/login", async (c) => {
	return login(c)
})

authRoute.post("/update/attributes", async (c) => {
	return updateUserAttributes(c)
})

authRoute.post("/upload/asset", async (c) => {
	return uploadAsset(c)
})

authRoute.post("/upload/avatar", async (c) => {
	return uploadProfileImage(c)
})

authRoute.post("/approve/asset/:assetIdToApprove", async (c) => {
	return approveAsset(c)
})

authRoute.post("/modify/asset/:assetIdToModify", async (c) => {
	return modifyAssetData(c)
})

authRoute.post("/upload/banner", async (c) => {
	return uploadBannerImage(c)
})

authRoute.post("/follow", async (c) => {
	return followUser(c)
})

authRoute.post("/unfollow", async (c) => {
	return unFollowUser(c)
})

authRoute.post("/signup", async (c) => {
	return signup(c)
})

authRoute.post("/oc-generator/save", async (c) => {
	return saveOCGeneratorResponse(c)
})

authRoute.get("/oc-generator/view/all", async (c) => {
	return viewOCGeneratorResponses(c)
})

authRoute.post("/oc-generator/delete", async (c) => {
	return deleteOCGeneratorResponse(c)
})

authRoute.get("/validate", async (c) => {
	return validate(c)
})

authRoute.post("/logout", async (c) => {
	return logout(c)
})

export default authRoute
