import { getLimitById } from "../../../../../../actions/budget-limits";
import { isAccountLimited } from "../../../../../../actions/account-limit";
import LimitExceededClient from "./LimitExceededClient";

export default async function LimitExceededPage({ params }: { params: Promise<{ limitId: string }> }) {
  const { limitId } = await params;
  const limitDetails = await getLimitById(limitId);
  const isUserAccountLimited = await isAccountLimited();

  return <LimitExceededClient limitDetails={limitDetails} isAccountLimited={isUserAccountLimited} />;
}
