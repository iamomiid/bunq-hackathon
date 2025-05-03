import { redirect } from "next/navigation";

const redirectToDashboard = async () => {
  redirect("/dashboard");
};

export default redirectToDashboard;
