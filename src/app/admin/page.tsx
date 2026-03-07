import { redirect } from "next/navigation";
import { auth } from "../auth";
import { getCategories } from "@/lib/db/queries/getCategories";
import AdminDashboard from "./AdminDashboard";
import { isAdmin } from "@/lib/isAdmin";

export default async function AdminPage() {
  // const session = await auth();
  // if (!isAdmin(session)) {
  //   redirect("/login");
  // }

  const categories = await getCategories();

  return (
    <div className="px-5 my-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Admin Dashboard</h1>
      <AdminDashboard categories={categories} />
    </div>
  );
}
