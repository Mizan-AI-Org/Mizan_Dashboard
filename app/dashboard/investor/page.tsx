import DashboardPage from "@/app/dashboard/page";

export default function InvestorDashboardPage() {
  return (
    <DashboardPage searchParams={Promise.resolve({ mode: "investor" })} />
  );
}
