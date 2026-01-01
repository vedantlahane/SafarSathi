import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
export default () => {

    const [name, setName] = useState("User");
    return (
        <header className=" sticky top-0 z-20 flex items-center border-b border-gray-500 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 ring-2 ring-white/10">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </div>

          <div>
            <h1 className="text-lg font-bold text-black">SafarSathi</h1>
            <p className="text-xs text-text-secondary font-medium">
              Hello, {name}
            </p>
          </div>
        </div>
      </header>
    )
}