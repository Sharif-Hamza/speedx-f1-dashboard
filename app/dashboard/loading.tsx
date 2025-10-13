export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E10600] mx-auto mb-4"></div>
        <p className="text-[#9E9E9E]">Loading dashboard...</p>
      </div>
    </div>
  )
}
