import { getLimitById } from "../../../../../../actions/budget-limits";
import LimitExceededClient from "./LimitExceededClient";

export default async function LimitExceededPage({ params }: { params: { limitId: string } }) {
  const limitId = params.limitId;
  const limitDetails = await getLimitById(limitId);
  console.log("Limit details:", limitDetails);

  return <LimitExceededClient limitDetails={limitDetails} />;
}
