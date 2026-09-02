import FinancialApp from "@/components/FinancialApp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Directly render the main Financial Dashboard, Simulator, and Literacy Modules
  // No user authentication logic, protected view locks, or login screens.
  return <FinancialApp />;
}
