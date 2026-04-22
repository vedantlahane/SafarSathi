import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
      <h1 className="text-5xl font-bold text-white tracking-tight">
        YatraX 🛡️
      </h1>
      <p className="text-slate-400 text-lg">
        AI-Powered Safety Intelligence
      </p>
      <Button variant="default" size="lg">
        Start Journey
      </Button>
    </div>
  )
}

export default App