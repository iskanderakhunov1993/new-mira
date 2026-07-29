// Compatibility facade. Screens keep their existing imports while the data
// layer is split by responsibility under lib/client, lib/contracts and lib/demo.
export type { CycleEntry } from "@/lib/contracts/entry";
export type { MiraProfile } from "@/lib/contracts/profile";
export {
  clearHealthHistory,
  deleteLocalProfile,
  getProfile,
  saveProfile,
  syncProfileFromServer,
} from "@/lib/client/profile-api";
export { deleteEntry, saveEntry, setPeriodForDate } from "@/lib/client/entries-api";
export { deletePeriod, endPeriod, startPeriod, updatePeriod } from "@/lib/client/period-api";
export {
  deleteAssessment,
  getAssessment,
  getAssessments,
  saveAssessment,
} from "@/lib/client/assessments-api";
export { loginAccount, registerAccount, signOutAccount } from "@/lib/client/account-api";
export {
  trackProductEvent,
  type ProductEventName,
} from "@/lib/client/product-events-api";
