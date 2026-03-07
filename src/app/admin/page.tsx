import { redirect } from "next/navigation";
import { auth, signOut } from "../auth";
import { getCategories } from "@/lib/db/queries/getCategories";
import AdminDashboard from "./AdminDashboard";
import { isAdmin } from "@/lib/isAdmin";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session)) {
    redirect("/login");
  }

  const categories = await getCategories();

  return (
    <div className="px-5 my-10 max-w-5xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-center">Admin Dashboard</h1>

      <div className="rounded-lg p-6">
        <AdminDashboard categories={categories} />
      </div>

      <div className="flex justify-end">
        <form action={async () => {
          "use server";
          await signOut();
        }}>
          <Button type="submit" variant="outline">Sign Out</Button>
        </form>
      </div>
    </div>
  );
}
